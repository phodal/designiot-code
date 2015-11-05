import json
import urllib2
import serial
import time

url = "http://localhost:3000/api/1"
ser = serial.Serial("/dev/cu.usbmodem1451", 9600)

while 1:
    date = urllib2.urlopen(url)
    status = json.load(date)[0]['led']
    print status
    if status:
        ser.write('1')
    else:
        ser.write('0')
    time.sleep(1)
