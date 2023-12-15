#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>

BLEServer *pServer = NULL;
BLECharacteristic *x_Characteristic = NULL;
BLECharacteristic *y_Characteristic = NULL;

#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define X_CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define Y_CHARACTERISTIC_UUID "ea651f32-4055-4655-98a7-80974e92d4a2"

class MyServerCallbacks : public BLEServerCallbacks
{
  void onConnect(BLEServer *pServer)
  {
    Serial.println("Connected");
  };

  void onDisconnect(BLEServer *pServer)
  {
    Serial.println("Disconnected");
  }
};

class CharacteristicsCallbacks : public BLECharacteristicCallbacks
{
  void onWrite(BLECharacteristic *pCharacteristic)
  {
    pCharacteristic->notify();
    Serial.print("Value Written: ");
    Serial.println(pCharacteristic->getValue().c_str());

  }
};

void setup()
{
  Serial.begin(115200);
  BLEDevice::init("MyESP32");
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

}


void loop()
{
  //Serial.println(message_characteristic->getValue().c_str());
}