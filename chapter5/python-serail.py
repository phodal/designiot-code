import json
import urllib2
import serial
import time

url = "http://api.designiot.cn/led.json"

while 1:
    try:
        date = urllib2.urlopen(url)
        result = json.load(date)
        status = result['led']
        ser = serial.Serial("/dev/ttyACM0", 9600)
        if status == 1:
            ser.write('1')
        elif status == 0:
            ser.write('0')
        time.sleep(100)
    except urllib2.URLError:
        print "Bad URL or timeout"
