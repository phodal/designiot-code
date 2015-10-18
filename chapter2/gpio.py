import RPi.GPIO as GPIO
GPIO.setmode(GPIO.BOARD)
GPIO.setup(5, GPIO.OUT)
GPIO.output(5, GPIO.HIGH)
GPIO.output(5, GPIO.LOW)
