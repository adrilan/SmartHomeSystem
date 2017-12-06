#include <SoftwareSerial.h>
#include <SocketIOClient.h>
#include <SerialCommand.h>

const byte RX = D1;
const byte TX = D2;

SoftwareSerial mySerial = SoftwareSerial(RX, TX, false, 256);
SerialCommand sCmd(mySerial);

SocketIOClient client ;
const char * ssid = "mocmeo" ;
const char * password = "12345678" ;

unsigned long previousMillis = 0;
long interval = 4000;
char host[] = "192.168.0.111";
int port = 3000;
extern String RID;
extern String Rcontent;
extern String Rfull;

void setup()
{
  Serial.begin(115200);
  mySerial.begin(115200);
  delay(10);

  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  //Waiting until its connected
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print('.');
  }

  Serial.println();
  Serial.println("WiFi Connected");
  Serial.println("IP Address: ");
  Serial.println(WiFi.localIP());

  if (client.connect(host, port)) {
    Serial.printf("[SocIO] Connected to url: %s\n",  host);
    client.send("connection", "message", "1st ESP8266 connected!" + WiFi.localIP().toString());
  } else {
    Serial.println("Connection failed.");
  }
  sCmd.addDefaultHandler(defaultCommand);
}

void loop()
{
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis > interval)
  {
    previousMillis = currentMillis;
    client.heartbeat(0);
  }

  //When catching any event, we have 2 parameters:
  //  +RID: Event's name
  //  +RFull: List of parameters which are being put in JSON string!
  if (client.monitor()) {
    if (RID == "switch1" || RID == "switch2"
        || RID == "switch3") {
      mySerial.print(RID);
      mySerial.print('\r');
      mySerial.print(Rfull);
      mySerial.print('\r');

      //Print out to Serial monitor
      Serial.print(RID);
      Serial.print(' ');
      Serial.println(Rfull);
      RID = "";
    }
  }

  //Reconnecting
  if (!client.connected()) {
    client.reconnect(host, port);
  }
  sCmd.readSerial();
}

void defaultCommand(String command) {
  char * json = sCmd.next();
  client.send(command, (String)json);

  // Print the serial monitor to debug
  Serial.print(command);
  Serial.print(' ');
  Serial.println(json);
}
