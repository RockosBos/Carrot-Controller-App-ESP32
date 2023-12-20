#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <Math.h>

BLEServer *pServer = NULL;
BLECharacteristic *x_Characteristic = NULL;
BLECharacteristic *y_Characteristic = NULL;

#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914c"
#define X_CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a9"
#define Y_CHARACTERISTIC_UUID "ea651f32-4055-4655-98a7-80974e92d4a2"

//Change this ID for custom number ESP32
#define ESP32_ID "ESP32_1"

//Motor Controls
int motor1Pin1 = 26;
int motor1Pin2 = 25;
int enable1Pin = 27;

int motor2Pin1 = 14;
int motor2Pin2 = 12;
int enable2Pin = 13;

const int freq = 30000;
const int pwmChannel = 0;
const int resolution = 8;
const int maxSpeed = 255;
String rawSpeed = "0";
int speed = 0;


class MyServerCallbacks : public BLEServerCallbacks
{
  void onConnect(BLEServer *pServer)
  {
    speed = 0;
    Serial.println("Connected");
  };

  void onDisconnect(BLEServer *pServer)
  {
    speed = 0;
    Serial.println("Disconnected");
  }
};

class CharacteristicsCallbacks : public BLECharacteristicCallbacks
{
  void onWrite(BLECharacteristic *pCharacteristic)
  {
    pCharacteristic->notify();

    rawSpeed = pCharacteristic->getValue().c_str();
    
    speed = (int)(rawSpeed.toDouble() * -1 * maxSpeed);
  }
};

void setup()
{
  Serial.begin(115200);
  BLEDevice::init(ESP32_ID);
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);

  x_Characteristic = pService->createCharacteristic(
      X_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ |
      BLECharacteristic::PROPERTY_WRITE |
      BLECharacteristic::PROPERTY_NOTIFY |
      BLECharacteristic::PROPERTY_INDICATE
  );

  y_Characteristic = pService->createCharacteristic(
      Y_CHARACTERISTIC_UUID,
      BLECharacteristic::PROPERTY_READ |
      BLECharacteristic::PROPERTY_WRITE |
      BLECharacteristic::PROPERTY_NOTIFY |
      BLECharacteristic::PROPERTY_INDICATE
  );

  pService->start();
  pServer->getAdvertising()->start();

  x_Characteristic->setValue("Message one");
  x_Characteristic->setCallbacks(new CharacteristicsCallbacks());

  x_Characteristic->notify();
  //--------------------------------------------------------------\\

  y_Characteristic->setValue("Message two");
  y_Characteristic->setCallbacks(new CharacteristicsCallbacks());

  y_Characteristic->notify();


  Serial.println("Waiting for a client connection to notify...");
  Serial.println(ESP32_ID);

  //Motor Control

  pinMode(motor1Pin1, OUTPUT);
  pinMode(motor1Pin2, OUTPUT);
  pinMode(enable1Pin, OUTPUT);

  pinMode(motor2Pin1, OUTPUT);
  pinMode(motor2Pin2, OUTPUT);
  pinMode(enable2Pin, OUTPUT);

  ledcSetup(pwmChannel, freq, resolution);

  ledcAttachPin(enable1Pin, pwmChannel);
}


void loop()
{
  
  digitalWrite(motor1Pin1, HIGH);
  digitalWrite(motor1Pin2, LOW);
  Serial.print("RawSpeed: ");
  Serial.print(rawSpeed);
  Serial.print(" | Speed: ");
  Serial.println(speed);
  ledcWrite(pwmChannel, speed);


}