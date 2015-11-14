int ASignal = A0;
int LEDPin = 13; 
int val = 380;  
 
void setup() {
  pinMode(LEDPin, OUTPUT);     
  pinMode(ASignal, INPUT);      
  digitalWrite(LEDPin,LOW);  
  Serial.begin(9600);
 
}
 
 
void loop() {
  int sensorValue = analogRead(ASignal);   
  Serial.println(sensorValue);
  if(analogRead(ASignal) > val) {
    digitalWrite(LEDPin, HIGH);  
    delay(300);         
    digitalWrite(LEDPin, LOW);  
    delay(300);  
  } else {
    digitalWrite(LEDPin,LOW);  
    delay(1000);
  }
}
