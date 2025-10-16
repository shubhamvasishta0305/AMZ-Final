#!/usr/bin/env python3
"""
Amazon Scraper for Web Interface
- Returns structured JSON data
- Enhanced with anti-blocking techniques
"""

import requests
from bs4 import BeautifulSoup
import sys
import re
import json
import time
import random

# Enhanced headers to mimic real browser behavior
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Cache-Control": "max-age=0",
    "DNT": "1",
    "sec-ch-ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"'
}

def scrape_amazon(url):
    try:
        print(f"🔍 Starting to scrape: {url}", file=sys.stderr)
        
        # Add random delay to mimic human behavior
        time.sleep(random.uniform(1, 3))
        
        # Create a session to maintain cookies
        session = requests.Session()
        
        # Set cookies that Amazon expects
        session.cookies.set('session-id', '000-0000000-0000000')
        session.cookies.set('i18n-prefs', 'INR')
        session.cookies.set('lc-acbin', 'en_IN')
        
        # Make the request with enhanced headers and session
        r = session.get(url, headers=HEADERS, timeout=30, allow_redirects=True)
        
        print(f"📡 Response status code: {r.status_code}", file=sys.stderr)
        
        if r.status_code != 200:
            return {"success": False, "error": f"Failed to fetch page. Status code: {r.status_code}"}
        
        # Check if we got a CAPTCHA page
        if "api-services-support@amazon.com" in r.text or "Type the characters you see in this image" in r.text:
            print("⚠️ CAPTCHA detected - Amazon is blocking automated requests", file=sys.stderr)
            return {"success": False, "error": "Amazon CAPTCHA detected. Please try again later or use a different IP."}
        
        soup = BeautifulSoup(r.text, "html.parser")

        # Title
        title_elem = soup.find(id="productTitle")
        title = title_elem.text.strip() if title_elem else "N/A"
        print(f"📝 Title found: {title[:50]}...", file=sys.stderr)
        
        # If title is still N/A, try alternative selectors
        if title == "N/A":
            # Try h1 with product title class
            title_elem = soup.find("h1", class_=lambda x: x and "product" in x.lower())
            if title_elem:
                title = title_elem.text.strip()
            else:
                # Try span with id containing productTitle
                title_elem = soup.find("span", id=lambda x: x and "productTitle" in x.lower() if x else False)
                if title_elem:
                    title = title_elem.text.strip()
        
        print(f"📝 Final title: {title[:50]}...", file=sys.stderr)

        # Product Description
        desc_elem = soup.find(id="productDescription")
        product_description = desc_elem.text.strip() if desc_elem else "N/A"

        # About this Item - Feature Bullets
        bullets = []
        about_div = soup.find("div", id="feature-bullets")
        if about_div:
            list_items = about_div.find_all("li")
            for li in list_items:
                text = li.get_text(strip=True)
                if text and "about this item" not in text.lower() and text not in bullets:
                    bullets.append(text)

        # Extract Product Details from detailBulletsWrapper_feature_div
        product_details = {}
        manufacturing_details = {}
        additional_info = {}

        detail_bullets_div = soup.find("div", id="detailBulletsWrapper_feature_div")
        if detail_bullets_div:
            print("📋 Found detailBulletsWrapper_feature_div section", file=sys.stderr)
            
            # Find all list items in the detail bullets
            list_items = detail_bullets_div.find_all("li", class_="a-list-item")
            
            for li in list_items:
                # Find the key (bold text) and value
                key_spans = li.find_all("span", class_="a-text-bold")
                value_spans = li.find_all("span")
                
                if key_spans:
                    key_span = key_spans[0]
                    key = key_span.get_text(strip=True)
                    
                    # Clean the key - remove trailing colon and special characters
                    key = re.sub(r'[:\s&rlm;&lrm;]+$', '', key).strip()
                    
                    # Get the value - it's usually in the next span after the key span
                    # We need to find the span that contains the actual value
                    value = ""
                    
                    # Method 1: Look for spans that don't have a-text-bold class
                    for span in value_spans:
                        if 'a-text-bold' not in span.get('class', []):
                            text = span.get_text(strip=True)
                            if text and text != key:
                                value = text
                                break
                    
                    # Method 2: If no value found, extract from the entire li text
                    if not value:
                        full_text = li.get_text(strip=True)
                        # Remove the key part to get the value
                        value = full_text.replace(key, "").strip(": ").strip()
                    
                    # Clean the value
                    value = re.sub(r'^[:\s&rlm;&lrm;]+', '', value).strip()
                    
                    if key and value:
                        # Skip Best Sellers Rank and Customer Reviews
                        if "Best Sellers Rank" not in key and "Customer Reviews" not in key:
                            print(f"   - {key}: {value}", file=sys.stderr)
                            
                            # Categorize the details
                            if any(field in key.lower() for field in ['manufacturer', 'packer', 'importer', 'country of origin', 'item weight', 'item dimensions', 'asin', 'item model number']):
                                manufacturing_details[key] = value
                            else:
                                product_details[key] = value
        else:
            print("❌ detailBulletsWrapper_feature_div not found", file=sys.stderr)

        # If no product details found in the main section, try alternative locations
        if not product_details and not manufacturing_details:
            print("🔍 Trying alternative locations for product details...", file=sys.stderr)
            
            # Try detailBullets_feature_div directly
            detail_div = soup.find("div", id="detailBullets_feature_div")
            if detail_div:
                print("📋 Found detailBullets_feature_div section", file=sys.stderr)
                list_items = detail_div.find_all("li")
                for li in list_items:
                    key_span = li.find("span", class_="a-text-bold")
                    if key_span:
                        key = key_span.get_text(strip=True).rstrip(":")
                        full_text = li.get_text(strip=True)
                        key_text = key_span.get_text(strip=True)
                        value = full_text.replace(key_text, "").strip(": ")
                        if key and value and "Best Sellers Rank" not in key and "Customer Reviews" not in key:
                            if any(field in key.lower() for field in ['manufacturer', 'packer', 'importer', 'country of origin', 'item weight', 'item dimensions', 'asin', 'item model number']):
                                manufacturing_details[key] = value
                            else:
                                product_details[key] = value
                            print(f"   - {key}: {value}", file=sys.stderr)
            
            # Try product details table (tech spec table)
            if not product_details:
                tech_spec_table = soup.find("table", id="productDetails_techSpec_section_1")
                if tech_spec_table:
                    print("📋 Found tech spec table", file=sys.stderr)
                    rows = tech_spec_table.find_all("tr")
                    for row in rows:
                        th = row.find("th")
                        td = row.find("td")
                        if th and td:
                            key = th.get_text(strip=True)
                            value = td.get_text(strip=True)
                            if key and value:
                                if any(field in key.lower() for field in ['manufacturer', 'packer', 'importer', 'country of origin', 'item weight', 'item dimensions', 'asin', 'item model number']):
                                    manufacturing_details[key] = value
                                else:
                                    product_details[key] = value
                                print(f"   - {key}: {value}", file=sys.stderr)

        # Extract high-quality product images using enhanced method
        images = []
        seen_urls = set()
        
        print("🖼️ Starting enhanced image extraction...", file=sys.stderr)
        
        # Method 1: data-a-dynamic-image attribute (most reliable for high quality)
        dynamic_images = soup.find_all('img', {'data-a-dynamic-image': True})
        for img in dynamic_images:
            try:
                dynamic_data = img.get('data-a-dynamic-image', '{}')
                image_dict = json.loads(dynamic_data)
                for img_url in image_dict.keys():
                    if img_url not in seen_urls and 'http' in img_url:
                        # Convert to highest quality using ._SL1500_.
                        high_quality_url = re.sub(r'\._[A-Z0-9_]+\.', '._SL1500_.', img_url)
                        images.append(high_quality_url)
                        seen_urls.add(img_url)
                        print(f"� Found dynamic image: {high_quality_url[:80]}...", file=sys.stderr)
                        if len(images) >= 7:
                            break
            except Exception as e:
                print(f"⚠️ Error parsing dynamic image: {e}", file=sys.stderr)
        
        # Method 2: JavaScript/Script tags (contains high-res image URLs)
        if len(images) < 7:
            script_tags = soup.find_all('script', string=re.compile('colorImages|imageBlockNR|ImageBlockATF'))
            for script in script_tags:
                if len(images) >= 7:
                    break
                try:
                    script_text = script.string
                    # Multiple patterns to try for high-quality images
                    patterns = [
                        r'"hiRes":"(https://[^"]+)"',
                        r'"large":"(https://[^"]+)"',
                        r'"thumb":"(https://[^"]+)"',
                        r'https://m\.media-amazon\.com/images/I/[^"]+\._[A-Z0-9_]+\.[a-z]+'
                    ]
                    
                    for pattern in patterns:
                        matches = re.findall(pattern, script_text)
                        for img_url in matches:
                            if img_url not in seen_urls and len(images) < 7:
                                high_quality_url = re.sub(r'\._[A-Z0-9_]+\.', '._SL1500_.', img_url)
                                images.append(high_quality_url)
                                seen_urls.add(img_url)
                                print(f"📸 Found script image: {high_quality_url[:80]}...", file=sys.stderr)
                except Exception as e:
                    print(f"⚠️ Error parsing script: {e}", file=sys.stderr)
        
        # Method 3: Direct img tags with src (fallback)
        if len(images) < 7:
            img_tags = soup.find_all('img', src=True)
            for img in img_tags:
                if len(images) >= 7:
                    break
                src = img.get('src', '')
                if src and 'http' in src and 'images' in src and src not in seen_urls:
                    # Filter out icons, sprites, etc.
                    if not any(exclude in src.lower() for exclude in ['sprite', 'icon', 'logo', 'arrow', 'buy']):
                        # Convert to highest quality
                        high_quality_url = re.sub(r'\._[A-Z0-9_]+\.', '._SL1500_.', src)
                        images.append(high_quality_url)
                        seen_urls.add(src)
                        print(f"📸 Found img tag: {high_quality_url[:80]}...", file=sys.stderr)
        
        # Method 4: Image block container (additional fallback)
        if len(images) < 7:
            image_container = soup.find("div", id="imageBlock")
            if image_container:
                img_elements = image_container.find_all("img", {"src": re.compile(r"\.(jpg|jpeg|png|webp)")})
                for img in img_elements:
                    if len(images) >= 7:
                        break
                    src = img.get("src", "")
                    if src and src not in seen_urls and ("images-na.ssl-images-amazon.com" in src or "m.media-amazon.com" in src):
                        high_quality_url = re.sub(r'\._[A-Z0-9_]+\.', '._SL1500_.', src)
                        images.append(high_quality_url)
                        seen_urls.add(src)
                        print(f"� Found container image: {high_quality_url[:80]}...", file=sys.stderr)

        # Extract ASIN from URL or page
        asin_match = re.search(r"/dp/([A-Z0-9]{10})", url)
        asin = asin_match.group(1) if asin_match else "unknown"

        # If ASIN not in manufacturing details, try to find it in the page
        if asin == "unknown":
            asin_pattern = re.search(r'"asin":"([A-Z0-9]{10})"', r.text)
            if asin_pattern:
                asin = asin_pattern.group(1)

        # Ensure ASIN is in manufacturing details if found
        if asin != "unknown" and "ASIN" not in manufacturing_details:
            manufacturing_details["ASIN"] = asin

        result = {
            "success": True,
            "title": title,
            "description": product_description,
            "bullets": bullets,
            "productDetails": product_details if product_details else {"status": "No data available"},
            "additionalInfo": additional_info,
            "manufacturingDetails": manufacturing_details,
            "images": images[:7],  # Return only first 7 images
            "asin": asin
        }
        
        print(f"✅ Successfully scraped product: {title[:50]}...", file=sys.stderr)
        print(f"📊 Found {len(product_details)} product details", file=sys.stderr)
        print(f"🏭 Found {len(manufacturing_details)} manufacturing details", file=sys.stderr)
        print(f"🖼️ Found {len(images)} product images", file=sys.stderr)
        return result

    except Exception as e:
        print(f"❌ Error during scraping: {str(e)}", file=sys.stderr)
        return {"success": False, "error": str(e)}

def main():
    if len(sys.argv) < 2:
        error_result = {"success": False, "error": "URL parameter required"}
        print(json.dumps(error_result))
        return

    url = sys.argv[1]
    result = scrape_amazon(url)
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()

