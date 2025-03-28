from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Path to your ChromeDriver
chrome_driver_path = r"D:\chromedriver-win64\chromedriver-win64\chromedriver.exe"

# Path to your unpacked Chrome extension (Folder path where manifest.json is located)
extension_path = r"D:\SW project\Frontend"  # Update this with your actual extension path

# Configure Chrome Options
chrome_options = Options()
chrome_options.add_argument(f"--load-extension={extension_path}")  # Load your extension

# Start ChromeDriver with extension
service = Service(chrome_driver_path)
driver = webdriver.Chrome(service=service, options=chrome_options)

# Get your extension ID
extension_id = "bmbgohcecebgnllmpfnodgcnncjdggak"  # Replace with actual ID

# Navigate to the extension's page
driver.get(f"chrome-extension://{extension_id}/popup.html")

wait = WebDriverWait(driver, 10)  # Wait for elements to load

try:
    summarize_button = wait.until(EC.element_to_be_clickable((By.ID, "summarizeBtn")))
    summarize_button.click()
    print("✅ Clicked Summarize button!")
except Exception as e:
    print(f"❌ Failed to click Summarize button: {e}")

try:
    listen_button = wait.until(EC.element_to_be_clickable((By.ID, "audio-btn")))
    listen_button.click()
    print("✅ Clicked Listen button!")
except Exception as e:
    print(f"❌ Failed to click Listen button: {e}")

try:
    play_pause_button = wait.until(EC.element_to_be_clickable((By.ID, "playPauseBtn")))
    play_pause_button.click()
    print("✅ Clicked Play/Pause button!")
except Exception as e:
    print(f"❌ Failed to click Play/Pause button: {e}")

driver.quit()
