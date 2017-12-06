#include<ArduinoJson.h>
#include<SoftwareSerial.h>
#include<SerialCommand.h>
#include<Servo.h>

Servo servo1, servo2, servo3;
const byte RX = 3;
const byte TX = 2;

SoftwareSerial mySerial = SoftwareSerial(RX, TX);
SerialCommand sCmd(mySerial);

int red = 5, blue = 4;
int doorSensor = 6;
int buzzer = 7;

int state; //0 close - 1 open switch
const unsigned long cycleInterval = 500UL ; // Every 500ms, the cycle is repeated
unsigned long timerStart = 0;

int servoangle1 = 0;
int servoangle2 = 90;

void setup() {
  Serial.begin(115200);
  mySerial.begin(115200);

  pinMode(red, OUTPUT);
  pinMode(blue, OUTPUT);

  // Setup door sensor pin as INPUT, since the signal is transmitted to the Arduino
  pinMode(doorSensor, INPUT_PULLUP);
  servo1.attach(9);
  servo2.attach(10);
  servo3.attach(11);

  sCmd.addCommand("led_ahihi", led);
  sCmd.addCommand("switch1", switch1);
  sCmd.addCommand("switch2", switch2);
  sCmd.addCommand("switch3", switch3);
  
}

void loop () {
  state = digitalRead(doorSensor);
  if (state == 1 && millis() - timerStart > cycleInterval) {
    timerStart = millis();
    StaticJsonBuffer <200> jsonBuffer ;
    JsonObject & root = jsonBuffer.createObject();
    // read the sensor value and print to root
    root["digital"]= state;
    root["message"]= state ? "OPEN" : "CLOSED";
    Serial.println(state);
//    alert();

    mySerial.print("OPEN"); 
    mySerial.print('\r'); 
    root.printTo(mySerial); 
    mySerial.print('\r');
  }
  
  sCmd.readSerial();
}


void led () {
  char* json = sCmd.next(); 
  Serial.println(json);
}

int servoAngle(byte value) {
  if (value == 1) 
    return servoangle1;
  else 
    return servoangle2;
}

void switch1 () {
  char* json = sCmd.next(); 
  Serial.println(json);
  StaticJsonBuffer<200> jsonBuffer;
  JsonObject& root = jsonBuffer.parseObject(json);
  servo1.write(servoAngle((int)root["switch1"][0]));
}

void switch2 () {
  char* json = sCmd.next(); 
  Serial.println(json);
  StaticJsonBuffer<200> jsonBuffer;
  JsonObject& root = jsonBuffer.parseObject(json);
  servo2.write(servoAngle((int)root["switch2"][0]));
}

void switch3 () {
  char* json = sCmd.next(); 
  Serial.println(json);
  StaticJsonBuffer<200> jsonBuffer;
  JsonObject& root = jsonBuffer.parseObject(json);
  servo3.write(servoAngle((int)root["switch3"][0]));
}

void alert() {
  state = digitalRead(doorSensor);
  if (state == HIGH) {
    tone(buzzer, 10000);
    Serial.println("Door OPENED");
  }
  else {
    noTone(buzzer);
    Serial.println("Door CLOSED");
  }
}

