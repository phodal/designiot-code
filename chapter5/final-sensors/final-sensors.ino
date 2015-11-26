#include <OneWire.h>
#include <DallasTemperature.h>

#define ONE_WIRE_BUS 2

int DataPin = A0;
int LEDPin = 13;

OneWire oneWire(ONE_WIRE_BUS);

DallasTemperature sensors(&oneWire);


void setup(void)
{
  pinMode(DataPin, INPUT);
  Serial.begin(9600);
  sensors.begin();
}

void loop(void)
{
  int sensorValue = analogRead(DataPin);   
  Serial.println(sensorValue);

  sensors.requestTemperatures(); // Send the command to get temperatures
  Serial.println(sensors.getTempCByIndex(0));

  delay(500);
}