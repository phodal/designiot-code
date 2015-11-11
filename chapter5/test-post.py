import requests
import time

while 1:
    r = requests.put("http://localhost:3000/api/4", {"temperature": 24, "user": 4, "led": 1})
    print r.text
    time.sleep(1)