from dotenv import load_dotenv
load_dotenv()


import os
import io
import uuid
import json
import re
import sys
import subprocess
from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
from PIL import Image
import google.generativeai as genai
from google.cloud import storage
from google.generativeai import types
from google.cloud.exceptions import Forbidden


app = Flask(__name__)
CORS(app)


# --- CONFIGURATION ---


GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
   raise ValueError("Gemini API Key (GOOGLE_API_KEY) missing in .env file")


genai.configure(api_key=GOOGLE_API_KEY)


# Separate models for text and image generation
TEXT_MODEL_ID = "gemini-2.5-flash"
IMAGE_MODEL_ID = "gemini-2.5-flash-image-preview"


try:
   # Text model for text generation
   text_model = genai.GenerativeModel(TEXT_MODEL_ID)
   print(f"âœ“ Gemini Text model initialized: {TEXT_MODEL_ID}")
except Exception as e:
   print(f"âœ— Text model initialization error: {e}")
   raise


try:
   # Image model for image generation
   image_model = genai.GenerativeModel(IMAGE_MODEL_ID)
   print(f"âœ“ Gemini Image model initialized: {IMAGE_MODEL_ID}")
except Exception as e:
   print(f"âœ— Image model initialization error: {e}")
   raise


OUTPUT_DIR = "generated_images"
os.makedirs(OUTPUT_DIR, exist_ok=True)


# --- GOOGLE CLOUD STORAGE CONFIG ---


GCS_BUCKET_NAME = "amz-image-stores"


try:
   storage_client = storage.Client()
   print("âœ“ Google Cloud Storage client initialized.")
except Exception as e:
   print(f"âœ— GCS client initialization error: {e}")
   storage_client = None  # Fail gracefully


def upload_to_gcs(local_file_path, destination_blob_name):
   """
   Uploads a file to GCS, makes it public, and returns the public URL.
   """
   if not storage_client:
       raise Exception("GCS client not available")


   bucket = storage_client.bucket(GCS_BUCKET_NAME)
   blob = bucket.blob(destination_blob_name)
   try:
       print(f"DEBUG: Uploading {local_file_path} to gs://{GCS_BUCKET_NAME}/{destination_blob_name}")
       blob.upload_from_filename(local_file_path)
       gcs_public_url = blob.public_url
       print(f"âœ“ Uploaded to GCS. Public URL: {gcs_public_url}")
       return gcs_public_url
   except Forbidden:
       error_message = f"GCS Permission Denied (403): Ensure ADC user has 'Storage Admin' role for bucket '{GCS_BUCKET_NAME}'."
       print(f"âœ— GCS upload failed: {error_message}")
       raise Exception(error_message)
   except Exception as e:
       error_message = f"GCS Upload Failed: {type(e).__name__} - {str(e)}"
       print(f"âœ— GCS upload failed: {error_message}")
       raise Exception(error_message)


# --- PROMPT FUNCTIONS for IMAGE GENERATION ---


def get_prompt_amazon_main_image():
   return (
       "High-quality professional fashion product photo for an Amazon listing main image. "
       "The entire product must be shown, without being cropped, with a pure white background (RGB 255,255,255, hex #FFFFFF), "
       "and the model standing upright. "
       "Strict note: Keep the uploaded dress exactly as it is. Do not change the color, pattern, or design under any circumstances. "
       "The product must fill at least 85% but not touch the image borders. "
       "No props, no accessories, no packaging, no text, badges, graphics, or watermarks. "
       "No mannequin, From head to toe, only a human model. Sharp focus, true-to-color, professional lighting. "
       "Image must be at least 1600x1600 pixels. "
       "Category: [Category], Gender: [Gender], Age Group: [AgeGroup], Style: [Style], Subcategory: [SubCategory]"
   )


def get_prompt_amazon_product_only_image():
   return (
       "Amazon fashion category compliant product image. Present the single product, fully visible, with a pure white background (RGB 255,255,255, hex #FFFFFF). "
       "Product must fill 85%-90% of the frame but should not touch the edge. "
       "Strict note: Keep the uploaded dress exactly as it is. Do not change the color, pattern, or design under any circumstances. "
       "Do not include human body, model, props, accessories, packaging, text, logos, watermarks, badges, or additional graphics. "
       "The image must be sharp, clear, and reflect true product color and details. "
       "At least 1600x1600px resolution. "
       "Category: [Category], Gender: [Gender], Age Group: [AgeGroup], Style: [Style], Subcategory: [SubCategory]"
   )


def get_prompt_amazon_lifestyle_image():
   return (
       "Lifestyle/gallery image for Amazon fashion. Show the model wearing the product in a real-world, vibrant event or indoor setting "
       "(such as a boutique, studio, wedding, or party scene). "
       "Strict note: Keep the uploaded dress exactly as it is. Do not change the color, pattern, or design under any circumstances. "
       "The product must remain the focus, fully visible, without text, watermarks, or unrelated props. "
       "Professional, realistic lighting only. Pure white background NOT required for this type. "
       "Category: [Category], Gender: [Gender], Age Group: [AgeGroup], Style: [Style], Subcategory: [SubCategory]"
   )


def get_prompt_amazon_angle_image():
   return (
       "Amazon-compliant model image, showing a left, right, or back view. "
       "Model must be standing from head to toe, product fully in frame, at least 85% of the image, not cut off. "
       "Strict note: Keep the uploaded dress exactly as it is. Do not change the color, pattern, or design under any circumstances. "
       "No text, graphics, badges, watermarks, packaging, or unrelated props. "
       "Clean, subtle festive or indoor background permitted, but product remains clearly visible. "
       "Category: [Category], Gender: [Gender], Age Group: [AgeGroup], Style: [Style], Subcategory: [SubCategory]"
   )


def get_prompt_amazon_infographic():
   return (
       "Infographic gallery image for Amazon fashion product, showing the traditional suit centered on soft pastel (not pure white) background. "
       "Include minimalist icons and a clean Product Details sectionâ€”use minimal, readable text, clear separation, NO overlaying text on product and NO spelling errors. "
       "The product must remain the focus and fully visible. At least 1600x1600px resolution. "
       "Strict note: Keep the uploaded dress exactly as it is. Do not change the color, pattern, or design under any circumstances. "
       "No cropping, all text complete and readable, professional high-end appearance. "
       "Category: [Category], Gender: [Gender], Age Group: [AgeGroup], Style: [Style], Subcategory: [SubCategory]"
   )


PROMPT_FUNCTIONS = [
   get_prompt_amazon_main_image,
   get_prompt_amazon_product_only_image,
   get_prompt_amazon_lifestyle_image,
   get_prompt_amazon_angle_image,
   get_prompt_amazon_infographic
]


def replace_placeholders(prompt: str, attributes: dict) -> str:
   pattern = r"\[(\w+)\]"
   def replacer(match):
       key = match.group(1)
       return attributes.get(key, f"[{key}]")
   return re.sub(pattern, replacer, prompt)


# --- IMAGE GENERATION ENDPOINT ---


@app.route("/generate-image", methods=["POST"])
def generate_image_api():
   if "image" not in request.files:
       return jsonify({"error": "No image uploaded"}), 400


   file = request.files["image"]
   img_stream = io.BytesIO(file.read())
   img_stream.seek(0)
   try:
       uploaded_image = Image.open(img_stream).convert("RGB")
   except Exception as e:
       return jsonify({"error": f"Invalid image file: {str(e)}"}), 400


   try:
       style_index = int(request.form.get("style_index", -1))
   except ValueError:
       return jsonify({"error": "Invalid style_index"}), 400


   if not (0 <= style_index < len(PROMPT_FUNCTIONS)):
       return jsonify({"error": "style_index out of range"}), 400


   attributes_str = request.form.get("attributes", "{}")
   try:
       attributes = json.loads(attributes_str)
   except json.JSONDecodeError:
       return jsonify({"error": "Invalid attributes JSON"}), 400


   prompt_template = PROMPT_FUNCTIONS[style_index]()
   final_prompt = replace_placeholders(prompt_template, attributes)


   try:
       full_prompt = (
           "Transform this photo photorealistically for premium e-commerce quality. "
           f"Instructions: {final_prompt} Avoid distortion, blur, watermarks, or cropping."
       )


       response = image_model.generate_content(
           [uploaded_image, full_prompt],
           generation_config=genai.types.GenerationConfig(
               temperature=0.6, top_p=0.9, top_k=40
           ),
       )


       found_image = False
       for part in response.candidates[0].content.parts:
           if hasattr(part, "inline_data") and part.inline_data and part.inline_data.mime_type.startswith("image/"):
               image_bytes = part.inline_data.data
               img = Image.open(io.BytesIO(image_bytes))
               unique_filename = f"generated_{uuid.uuid4().hex}.jpg"
               local_path = os.path.join(OUTPUT_DIR, unique_filename)
               img.save(local_path, format='JPEG', quality=95, optimize=True)


               gcs_url = None
               try:
                   if storage_client:
                       gcs_blob_name = f"generated/{unique_filename}"
                       gcs_url = upload_to_gcs(local_path, gcs_blob_name)
                   else:
                       print("âš  GCS client not available, skipping upload")
               except Exception as gcs_error:
                   print(f"âš  GCS upload failed: {gcs_error}")


               preview_url = request.host_url.rstrip('/') + '/generated_images/' + unique_filename


               found_image = True
               return jsonify({
                   "success": True,
                   "filename": unique_filename,
                   "gcs_url": gcs_url,
                   "preview_url": preview_url,
                   "file_size": os.path.getsize(local_path),
                   "image_size": f"{img.width}x{img.height}",
                   "style_index": style_index
               }), 200


       if not found_image:
           return jsonify({"error": "No image returned from model."}), 500
   except Exception as e:
       import traceback
       print(traceback.format_exc())
       return jsonify({"error": f"Generation/Upload failed: {str(e)}"}), 500


@app.route("/generated_images/<filename>")
def serve_generated_image(filename):
   """Serve generated images securely"""
   try:
       file_path = os.path.join(OUTPUT_DIR, filename)
       if not os.path.exists(file_path):
           return jsonify({"error": "Image file not found"}), 404
       return send_file(file_path, mimetype='image/jpeg')
   except Exception as e:
       return jsonify({"error": f"Error serving image: {str(e)}"}), 500


@app.route("/api/debug-images")
def debug_images():
   """Debug endpoint to list generated images info"""
   try:
       files = os.listdir(OUTPUT_DIR)
       file_info = []
       for file in files:
           file_path = os.path.join(OUTPUT_DIR, file)
           file_info.append({
               'name': file,
               'size': os.path.getsize(file_path) if os.path.exists(file_path) else 0,
               'exists': os.path.exists(file_path)
           })
       return jsonify({
           "output_dir": OUTPUT_DIR,
           "absolute_path": os.path.abspath(OUTPUT_DIR),
           "files": file_info
       })
   except Exception as e:
       return jsonify({"error": str(e)}), 500


# --- TEXT GENERATION HELPERS ---


def create_base_prompt(subcategory, product_details, task_type):
   if task_type == 'name':
       instruction = "TASK: Write exactly one labeled line: Product Name: [title here]"
   else:
       instruction = "TASK: Write exactly one labeled line: Product Description: [description here]"
   return f"""
You are an expert Amazon e-commerce copywriter specializing in Clothing.
Generate a {'product title' if task_type == 'name' else 'product description'} based on the provided details.
{instruction}


Available Product Information:
Subcategory: {subcategory}
{product_details if product_details else 'No additional details provided'}


IMPORTANT:
- For title: Max 200 characters, include key features
- For description: Max 2000 characters, focus on material, fit, and benefits
- Use factual information only from the provided details
- If details are limited, create a professional generic description
- No promotional language, be factual and descriptive
- End description with a complete sentence


EXAMPLES:
Even with minimal information, create professional output:


Input:
Subcategory: T-Shirt
Brand: Generic Brand
Material: Cotton


Output for title:
Product Name: Generic Brand Cotton T-Shirt | Comfortable Casual Wear


Output for description:
Product Description: This cotton t-shirt from Generic Brand offers comfortable everyday wear. Made from soft cotton material, it provides breathability and ease of movement. The classic design makes it suitable for various casual occasions.


Subcategory: {subcategory}
Details: {product_details if product_details else 'Basic clothing item'}
"""


def call_gemini(prompt, max_tokens):
   try:
       response = text_model.generate_content(
           prompt,
           generation_config=types.GenerationConfig(
               temperature=0.8,
               max_output_tokens=max_tokens,
           ),
       )
       if not response.candidates:
           return "Generation Failed: Model returned no candidates/output."


       candidate = response.candidates[0]
       finish_reason = candidate.finish_reason


       FINISH_REASON_SAFETY = 2
       FINISH_REASON_STOP = 1


       if finish_reason == FINISH_REASON_SAFETY:
           blocked_category_name = ""
           if candidate.safety_ratings:
               try:
                   blocked_category_name = candidate.safety_ratings[0].category.name
               except AttributeError:
                   blocked_category_name = f"Code {candidate.safety_ratings[0].category}"
           return f"Generation Failed: Output Blocked by Safety Filters (Finish Reason: SAFETY). Blocked Category: {blocked_category_name}"


       if finish_reason == FINISH_REASON_STOP and hasattr(response, "text") and response.text:
           return response.text.strip()


       return "Generation Failed: Model stopped with non-success reason."
   except Exception as e:
       return f"Generation Failed: API Error. {type(e).__name__} - {str(e)}"


def generate_product_name(subcategory, product_details):
   prompt = create_base_prompt(subcategory, product_details, 'name')
   raw_output = call_gemini(prompt, 2000)
   label = "Product Name:"
   if raw_output.startswith(label):
       return raw_output[len(label):].strip()
   return raw_output


def generate_product_description(subcategory, product_details):
   prompt = create_base_prompt(subcategory, product_details, 'description')
   raw_output = call_gemini(prompt, 2000)
   label = "Product Description:"
   if raw_output.startswith(label):
       return raw_output[len(label):].strip()
   return raw_output


# --- TEXT GENERATION ENDPOINT ---


@app.route('/api/generate-title-description', methods=['POST'])
def generate_title_description():
   try:
       data = request.get_json()
       print(f"ðŸ“ Received text generation request: {data}")


       if not data:
           return jsonify({'success': False, 'error': 'No data provided'}), 400


       subcategory = data.get('subcategory', '')
       task_type = data.get('type', 'title')


       product_details_lines = []


       for k, v in data.items():
           if k not in ('subcategory', 'type') and v is not None:
               cleaned_v = str(v).strip()
               if cleaned_v and cleaned_v != 'N/A' and cleaned_v != 'null':
                   product_details_lines.append(f"{k}: {cleaned_v}")


       product_details = "\n".join(product_details_lines)


       print(f"ðŸ” Processed data - Subcategory: '{subcategory}', Details lines: {len(product_details_lines)}")
       print(f"ðŸ“‹ Product details: {product_details}")


       if not subcategory:
           if 'Generic Name' in data:
               subcategory = data.get('Generic Name', '')
           elif 'Product Type' in data:
               subcategory = data.get('Product Type', '')
           elif 'Category' in data:
               subcategory = data.get('Category', '')


       if not subcategory:
           subcategory = "Clothing Item"
           print("âš  No subcategory found, using default")


       if not product_details and len(product_details_lines) == 0:
           print("âœ— No valid product details found after cleaning")
           minimal_details = []
           for k, v in data.items():
               if k not in ('subcategory', 'type') and v:
                   minimal_details.append(f"{k}: {v}")


           if minimal_details:
               product_details = "\n".join(minimal_details)
               print(f"âš¡ Using minimal details: {product_details}")
           else:
               return jsonify({
                   'success': False,
                   'error': 'Please provide at least some product details like Brand, Material, Fit, etc.'
               }), 400


       print(f"âœ“ Final - Subcategory: '{subcategory}', Details count: {len(product_details_lines)}")


       if task_type == 'title':
           generated_title = generate_product_name(subcategory, product_details)
           if generated_title.startswith("Generation Failed:"):
               return jsonify({'success': False, 'error': generated_title}), 500
           return jsonify({'success': True, 'generated_title': generated_title})


       elif task_type == 'description':
           generated_description = generate_product_description(subcategory, product_details)
           if generated_description.startswith("Generation Failed:"):
               return jsonify({'success': False, 'error': generated_description}), 500
           return jsonify({'success': True, 'generated_description': generated_description})


       else:
           return jsonify({'success': False, 'error': 'Unknown type specified'}), 400


   except Exception as e:
       import traceback
       print(traceback.format_exc())
       return jsonify({'success': False, 'error': f'Internal server error: {str(e)}'}), 500




if __name__ == "__main__":
   app.run(host="0.0.0.0", port=5000, debug=True)



