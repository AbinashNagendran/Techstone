
import json
import time
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from pymongo import MongoClient, errors
from bson import json_util
import os
import re
from selenium.webdriver.chrome.service import Service

#  MongoDB Setup 
# in your aws lambda make a env variable MONGO_URI for your actual connection string
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client['listings']
products_collection = db['products2']

# Selenium Driver Setup 

def init_driver():
    options = Options()
    service = Service("/usr/bin/chromedriver")
    options.binary_location = "/usr/lib64/chromium-browser/chromium-browser"
    
    # Bulletproof flags with stealth options
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--single-process")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--no-zygote")
    options.add_argument("--user-data-dir=/tmp/user-data")
    options.add_argument("--data-path=/tmp/data-path")
    options.add_argument("--disk-cache-dir=/tmp/cache-dir")
    options.add_argument("--remote-debugging-port=9222")
    
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    # A realistic user agent
    options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    driver = webdriver.Chrome(service=service, options=options)
    
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    # generous page load timeout
    driver.set_page_load_timeout(90)
    
    return driver

#  Memory Express 
# Doing this website multiple times triggers cloudflare so be careful, should go away the next day though
def scrape_memory_express(driver):
    try:
        # Add user agent and additional headers to appear more like a real browser
        driver.execute_cdp_cmd('Network.setUserAgentOverride', {
            "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        })
        
        print("Starting Memory Express scrape...")
        driver.get("https://www.memoryexpress.com/Category/DesktopComputers?PageSize=120")
        
        wait_strategies = [
            (By.CLASS_NAME, "c-shca-container"),
            (By.CLASS_NAME, "c-shca-icon-item"),
            (By.CSS_SELECTOR, "[data-role='product-list-container']")
        ]
        
        element_found = False
        for strategy in wait_strategies:
            try:
                WebDriverWait(driver, 20).until(
                    EC.presence_of_element_located(strategy)
                )
                print(f"Memory Express: Found elements using strategy: {strategy}")
                element_found = True
                break
            except TimeoutException:
                print(f"Memory Express: Strategy {strategy} failed, trying next...")
                continue
        
        if not element_found:
            print("Memory Express: All wait strategies failed, trying to proceed anyway...")
        
        time.sleep(3)
        
        # Try to scroll to trigger any lazy loading
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
        time.sleep(2)
        driver.execute_script("window.scrollTo(0, 0);")
        time.sleep(1)
        
        soup = BeautifulSoup(driver.page_source, "html.parser")
        
        # Debug: Check if we got the right page
        if "Desktop Computers" not in driver.title:
            print(f"Memory Express: Unexpected page title: {driver.title}")
        
        results = []
        
        # Try multiple selectors for items
        items = soup.find_all("div", class_="c-shca-icon-item")
        if not items:
            # Fallback selector
            items = soup.find_all("div", class_=lambda x: x and "c-shca-icon-item" in x)
            print(f"Memory Express: Using fallback selector, found {len(items)} items")
        else:
            print(f"Memory Express: Found {len(items)} items with primary selector")
        
        for item in items:
            try:
                title_element = item.find('span', class_="c-shca-icon-item__body-name-brand")
                if title_element and title_element.parent:
                    # Get the parent anchor tag and extract text, excluding the brand image
                    title_anchor = title_element.parent
                    title = title_anchor.get_text(strip=True)
                    # Remove any brand name that might be included
                    if title_element.find('img'):
                        brand_alt = title_element.find('img').get('alt', '')
                        title = title.replace(brand_alt, '').strip()
                else:
                    # Fallback title extraction
                    title_anchor = item.find('a', href=lambda x: x and '/Products/' in x)
                    if title_anchor:
                        title = title_anchor.get_text(strip=True)
                    else:
                        continue
                
                # price extraction
                sale_price_element = item.find('div', class_="c-shca-icon-item__summary-list")
                if sale_price_element:
                    price_span = sale_price_element.find('span')
                    if price_span:
                        sale_price_text = price_span.get_text(strip=True)
                        sale_price = float(sale_price_text.replace("$", "").replace(",", ""))
                    else:
                        continue
                else:
                    continue
                
                # Link extraction
                link_element = item.find('a', href=True)
                if link_element:
                    link = "https://www.memoryexpress.com" + link_element.get('href')
                else:
                    continue
                
                # Image extraction
                img_element = item.find('img', alt="Product Image")
                if img_element:
                    img = img_element.get('src', '')
                else:
                    # Fallback image construction
                    product_id = link.split('/')[-1] if '/' in link else ''
                    img = f"https://media.memoryexpress.com/Images/Products/{product_id}/0?Size=Default" if product_id else ''
                
                # Regular price extraction
                try:
                    reg_price_element = item.find('div', class_="c-shca-icon-item__summary-regular")
                    if reg_price_element:
                        reg_price_span = reg_price_element.find('span')
                        if reg_price_span:
                            reg_price_text = reg_price_span.get_text(strip=True)
                            reg_price = float(reg_price_text.replace("$", "").replace(",", ""))
                        else:
                            reg_price = sale_price
                    else:
                        reg_price = sale_price
                except:
                    reg_price = sale_price
                
                # Only add if we have essential data
                if title and sale_price > 0 and link:
                    results.append({
                        "storeId": 0,
                        "title": title,
                        "salePrice": sale_price,
                        "regularPrice": reg_price,
                        "link": link,
                        "image": img,
                        "rating": 0.0,              # memory express doesnt have ratings or review counts
                        "reviewCount": 0
                    })
                
            except Exception as e:
                print(f"Memory Express: Error parsing item: {e}")
                continue

        print(f"Memory Express scraped {len(results)} products")
        return results
        
    except TimeoutException as e:
        print(f"Memory Express: Timeout error - {e}")
        # Try to get current page info for debugging, this is where cloudfare might pop up
        try:
            print(f"Memory Express: Current URL: {driver.current_url}")
            print(f"Memory Express: Page title: {driver.title}")
            print(f"Memory Express: Page source length: {len(driver.page_source)}")
        except:
            pass
        return []
    except Exception as e:
        print(f"Memory Express: Unexpected error - {e}")
        return []

# Canada Computers 
def scrape_canada_computers(driver):
    try:
        driver.get("https://www.canadacomputers.com/en/search?s=pc&t=1")
        WebDriverWait(driver, 60).until(
            EC.presence_of_element_located((By.CLASS_NAME, "js-product"))
        )
        for _ in range(3):
            try:
                load_more = driver.find_element(By.LINK_TEXT, "LOAD MORE ITEMS")
                driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", load_more)
                time.sleep(0.5)
                load_more.click()
                time.sleep(2)
            except:
                break
        soup = BeautifulSoup(driver.page_source, "html.parser")
        
        results = []
        products = soup.find_all("div", class_="js-product")
        for prod in products:
            try:
                title = prod.find("h2").text.strip()
                sale_price = prod.find("span", class_="price sale-price")
                sale_price = float(sale_price.text.replace("$", "").replace(",", "")) if sale_price else 0.0
                reg_price = prod.find("span", class_="regular-price")
                if reg_price is None: reg_price = prod.find("span", class_="price no-sale-price")
                reg_price = float(reg_price.text.replace("$", "").replace(",", "")) if reg_price else sale_price
                link = prod.find("a").get("href")
                img = prod.find("picture").find("img").get("src")
                rating = float(prod.get("data-score", 0))
                review_count = int(prod.find("span", class_="star-number").text.replace("(", "").replace(")", "")) if prod.find("span", class_="star-number") else 0
                results.append({ "storeId": 1, "title": title, "salePrice": sale_price, "regularPrice": reg_price, "link": link, "image": img, "rating": rating, "reviewCount": review_count })
            except:
                continue

        print(f"Canada Computers scraped {len(results)} products")
        return results
    except TimeoutException:
        print("ERROR: Timeout while scraping Canada Computers.")
        return []
    except Exception as e:
        print(f"ERROR: An unexpected error occurred in Canada Computers scraper: {e}")
        return []

#  Best Buy 
def scrape_bestbuy(driver):
    try:
        driver.get("https://www.bestbuy.ca/en-ca/search?search=pre-built+PC")
        WebDriverWait(driver, 60).until(
            EC.presence_of_element_located((By.CLASS_NAME, "productLine_2N9kG"))
        )
        elements = driver.find_elements(By.CSS_SELECTOR, "li.productLine_2N9kG")
        for elem in elements:
            driver.execute_script("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", elem)
            time.sleep(0.1)
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        results = []
        products = soup.find_all('li', class_="productLine_2N9kG")
        for prod in products:
            try:
                title_tag = prod.find("h3", class_=re.compile(r"productItemName_"))
                title = title_tag.text.strip() if title_tag else ""
                link_tag = prod.find('a'); link = link_tag.get('href') if link_tag else ""
                if link.startswith("/en"): link = "https://www.bestbuy.ca" + link
                img_tag = prod.find('img', class_='productItemImage_1en8J'); img = img_tag['src'] if img_tag else ""
                text_parts = prod.text.replace("CheckmarkAvailable online only","").replace("Sponsored","").split("$")
                sale_price = 0.0; reg_price = 0.0
                if len(text_parts) >= 2:
                    try:
                        sale_price = float(text_parts[1].replace(",","").strip())
                        if len(text_parts) > 3 and "SAVE" in text_parts[2]:
                            save_amount = float(text_parts[3].replace(",","").replace("Add to Cart","").strip())
                            reg_price = sale_price + save_amount
                        else: reg_price = sale_price
                    except: sale_price = 0.0; reg_price = 0.0
                try: rating = float(prod.find("meta", itemprop='ratingValue').get('content', 0))
                except: rating = 0.0
                try: review_count = int(prod.find("meta", itemprop='reviewCount').get('content', 0))
                except: review_count = 0
                results.append({ "storeId": 2, "title": title, "salePrice": sale_price, "regularPrice": reg_price, "link": link, "image": img, "rating": rating, "reviewCount": review_count })
            except:
                continue

        print(f"Best Buy scraped {len(results)} products")
        return results
    except TimeoutException:
        print("ERROR: Timeout while scraping Best Buy.")
        return []
    except Exception as e:
        print(f"ERROR: An unexpected error occurred in Best Buy scraper: {e}")
        return []


def lambda_handler(event, context):
    # Setup collection
    if 'products2' in db.list_collection_names():
        products_collection.drop()
        print("Old products2 collection dropped. Starting fresh.")
    products_collection.create_index('link', unique=True)

    # Initialize ONE driver for the entire session
    driver = init_driver()
    all_results = []
    
    try:
        # Pass the driver to each function
        all_results.extend(scrape_canada_computers(driver))
        all_results.extend(scrape_memory_express(driver))
        all_results.extend(scrape_bestbuy(driver))

        # Insert products into DB
        if all_results:
            try:
                result = products_collection.insert_many(all_results, ordered=False)
                print(f"Inserted {len(result.inserted_ids)} products")
            except errors.BulkWriteError as e:
                skipped = len(e.details.get('writeErrors', []))
                print(f"Some products were duplicates and skipped ({skipped})")

    finally:
        driver.quit()

    return {
        "statusCode": 200,
        "body": json.dumps({"message": f"Scraping complete. Found {len(all_results)} total products."})
    }