import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
import google.generativeai as genai
from google.generativeai import types
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])  # CORRECT CORS SETUP

# Load Gemini API key from .env file
load_dotenv()
gemini_key = os.getenv("GEMINI_KEY")
if not gemini_key:
    raise RuntimeError("GEMINI_KEY environment variable is missing.")

genai.configure(api_key=gemini_key)


def create_base_prompt(subcategory, product_details, task_type):
    if task_type == 'name':
        instruction = "TASK: Write exactly one labeled line: Product Name: [title here]"
    else:
        instruction = "TASK: Write exactly one labeled line: Product Description: [description here]"
    return f"""
You are an expert Amazon e-commerce copywriter specializing in Clothing.
Only generate factual and accurate output based solely on the provided details.
{instruction}

Product Details:
{subcategory}
{product_details}

IMPORTANT:
Max 200 characters for title.
Max 2000 characters for description.
Mention brand once, focus on material, fit, pattern, neck, sleeve, color, size.
No promotional language.
End description with a complete sentence.

GOOD EXAMPLES
# Example 1 - Men's Slim Fit Cotton T-Shirt
Input:
Brand: Levi's
Department: Men
Generic Name: T-Shirt
Material: 100% Cotton
Fit: Slim Fit
Pattern: Solid
Neck: Crew Neck
Sleeve: Short Sleeve
Size: M
Output:
Product Name: Levi's Men's Slim Fit 100% Cotton Crew Neck T-Shirt | M
Product Description: Crafted from 100% cotton, this Levi's men's slim fit t-shirt offers breathable comfort and a sleek, modern look. The classic crew neck and short sleeves make it ideal for casual outings. Pairs effortlessly with jeans or chinos for everyday style.

# Example 2 - Men's Oversized Graphic T-Shirt
Input:
Brand: Bewakoof
Department: Men
Generic Name: T-Shirt
Material: 100% Cotton
Fit: Oversized
Pattern: Graphic Print (Batman)
Neck: Round Neck
Size: XL
Output:
Product Name: Bewakoof Men's Oversized 100% Cotton Batman Graphic Round Neck T-Shirt | XL
Product Description: Make a bold statement with this Bewakoof men's oversized Batman t-shirt. Made from 100% cotton for comfort and durability. The round neck and striking graphic print add a contemporary streetwear edge, perfect for casual wear.

# Example 3 - Women's Anarkali Kurta Set
Input:
Brand: KLOSIA
Department: Women
Generic Name: Kurta Set
Fit: Anarkali
Material: 100% Viscose
Pattern: Printed
Dupatta: Chanderi Cotton
Sleeve: 3/4 Sleeve
Length: Calf Length
Output:
Product Name: KLOSIA Women's 100% Viscose Printed Anarkali Kurta Set with Chanderi Cotton Dupatta
Product Description: This KLOSIA women's Anarkali set combines traditional elegance with modern comfort. Crafted from 100% viscose with a printed design and Chanderi cotton dupatta, it flows gracefully while keeping you comfortable. Ideal for festive or casual ethnic occasions.

Subcategory: {subcategory}
Details: {product_details}
"""

def call_gemini(prompt, max_tokens):
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(
            prompt,
            generation_config=types.GenerationConfig(
                temperature=0.8,
                max_output_tokens=max_tokens,
            ),
        )
        if hasattr(response, "text") and response.text:
            return response.text.strip()
        else:
            return "Generation Failed: Model returned no output."
    except Exception as e:
        return f"Generation Failed: API Error. {str(e)}"


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

@app.route('/api/generate-title-description', methods=['POST'])
def generate_title_description():
    data = request.get_json()
    subcategory = data.get('subcategory', '')
    product_details = "\n".join(
        [f"{k}: {v}" for k, v in data.items() if k not in ('subcategory', 'type')]
    )
    task_type = data.get('type', 'title')
    if not subcategory or not product_details:
        return jsonify({'success': False, 'error': 'Missing required fields'}), 400
    if task_type == 'title':
        generated_title = generate_product_name(subcategory, product_details)
        return jsonify({'success': True, 'generated_title': generated_title})
    elif task_type == 'description':
        generated_description = generate_product_description(subcategory, product_details)
        return jsonify({'success': True, 'generated_description': generated_description})
    else:
        return jsonify({'success': False, 'error': 'Unknown type specified'}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
