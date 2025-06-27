from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import math
import requests






driver = webdriver.Chrome()
driver2 = webdriver.Chrome()
driver3 = webdriver.Chrome()
a6 = []
driver.get("https://www.bestbuy.ca/en-ca/search?search=pre-built+PC")
driver2.get("https://www.canadacomputers.com/en/search?s=pc&t=1")
driver3.get("https://www.memoryexpress.com/Category/DesktopComputers?PageSize=120")

wait = WebDriverWait(driver, 10)
try:
    wait.until(EC.presence_of_element_located((By.CLASS_NAME, "productLine_2N9kG")))
except Exception as e:
    print("Error for finding listings for Best Buy")

wait2 = WebDriverWait(driver2, 10)
try:
    wait2.until(EC.presence_of_element_located((By.CLASS_NAME, "js-product")))
except Exception as e:
    print("Error for finding listings Canada Computers")

wait3 = WebDriverWait(driver3, 10)
try:
    wait3.until(EC.presence_of_element_located((By.CLASS_NAME, "c-shca-container")))
except Exception as e:
    print("Error for finding listings Memory Express")



# Now get the page source after the page has loaded
html_content = driver.page_source
html_content2 = driver2.page_source
html_content3 = driver3.page_source
soup = BeautifulSoup(html_content, 'html.parser')
time.sleep(2)
soup2 = BeautifulSoup(html_content2, 'html.parser')
time.sleep(2)
soup3 = BeautifulSoup(html_content3, 'html.parser')
time.sleep(2)


try:
    items = soup3.find_all('div', class_="c-shca-icon-item")
    a2 = []
    a2.append("MEMORY EXPRESS")
    for item in items:
        a3 = []
        try:
            nme = str(item.find('span', class_="c-shca-icon-item__body-name-brand").next_sibling.text).strip() #name
            cur_price = str(item.find('div', class_="c-shca-icon-item__summary-list").find('span').text).strip() #current price
            cur_price = cur_price.replace("$", "")
            cur_price = cur_price.replace(",", "")
        except Exception as e:
            continue
        l = item.find('a').get('href')
        link = "https://www.memoryexpress.com/" + str(l)
        img = "https://media.memoryexpress.com/Images/" + str(l) + "/0?Size=Default"
        reg_price=0
        try:
            reg_price = str(item.find('div', class_="c-shca-icon-item__summary-regular").find('span').text)
            reg_price = reg_price.replace("$", "")
            reg_price = reg_price.replace(",", "")
        except Exception as e:
            pass
    
        a3.append(nme)
        if str(cur_price) in str(reg_price):
           a3.append(0)
           a3.append(float(cur_price))
        else:
            a3.append(float(cur_price))
            a3.append(float(reg_price))
        a3.append(link)
        a3.append(img)
        a2.append(a3)
    print(a2)
    with open("listings.txt", "w") as f:
        f.write(str(a2))
        f.write("\n\n\n")
    f.close()
except Exception as e:
    print(f"Error processing element: {e}")
    
driver3.quit()



#try:
    #products_container2 = soup2.find_all('div', class_="hidden-sm-down pl-2 results")
    #for s in products_container2:
      #  b = str(s.text)
        #b = b.strip()
       # c = b.split()
#except Exception as e:
    #print(f"Error processing element: {e}")
#exit(0)
counter=0
while counter < 3:
    try:
        load_more_button = wait2.until(
            EC.element_to_be_clickable((By.LINK_TEXT, "LOAD MORE ITEMS"))
        )
        # Scroll to the button slowly
        driver2.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", load_more_button)
        time.sleep(0.5)  # Wait longer for smooth scroll to complete

        load_more_button.click()
        print("Clicked 'Load More'")
        time.sleep(2)  # Wait longer for items to load
        counter=counter+1
    except:
        print("No more 'Load More' buttons found or reached end")
        break
html_content2 = driver2.page_source
soup2 = BeautifulSoup(html_content2, 'html.parser')
time.sleep(1)

try:
    products_container = soup2.find_all('div', class_="js-product")
    #print(products_container)
    a2 = []
    a2.append("CANADA COMPUTERS")
    for prod in products_container:
        a3 = []
        k = prod.find('h2')
        j = prod.find('a')
        imag = prod.find('picture').find('img')
        link = j.get('href')
        try:
            saleprice = prod.find('span', class_='price sale-price')
            sale = str(saleprice.text).strip().replace("$","")
            sale = sale.replace(",", "")
        except Exception as e:
            sale=0
        try: 
            regular = prod.find('span', class_='regular-price')
            if regular is None:
                regular = prod.find('span', class_='price no-sale-price')
        except Exception as e:
            pass
        name=str(k.text)
        img=imag['src']
        if "data:image/gif;" in img:
            continue
        try:
            reg = str(regular.text).strip().replace("$", "")
            reg = reg.replace("," , "")
        except Exception as e:
            print('breh')
        ratings=0
        reviews=0
        try:
            ratings = prod.find("div", class_="col-md-12 align-self-center review-icon").get("data-score")
            reviews = str(prod.find("span", class_='star-number').text).replace("(", "").replace(")", "")
        except Exception as e:
            pass
        a3.append(name.strip())
        a3.append(float(sale))
        a3.append(float(reg))
        a3.append(link)
        a3.append(img)
        a3.append(float(ratings))
        a3.append(int(reviews))
        a2.append(a3)
    with open("listings.txt", "a") as f:
        f.write(str(a2))
        f.write("\n\n\n")
    f.close()
except Exception as e:
    print(f"Error processing element: {e}")

driver2.quit()

try:
    products_container = soup.find('div', class_="productsContainer_2xEUC")
    if products_container:
        element_a = products_container.find('h2', attrs={'data-testid': 'PRODUCT_LIST_RESULT_COUNT_DATA_AUTOMATION'})  # type: ignore
        if element_a:
            j = str(element_a.text) 
            x = j.split()
        else:
            print("No h2 element")
except Exception as e:
    print(f"Error processing element: {e}")

try:
    h = math.floor(int(x[0])/25)
    #print(h)
    number = soup.find("h2", class_="m-0 pt-6 font-best-buy text-body-sm font-normal text-v2-dark-grey")
    show_more_button = driver.find_element(By.CSS_SELECTOR, "button[aria-label='Show more products']")
    for i in range(h): #for loop fr to get as many
        driver.execute_script("arguments[0].scrollIntoView(true);", show_more_button)
        driver.execute_script("arguments[0].click();", show_more_button)
        time.sleep(0.5) 

    
    time.sleep(3)  # Wait for more products to load
except Exception as e:
    print(f"Could not find or click 'Show more' button: {e}")

# --- NEW: Scroll through the page to trigger lazy loading of images ---
all_li_elements_selenium = driver.find_elements(By.CSS_SELECTOR, "li.productLine_2N9kG")
for index, element in enumerate(all_li_elements_selenium):
    try:
        driver.execute_script("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", element)
        time.sleep(0.2)
    except Exception as e:
        print(f"Could not scroll to element {index + 1}: {e}")

print("Finished scrolling. Waiting for any final images to load...")
time.sleep(2)

html_content = driver.page_source
soup = BeautifulSoup(html_content, 'html.parser')

a = soup.find_all('li', class_="productLine_2N9kG")
print(f"Elements with specific class found: {len(a)}")


products = soup.find_all('a', class_="styles-module_link__gsq1z inline-block w-full")

#for product in products:
    #link = product.get('href')
    #link1= "https:" + link
    #print(link1)

    #img = product.find('img', class_='productItemImage_1en8J')
    #img_url = img['src'] if img else None
    #print(img_url)

    #print("\nEEEE\n")

#exit(0)
counter4=0
a6.append("BEST BUY")
for i in a:
    k = i.find('a')  # type: ignore
    if k is not None:
        link = k.get('href')  # type: ignore
        if link:
            # Convert link to string to handle AttributeValueList
            link_str = str(link)
            if link_str.startswith("/en"):
                link1 = "https://www.bestbuy.ca" + link_str
            else:
                link1 = "https:" + link_str
        else:
            link1 = "No link found"
    else:
        link1 = "No link found"
    rating=0
    review=0
    try:
        rating = float(i.find("meta", itemprop='ratingValue').get('content'))
        review = int(i.find("meta", itemprop='reviewCount').get('content'))
    except Exception as e:
        pass
    
    # Image extraction with proper type handling
    img = i.find('img', class_='productItemImage_1en8J')  # type: ignore
    img_url = None
    if img and hasattr(img, 'get'):
        img_url = img.get('src')  # type: ignore
    a1 = str(i.text)
    a1 = a1.replace("CheckmarkAvailable online only", "")
    a1 = a1.replace("Sponsored", "")
    a1 = a1.split("$")
    print(a1)
    a3 = []
    if len(a1)>4:
        continue
    if img_url is None:
        continue
    for x in range(len(a1)):
        a3.append(a1[x])
        if (len(a1)==4):
            if "SAVE" in a1[2]:
                pray2 = str(a1[3])
                pray2 = pray2.replace("Add", "").replace("to", "").replace("Cart", "")
                pray2 = pray2.replace(",", "").replace("$", "").strip()
                pray = str(a1[1]).replace("SAVE ", "")
                pray = str(a1[1]).replace(",", "")
                pray = str(a1[1]).replace("$", "")
                reg_price = float(pray)+float(pray2)
                a3.append(float(pray))
                a3.append(reg_price)
                break
            else:
                a3.append(0)
                a3.append(float(pray))
                break
        else:
            a3.append(0)
            a3.append(float(a1[1]))
            break
    a3.append(link1)
    a3.append(img_url)  # Changed from img to img_url
    a3.append(rating)
    a3.append(review)
    a6.append(a3)
    #print(a1)
with open("listings.txt", "a") as f:
    f.write(str(a6))
    f.write("\n\n\n")
f.close()

# Clean up
driver.quit()






#review_counts = soup.find_all('div', class_="style-module_reviews__l2Oen")
#print(review_counts)

#for span in review_counts:
    #print(span.text) 



