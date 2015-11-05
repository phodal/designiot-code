import json
import urllib2
import serial
import time

url = "http://api.designiot.cn/led.json"

while 1:
    try:
        results = urllib2.urlopen(url)
        status = json.loads(results)['led']
        ser = serial.Serial("/dev/cu.usbmodem1451", 9600)
        if status:
            ser.write('1')
        else:
            ser.write('0')
        time.sleep(100)
    except urllib2.URLError:
        print "Bad URL or timeout"
