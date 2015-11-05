void setup() {
  Serial.begin(9600);
}

void loop() {
  if (Serial.available()) {
    char inChar = (char)Serial.read();
    Serial.write(inChar );
  }
}
