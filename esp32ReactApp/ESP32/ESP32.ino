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

#define DDRIVE_MIN -255 //The minimum value x or y can be.
#define DDRIVE_MAX 255  //The maximum value x or y can be.
#define MOTOR_MIN_PWM -225 //The minimum value the motor output can be.
#define MOTOR_MAX_PWM 255 //The maximum value the motor output can be.

int LeftMotorOutput; //will hold the calculated output for the left motor
int RightMotorOutput; //will hold the calculated output for the right motor

//Motor Controls
int motor1Pin1 = 26;
int motor1Pin2 = 25;
int enable1Pin = 27;

int motor2Pin1 = 14;
int motor2Pin2 = 12;
int enable2Pin = 13;

const int freq = 30000;
const int pwmChannel = 0;
const int pwmChannelY = 1;
const int resolution = 8;
const int maxSpeed = 255;
String rawXSpeed = "0";
String rawYSpeed = "0";
int xSpeed = 0;
int ySpeed = 0;


class MyServerCallbacks : public BLEServerCallbacks
{
  void onConnect(BLEServer *pServer)
  {
    xSpeed = 0;
    Serial.println("Connected");
  };

  void onDisconnect(BLEServer *pServer)
  {
    ySpeed = 0;
    Serial.println("Disconnected");
  }
};

class XCharacteristicsCallbacks : public BLECharacteristicCallbacks
{
  void onWrite(BLECharacteristic *pCharacteristic)
  {
    pCharacteristic->notify();

    rawXSpeed = pCharacteristic->getValue().c_str();
    
    xSpeed = (int)(rawXSpeed.toDouble() * -1 * maxSpeed);
  }
};

class YCharacteristicsCallbacks : public BLECharacteristicCallbacks
{
  void onWrite(BLECharacteristic *pCharacteristic)
  {
    pCharacteristic->notify();

    rawYSpeed = pCharacteristic->getValue().c_str();
    
    ySpeed = (int)(rawYSpeed.toDouble() * -1 * maxSpeed);
  }
};

void CalculateTankDrive(float x, float y)
{

  float rawLeft;
  float rawRight;

  //Angle in Degrees
  float z = sqrt(x * x + y * y);

  float radZ = acos(abs(x) / z);

  if(radZ == NULL){
    radZ = 0;
  }

  float angle = radZ * 180 / PI;

  float turnCoefficient = -1 + (angle / 90) * 2;
  float turn = turnCoefficient * abs(abs(y) - abs(x));
  turn = round(turn * 100) / 100;

  float mov = max(abs(y), abs(x));

  if ((x >= 0 && y >= 0) || (x < 0 && y < 0))
  {
    rawLeft = mov; rawRight = turn;
  }
  else
  {
    rawRight = mov; rawLeft = turn;
  }

  //Invert Direction
  if(y < 0){
    rawLeft = 0 - rawLeft;
    rawRight = 0 - rawRight;
  }

  LeftMotorOutput = map(rawLeft, DDRIVE_MIN, DDRIVE_MAX, MOTOR_MIN_PWM, MOTOR_MAX_PWM);
  RightMotorOutput = map(rawRight, DDRIVE_MIN, DDRIVE_MAX, MOTOR_MIN_PWM, MOTOR_MAX_PWM);
}

void setup()
{
  Serial.begin(9600);
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
  x_Characteristic->setCallbacks(new XCharacteristicsCallbacks());

  x_Characteristic->notify();
  //--------------------------------------------------------------\\

  y_Characteristic->setValue("Message two");
  y_Characteristic->setCallbacks(new YCharacteristicsCallbacks());

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

}


void loop()
{
  
  Serial.print("XSpeed: ");
  Serial.print(xSpeed);
  Serial.print(" | YSpeed: ");
  Serial.print(ySpeed);

  CalculateTankDrive(xSpeed, ySpeed);

  analogWrite(enable1Pin, abs(LeftMotorOutput));
  analogWrite(enable2Pin, abs(RightMotorOutput));

  if(LeftMotorOutput < 0){
    digitalWrite(motor1Pin1, HIGH);
    digitalWrite(motor1Pin2, LOW);
  }
  else{
    digitalWrite(motor1Pin1, LOW);
    digitalWrite(motor1Pin2, HIGH);
  }

  if(RightMotorOutput < 0){
    digitalWrite(motor2Pin1, HIGH);
    digitalWrite(motor2Pin2, LOW);
  }
  else{
    digitalWrite(motor2Pin1, LOW);
    digitalWrite(motor2Pin2, HIGH);
  }

  Serial.print(" | LOutput: ");
  Serial.print(LeftMotorOutput);
  Serial.print(" | rOutput: ");
  Serial.println(RightMotorOutput);

}