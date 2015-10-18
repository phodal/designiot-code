import urllib2,json
import RPi.GPIO as GPIO

GPIO.setmode(GPIO.BOARD)
GPIO.setup(5, GPIO.OUT)

results = urllib2.urlopen('http://192.168.168.84/api.json').read()
status = json.loads(results)['led']
if status == True:
    GPIO.output(5, GPIO.HIGH)
else:
 	 GPIO.output(5, GPIO.LOW)
