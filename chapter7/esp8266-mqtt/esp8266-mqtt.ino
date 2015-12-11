#include <PubSubClient.h>
#include <ESP8266WiFi.h>

const char* ssid = "...";
const char* password = "...";

char* topic = "device/2";
char* server = "192.168.1.31";


WiFiClient wifiClient;
PubSubClient client(server, 1883, callback, wifiClient);

void callback(char* topic, byte* payload, unsigned int length) {
  // handle message arrived
}

void setup() {
  Serial.begin(115200);
  delay(10);
  
  Serial.print("Connecting to ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");  
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  Serial.print("Connecting to ");
  Serial.print(server);
  
  if (client.connect("ESP8266Client", "1", " ")) {
    Serial.println("Connected to MQTT broker");
    Serial.print("Topic is: ");
    Serial.println(topic);
  }
  else {
    Serial.println("MQTT connect failed");
    Serial.println("Will reset and try again...");
    abort();
  }
}

void loop() {
  static int counter = 0;
  
  String payload = "{\"temperature\":3}";
  
  if (client.connected()){
    Serial.print("Sending payload: ");
    Serial.println(payload);
    
    if (client.publish(topic, (char*) payload.c_str())) {
      Serial.println("Publish ok");
    }
    else {
      Serial.println("Publish failed");
    }
  }
  ++counter;
  delay(5000);
}


