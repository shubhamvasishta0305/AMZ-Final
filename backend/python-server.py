from dotenv import load_dotenv
load_dotenv()

import os
import io
import uuid
from datetime import datetime
import json
import re
import subprocess
import sys
from flask import Flask, request, jsonify, send_from_directory, send_file


import gspread
from google.oauth2.service_account import Credentials

def connect_to_sheet():
    try:
        scopes = [
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive"
        ]
        creds = Credentials.from_service_account_file("service_account.json", scopes=scopes)
        client = gspread.authorize(creds)
        sheet = client.open("UserCredentials").worksheet("Data")
        print("✅ Connected to Google Sheet: UserCredentials → Data")
        return sheet
    except Exception as e:
        print(f"❌ Error connecting to Google Sheets: {e}")
        raise




import uuid
import smtplib
from email.mime.text import MIMEText
from threading import Thread
import time
import requests

def send_reset_email(email, token):
    """
    Sends reset email using Google Apps Script Web App.
    """
    try:
        apps_script_url = "https://script.google.com/macros/s/AKfycbwILFRXaL-mo7Gr7IH5HujSkN3vxYytYr_4097xh26C4EsoK-nYHFThaHKx3T5oZmjk/exec"
        payload = {"email": email, "token": token}

        response = requests.post(apps_script_url, json=payload)
        response.raise_for_status()

        result = response.json()
        if result.get("success"):
            print(f"✅ Reset email sent successfully to {email}")
        else:
            print(f"⚠️ Apps Script responded with error: {result.get('error')}")
    except Exception as e:
        print(f"❌ Error sending reset email via Apps Script: {e}")




from PIL import Image
import google.generativeai as genai
from google.cloud import storage
from google.generativeai import types
from google.cloud.exceptions import Forbidden

from flask_cors import CORS

app = Flask(__name__)

# ✅ Enable CORS properly for your frontend
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)






@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        resp = app.make_default_options_response()
        headers = resp.headers

        headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
        headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS, PUT, DELETE"
        headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        headers["Access-Control-Allow-Credentials"] = "true"

        return resp


# ============================================
# ✅ GOOGLE SHEET LOGIN CONFIGURATION (NEW)
# ============================================

# Define the scope for Google Sheets access
SHEET_SCOPE = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]

# Load credentials from service account file (must exist in same folder)
SERVICE_ACCOUNT_FILE = "service_account.json"  # or your file name
SHEET_NAME = "UserCredentials"                 # your Google Sheet name
TAB_NAME = "Data"                              # your tab name

try:
    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive"
    ]
    creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=scopes)
    client = gspread.authorize(creds)

    sheet = client.open(SHEET_NAME).worksheet(TAB_NAME)
    print(f"✅ Connected to Google Sheet: {SHEET_NAME} → {TAB_NAME}")

except Exception as e:
    print(f"❌ Error connecting to Google Sheets: {e}")
    sheet = None

@app.route("/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    print("Incoming Login Request:", email, password)

    if not email or not password:
        return jsonify({"success": False, "error": "Email and password are required"}), 400

    try:
        records = sheet.get_all_records()

        print("All Sheet Records:", records)


        for row in records:
            if row.get("Email", "").strip().lower() == email.strip().lower():
                if str(row.get("Password")).strip() == str(password).strip():
                    first_login = str(row.get("FirstLogin", "")).strip().lower()
                    if first_login in ["yes", "true", "1"]:
                        return jsonify({
                            "success": True,
                            "first_time": True,
                            "message": "First-time login. Please change password."
                        })
                    else:
                        return jsonify({"success": True, "first_time": False})
                else:
                    return jsonify({"success": False, "error": "Incorrect password"}), 401
        return jsonify({"success": False, "error": "User not found"}), 404

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email')

        if not email:
            return jsonify({"error": "Email is required"}), 400

        records = sheet.get_all_records()

        # Find user row
        for i, row in enumerate(records, start=2):
            if row['Email'].strip().lower() == email.strip().lower():
                # Ensure columns exist
                headers = sheet.row_values(1)
                if "Password Requested by User" not in headers:
                    sheet.update_cell(1, len(headers)+1, "Password Requested by User")
                    headers.append("Password Requested by User")

                if "Approve" not in headers:
                    sheet.update_cell(1, len(headers)+1, "Approve")
                    headers.append("Approve")

                col_request = headers.index("Password Requested by User") + 1
                sheet.update_cell(i, col_request, "Yes")

                # Start monitoring for admin approval asynchronously
                Thread(target=monitor_admin_approval, args=(email, i, headers)).start()

                return jsonify({"message": "Request noted. Please contact your admin."}), 200

        return jsonify({"error": "Email not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def monitor_admin_approval(email, row_index, headers):
    """Background monitor for admin approval"""
    try:
        print(f"🔍 Monitoring approval for {email}...")
        col_approve = headers.index("Approve") + 1

        for _ in range(20):  # 20×30s = 10 mins max wait
            cell_value = sheet.cell(row_index, col_approve).value
            if cell_value and cell_value.strip().lower() in ["yes", "approved", "approve"]:
                print(f"✅ Admin approved password reset for {email}")
                token = str(uuid.uuid4())
                col_token = None

                if "Reset Token" not in headers:
                    sheet.update_cell(1, len(headers)+1, "Reset Token")
                    headers.append("Reset Token")

                col_token = headers.index("Reset Token") + 1
                sheet.update_cell(row_index, col_token, token)

                send_reset_email(email, token)
                print(f"📧 Reset email sent to {email}")
                return
            time.sleep(30)

        print(f"⏰ Timeout waiting for admin approval for {email}")
    except Exception as e:
        print(f"❌ monitor_admin_approval error: {e}")




@app.route("/change-password", methods=["POST"])
def change_password():
    global sheet  # ✅ Move this here, to the top!

    try:
        if sheet is None:
            # reconnect if the sheet wasn't initialized at startup
            creds = ServiceAccountCredentials.from_json_keyfile_name(SERVICE_ACCOUNT_FILE, SHEET_SCOPE)
            client = gspread.authorize(creds)
            sheet = client.open(SHEET_NAME).sheet1

        data = request.get_json()
        email = data.get("email")
        new_password = data.get("new_password")

        if not email or not new_password:
            return jsonify({"status": "error", "message": "Missing email or password"}), 400

        # Get all records
        records = sheet.get_all_records()

        # Find user row and update
        for i, row in enumerate(records, start=2):  # start=2 because row 1 = header
            if row.get("Email", "").strip().lower() == email.strip().lower():
                sheet.update_acell(f"B{i}", new_password)  # B = Password
                sheet.update_acell(f"D{i}", "No")          # D = FirstLogin
                print(f"✅ Password updated for {email}")
                return jsonify({"status": "updated"}), 200

        return jsonify({"status": "error", "message": "User not found"}), 404

    except Exception as e:
        print("❌ Error changing password:", e)
        return jsonify({"status": "error", "message": str(e)}), 500



        # --- Connect to Google Sheet ---
        scopes = ["https://www.googleapis.com/auth/spreadsheets","https://www.googleapis.com/auth/drive"]
        creds = Credentials.from_service_account_file("service_account.json", scopes=scopes)
        client = gspread.authorize(creds)

        sheet = client.open("UserCredentials").worksheet("Data")  # 👈 your sheet name + tab
        records = sheet.get_all_records()

        # --- Find user and update password ---
        for i, row in enumerate(records, start=2):  # start=2 to skip header row
            if row["Email"].strip().lower() == email.strip().lower():
                sheet.update_acell(f"B{i}", new_password)   # Column B → Password
                sheet.update_acell(f"D{i}", "No")           # Column D → FirstLogin
                return jsonify({"status": "updated"})

        return jsonify({"status": "error", "message": "User not found"}), 404

    except Exception as e:
        print("Error changing password:", e)
        return jsonify({"status": "error", "message": str(e)}), 500







# --- CONFIGURATION ---
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
   raise ValueError("Gemini API Key (GOOGLE_API_KEY) missing in .env file")

genai.configure(api_key=GOOGLE_API_KEY)
FLASH_IMAGE_MODEL_ID = "gemini-2.5-flash-image-preview"

try:
   image_model = genai.GenerativeModel(FLASH_IMAGE_MODEL_ID)
   print(f"✅ Gemini Image model initialized: {FLASH_IMAGE_MODEL_ID}")
except Exception as e:
   print(f"❌ Model initialization error: {e}")
   raise

OUTPUT_DIR = "generated_images"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# --- GOOGLE CLOUD STORAGE CONFIG ---
GCS_BUCKET_NAME = "amz-image-stores"

try:
   storage_client = storage.Client()
   print("✅ Google Cloud Storage client initialized.")
except Exception as e:
   print(f"❌ GCS client initialization error: {e}")
   storage_client = None

def upload_to_gcs(local_file_path, destination_blob_name):
   """
   Uploads file to GCS, makes it public, and returns the public URL.
   """
   if not storage_client:
       raise Exception("GCS client not available")
       
   try:
       bucket = storage_client.bucket(GCS_BUCKET_NAME)
   except NameError:
       raise Exception("GCS client not available. Check startup logs.")
   
   blob = bucket.blob(destination_blob_name)
   
   try:
       print(f"DEBUG: Attempting to upload {local_file_path} to gs://{GCS_BUCKET_NAME}/{destination_blob_name}")
       blob.upload_from_filename(local_file_path)
       gcs_public_url = blob.public_url
       print(f"✅ Uploaded to GCS. Public URL: {gcs_public_url}")
       return gcs_public_url
       
   except Forbidden as e:
       error_message = f"GCS Permission Denied (403): User lacks permission to upload or set public ACLs on bucket '{GCS_BUCKET_NAME}'. Ensure the ADC user has 'Storage Admin' role."
       print(f"❌ GCS Upload FAILED: {error_message}")
       raise Exception(error_message)
   except Exception as e:
       error_message = f"GCS Upload Failed: {type(e).__name__} - {str(e)}"
       print(f"❌ GCS Upload FAILED: {error_message}")
       raise Exception(error_message)

# --- SCRAPING ENDPOINT ---
@app.route('/api/scrape-product', methods=['POST'])
def scrape_product():
    """
    Endpoint to scrape product data from Amazon URL
    """
    try:
        data = request.get_json()
        if not data or 'url' not in data:
            return jsonify({'success': False, 'error': 'URL parameter is required'}), 400
        
        url = data['url']
        print(f"🕷️ Received scraping request for URL: {url}")
        
        # Get the directory where this script is located
        current_dir = os.path.dirname(os.path.abspath(__file__))
        scraper_path = os.path.join(current_dir, 'scraper.py')
        
        # If scraper.py doesn't exist in the same directory, try to find it
        if not os.path.exists(scraper_path):
            # Try to find the scraper in the current working directory
            scraper_path = 'scraper.py'
            if not os.path.exists(scraper_path):
                return jsonify({
                    'success': False, 
                    'error': 'Scraper script not found. Please ensure scraper.py is in the same directory as the Flask app.'
                }), 500
        
        # Run the scraper as a subprocess
        try:
            print(f"🔍 Running scraper: {scraper_path}")
            result = subprocess.run(
                [sys.executable, scraper_path, url],
                capture_output=True,
                text=True,
                timeout=60  # 60 second timeout
            )
            
            if result.returncode == 0:
                # Parse the JSON output from the scraper
                scraped_data = json.loads(result.stdout)
                print(f"✅ Scraping completed successfully")
                return jsonify(scraped_data)
            else:
                error_msg = result.stderr or "Scraper failed without error message"
                print(f"❌ Scraper error: {error_msg}")
                return jsonify({
                    'success': False, 
                    'error': f'Scraper failed: {error_msg}'
                }), 500
                
        except subprocess.TimeoutExpired:
            print(f"⏰ Scraper timeout for URL: {url}")
            return jsonify({
                'success': False, 
                'error': 'Scraping timed out. Please try again.'
            }), 500
        except Exception as e:
            print(f"❌ Scraper subprocess error: {str(e)}")
            return jsonify({
                'success': False, 
                'error': f'Scraper execution failed: {str(e)}'
            }), 500
            
    except Exception as e:
        print(f"❌ Scraping endpoint error: {str(e)}")
        return jsonify({
            'success': False, 
            'error': f'Internal server error: {str(e)}'
        }), 500

# --- DEBUG ENDPOINT ---
@app.route("/api/debug-images")
def debug_images():
    """Debug endpoint to check generated images"""
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

# ---- AMAZON-OPTIMIZED PROMPT FUNCTIONS ----
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
       "Include minimalist icons and a clean Product Details section—use minimal, readable text, clear separation, NO overlaying text on product and NO spelling errors. "
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
   if file.filename == '':
       return jsonify({"error": "No file selected"}), 400

   try:
       img_stream = io.BytesIO(file.read())
       img_stream.seek(0)
       uploaded_image = Image.open(img_stream).convert("RGB")
       print(f"✅ Image loaded successfully: {file.filename}, size: {uploaded_image.size}")
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

       print(f"🎨 Generating image with prompt: {final_prompt}")
       print(f"🎨 Style index: {style_index}, Attributes: {attributes}")
       
       response = image_model.generate_content(
           [uploaded_image, full_prompt],
           generation_config=genai.types.GenerationConfig(
               temperature=0.6, top_p=0.9, top_k=40
           ),
       )

       found_image = False
       if response.candidates and response.candidates[0].content.parts:
           for part in response.candidates[0].content.parts:
               if hasattr(part, "inline_data") and part.inline_data and part.inline_data.mime_type.startswith("image/"):
                   image_bytes = part.inline_data.data
                   img = Image.open(io.BytesIO(image_bytes))
                   
                   print(f"✅ Generated image size: {img.size}")
                   
                   # Save the image
                   try:
                       unique_filename = f"style_{style_index}_{uuid.uuid4().hex}.jpg"
                       local_path = os.path.join(OUTPUT_DIR, unique_filename)
                       
                       # Ensure the image is in RGB mode
                       if img.mode != 'RGB':
                           img = img.convert('RGB')
                       
                       # Save as JPEG
                       img.save(local_path, format='JPEG', quality=95, optimize=True)
                       
                       # Verify the file was saved
                       if os.path.exists(local_path):
                           file_size = os.path.getsize(local_path)
                           print(f"✅ Image saved successfully: {local_path} ({file_size} bytes)")
                           
                           # Try to upload to GCS, but always provide local URL
                           gcs_url = None
                           try:
                               if storage_client:
                                   gcs_blob_name = f"generated/{unique_filename}"
                                   gcs_url = upload_to_gcs(local_path, gcs_blob_name)
                                   print(f"✅ Uploaded to GCS: {gcs_url}")
                               else:
                                   print("⚠️ GCS client not available, skipping upload")
                           except Exception as gcs_error:
                               print(f"⚠️ GCS upload failed: {gcs_error}")
                           
                           found_image = True
                           return jsonify({
                               "success": True,
                               "filename": unique_filename,
                               "gcs_url": gcs_url,
                               "local_url": f"http://localhost:5000/generated_images/{unique_filename}",
                               "file_size": file_size,
                               "image_size": f"{img.width}x{img.height}",
                               "style_index": style_index
                           }), 200
                       else:
                           print(f"❌ Failed to save image: {local_path}")
                           return jsonify({"error": "Failed to save generated image"}), 500
                           
                   except Exception as save_error:
                       print(f"❌ Error saving image: {save_error}")
                       import traceback
                       print(traceback.format_exc())
                       return jsonify({"error": f"Failed to save image: {str(save_error)}"}), 500

       if not found_image:
           print("❌ No image found in response from Gemini")
           if hasattr(response, 'prompt_feedback'):
               print(f"🔍 Prompt feedback: {response.prompt_feedback}")
           return jsonify({"error": "No image returned from model. Possibly blocked by safety filters."}), 500

   except Exception as e:
       import traceback
       print(f"❌ Image generation error: {str(e)}")
       print(traceback.format_exc())
       return jsonify({"error": f"Generation failed: {str(e)}"}), 500

@app.route("/generated_images/<filename>")
def serve_generated_image(filename):
    """Serve generated images with proper error handling"""
    try:
        file_path = os.path.join(OUTPUT_DIR, filename)
        
        # Check if file exists
        if not os.path.exists(file_path):
            print(f"❌ Image file not found: {file_path}")
            return jsonify({"error": "Image file not found"}), 404
            
        print(f"✅ Serving image: {file_path}")
        return send_file(file_path, mimetype='image/jpeg')
        
    except Exception as e:
        print(f"❌ Error serving image {filename}: {str(e)}")
        return jsonify({"error": f"Error serving image: {str(e)}"}), 500

# --- TEXT GENERATION FUNCTIONS ---
def create_base_prompt(subcategory, product_details, task_type):
  if task_type == 'name':
      instruction = "TASK: Write exactly one labeled line: Product Name: [title here]"
  else:
      instruction = "TASK: Write exactly one labeled line: Product Description: [description here]"
  
  # More flexible base prompt that handles minimal data
  return f"""
You are an expert Amazon e-commerce copywriter specializing in Clothing.
Generate a { 'product title' if task_type == 'name' else 'product description' } based on the provided details.
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
      text_model = genai.GenerativeModel("gemini-2.5-flash")
      response = text_model.generate_content(
          prompt,
          generation_config=types.GenerationConfig(
              temperature=0.8,
              max_output_tokens=max_tokens,
          ),
      )
     
      # Robust check for output and finish reason
      if not response.candidates:
          return "Generation Failed: Model returned no candidates/output."

      candidate = response.candidates[0]
      finish_reason = candidate.finish_reason
     
      # Define the finish reasons using integer values for stability
      FINISH_REASON_SAFETY = 2
      FINISH_REASON_STOP = 1

      # Check for safety block using the integer value (2)
      is_safety_blocked = (finish_reason == FINISH_REASON_SAFETY)
     
      if is_safety_blocked:
          safety_info = ""
          if candidate.safety_ratings:
              try:
                  blocked_category_name = candidate.safety_ratings[0].category.name
              except AttributeError:
                  blocked_category_name = f"Code {candidate.safety_ratings[0].category}"
                 
              safety_info = f" Blocked Category: {blocked_category_name}"

          return f"Generation Failed: Output Blocked by Safety Filters (Finish Reason: SAFETY).{safety_info}"
     
      # Successful completion check (STOP is usually 1)
      if finish_reason == FINISH_REASON_STOP and hasattr(response, "text") and response.text:
          return response.text.strip()
     
      # Check for other non-successful stops
      if finish_reason != FINISH_REASON_STOP:
          try:
              finish_reason_name = types.FinishReason(finish_reason).name
          except (ValueError, AttributeError):
              finish_reason_name = f"Code {finish_reason}"
             
          return f"Generation Failed: Model stopped with reason: {finish_reason_name}."
         
      # Last resort check for empty text
      return "Generation Failed: Model returned no valid text parts (likely due to invalid input data or internal block)."
     
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
    print(f"📝 Received text generation request: {data}")
    
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400

    subcategory = data.get('subcategory', '')
    task_type = data.get('type', 'title')

    # Robustly creating product_details while being more permissive
    product_details_lines = []
    
    # Include all fields except type and subcategory
    for k, v in data.items():
        if k not in ('subcategory', 'type') and v is not None:
            # More permissive cleaning - only remove extreme whitespace
            cleaned_v = str(v).strip()
            if cleaned_v and cleaned_v != 'N/A' and cleaned_v != 'null':
                product_details_lines.append(f"{k}: {cleaned_v}")
              
    product_details = "\n".join(product_details_lines)
    
    print(f"🔍 Processed data - Subcategory: '{subcategory}', Details lines: {len(product_details_lines)}")
    print(f"📋 Product details: {product_details}")

    # More flexible validation
    if not subcategory:
        # Try to extract subcategory from other fields if not provided
        if 'Generic Name' in data:
            subcategory = data.get('Generic Name', '')
        elif 'Product Type' in data:
            subcategory = data.get('Product Type', '')
        elif 'Category' in data:
            subcategory = data.get('Category', '')
    
    # If still no subcategory, use a default
    if not subcategory:
        subcategory = "Clothing Item"
        print("⚠️ No subcategory found, using default")

    # Require at least some product details
    if not product_details and len(product_details_lines) == 0:
        print("❌ No valid product details found after cleaning")
        # Try to use a minimal set of details
        minimal_details = []
        for k, v in data.items():
            if k not in ('subcategory', 'type') and v:
                minimal_details.append(f"{k}: {v}")
        
        if minimal_details:
            product_details = "\n".join(minimal_details)
            print(f"🔄 Using minimal details: {product_details}")
        else:
            return jsonify({
                'success': False, 
                'error': 'Please provide at least some product details like Brand, Material, Fit, etc.'
            }), 400

    print(f"✅ Final - Subcategory: '{subcategory}', Details count: {len(product_details_lines)}")
     
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
      print(f"❌ Error in text generation endpoint: {str(e)}")
      import traceback
      print(traceback.format_exc())
      return jsonify({'success': False, 'error': f'Internal server error: {str(e)}'}), 500
  





# ============================================================
# ✅ ADD THIS FIXED ENDPOINT FOR /reset-password (CORS + email)
# ============================================================

@app.route("/reset-password", methods=["POST"])
def reset_password():
    try:
        data = request.get_json()
        email = data.get("email")

        if not email:
            return jsonify({"error": "Email required"}), 400

        sheet = connect_to_sheet()
        rows = sheet.get_all_records()

        for i, row in enumerate(rows, start=2):  # skip header
            if row["Email"].strip().lower() == email.strip().lower():
                approve_status = str(row.get("Approve", "")).strip().lower()

                # Step 1️⃣: If not approved yet — just mark request
                if approve_status in ("", "no", "pending"):
                    sheet.update_acell(f"E{i}", "Yes")  # Password Requested by User
                    sheet.update_acell(f"F{i}", "Pending")  # Approve
                    return jsonify({
                        "success": True,
                        "pending_approval": True,
                        "message": "Request noted. Wait for admin approval."
                    }), 200

                # Step 2️⃣: If approved — send reset email only once
                if approve_status == "yes":
                    reset_token = str(uuid.uuid4())
                    sheet.update_acell(f"H{i}", datetime.now().strftime("%m/%d/%Y"))  # Last Emailed
                    sheet.update_acell(f"I{i}", reset_token)  # Reset Token
                    sheet.update_acell(f"F{i}", "Done")  # mark approval as completed

                    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
                    token = str(uuid.uuid4())

                    reset_link = f"{FRONTEND_URL}/reset-password?token={token}&email={email}"
                    send_reset_email(email, reset_link)

                    return jsonify({
                        "success": True,
                        "message": "Reset email sent successfully!"
                    }), 200

                # Step 3️⃣: Already handled state
                if approve_status == "done":
                    return jsonify({
                        "success": False,
                        "message": "Reset link already sent."
                    }), 200

                return jsonify({"error": "Invalid approval state"}), 400

        return jsonify({"error": "Email not found"}), 404

    except Exception as e:
        print(f"❌ Error in /reset-password: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


# -----------------------
# Update password with token
# -----------------------
@app.route("/reset-password/<token>", methods=["POST"])
def update_password(token):
    try:
        data = request.get_json()
        new_password = data.get("password")

        if not new_password:
            return jsonify({"success": False, "error": "Password required"}), 400

        sheet = connect_to_sheet()
        rows = sheet.get_all_records()

        for i, row in enumerate(rows, start=2):
            if str(row.get("Reset Token", "")).strip() == token.strip():
                sheet.update_acell(f"B{i}", new_password)
                sheet.update_acell(f"I{i}", "")  # clear token
                sheet.update_acell(f"E{i}", "No")  # reset request flag
                sheet.update_acell(f"F{i}", "No")  # reset approval

                return jsonify({
                    "success": True,
                    "message": "Password updated successfully!"
                }), 200

        return jsonify({"success": False, "error": "Invalid or expired token"}), 400

    except Exception as e:
        print(f"❌ Error in /reset-password/<token>: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
    

    # -----------------------
# Common endpoint for password updates
# Handles both first-time and reset-password flows
# -----------------------
# -----------------------
# Common endpoint for password updates
# Handles both first-time and reset-password flows
# -----------------------
@app.route("/update-password", methods=["POST"])
def update_password_common():
    try:
        data = request.get_json()
        email = data.get("email")
        new_password = data.get("password")
        token = data.get("token")

        if not email or not new_password:
            return jsonify({"success": False, "error": "Email and password required"}), 400

        sheet = connect_to_sheet()
        rows = sheet.get_all_records()

        for i, row in enumerate(rows, start=2):
            # Case 1️⃣: Reset password flow → verify token
            if token and str(row.get("Reset Token", "")).strip() == str(token).strip():
                sheet.update_acell(f"B{i}", new_password)
                sheet.update_acell(f"I{i}", "")  # clear token
                sheet.update_acell(f"E{i}", "No")
                sheet.update_acell(f"F{i}", "No")
                return jsonify({"success": True, "message": "Password updated successfully"}), 200

            # Case 2️⃣: First-time login → no token, just email
            if not token and row["Email"].strip().lower() == email.strip().lower():
                sheet.update_acell(f"B{i}", new_password)
                sheet.update_acell(f"D{i}", "No")  # reset FirstLogin to No
                return jsonify({"success": True, "message": "Password set successfully"}), 200

        return jsonify({"success": False, "error": "Invalid email or token"}), 400

    except Exception as e:
        print(f"❌ Error in /update-password: {e}")
        return jsonify({"success": False, "error": str(e)}), 500




# -----------------------
# Run server
# -----------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)