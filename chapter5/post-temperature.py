import requests
import serial
import time

while 1:
    ser = serial.Serial("/dev/tty.usbmodem1411", 9600)
    temperature = ser.read(5)
    print temperature
    r = requests.put("http://localhost:3000/api/4", {"temperature": temperature, "user": 4, "led": 1})
    r.text
    time.sleep(1)
