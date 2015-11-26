#include <IRremote.h>

int port = 12;
IRsend irsend;
int startArduino = 1;
int irRemote = 2;
int stopArduino = 3;

void setup() {
  Serial.begin(9600);
  pinMode(port, OUTPUT);
}

int serialData;
void loop() {
  String inString = "";
  while (Serial.available()> 0)
  {
    int inChar = Serial.read();
    if (isDigit(inChar)) {
      inString += (char)inChar;
    }
    serialData=inString.toInt();
    Serial.print(serialData);
  }
  if(serialData == startArduino){
    digitalWrite(port, HIGH);
  } else if( serialData == irRemote){
    irsend.sendNEC(0xFFA25D,32); 
    delay(1000);
  } else if (serialData == stopArduino) {
    digitalWrite(port, LOW);   
  }
}
