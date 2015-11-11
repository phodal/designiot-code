#include <ESP8266WiFi.h>

const char* ssid     = "Phodal"; //WiFi名
const char* password = "12345678"; //WiFi密码

const char* server = "192.168.3.12"; //服务器/PC的IP

WiFiClient client;

void setup() {
  Serial.begin(9600);
  delay(10);

  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("WiFi connected");  
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  Serial.print("connecting to ");
  Serial.println(server);
  
// give the Ethernet shield a second to initialize:
  delay(1000);
  Serial.println("connecting...");

  // if you get a connection, report back via serial:
  if (client.connect(server, 3000)) {
    Serial.println("connected");
    // Make a HTTP request:
    client.println("GET /api/1 HTTP/1.1");
    client.println("Host: 192.168.3.12");
    client.println("Connection: close");
    client.println();
  }
  else {
    Serial.println("connection failed");
  }
  
}

void loop() {
  // if there are incoming bytes available
  // from the server, read them and print them:  
  if (client.available()) {
    char c = client.read();
    Serial.print(c);
  }

  // if the server's disconnected, stop the client:
  if (!client.connected()) {
    Serial.println();
    Serial.println("disconnecting.");
    client.stop();

    // do nothing forevermore:
    while (true);
  }
}

