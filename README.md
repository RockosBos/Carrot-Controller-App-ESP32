# Carrot Controller Repository
## A bluetooth phone controller for G.R.O.W.I.N.G STEM 

This Repository will cover how to install and and run the Carrot Controller from your phone and an ESP32 module. 

## Download and Install via Google Play Store

_Carrot Controller is not currently available on the App Store or Google Play Store_

## Run Carrot Controller from this repository

### Set up React Native
1. Download or clone this repository to your local system.
2. Install [NodeJS](https://nodejs.org/en/download).
3. Open the project through command line or through Visual Studio Code.
4. In terminal run the following command .

`npm install`

### Set up Physical Device

This has only been tested with an Android device so these instructions will be Android specific.

1. Enable USB Debugging, this can be done through **Developer Options**. For instructions please follow this [link](https://developer.android.com/studio/debug/dev-options).
2. Plug the phone into your computer via USB. 
3. Accept prompt to allow USB debugging on device.

## Install Software for ESP32 Controller

We will now set up and deploy software to the ESP32 Module.

1. Open the file `/ESP32/ESP32.ino`.
2. You can now edit properties to customize your ESP32 setup.
3. Customize Carrot ID and all Pins.
4. You can now Deploy your updated code to your ESP32 Module. I used the Arduino IDE and followed these [Instructions](https://www.electronicshub.org/esp32-arduino-ide/).
5. Once set up you can upload your code to the esp32 module.


Run the Controller from the app.

1. Open a Command prompt window and navigate to the file location of the react app. 
2. Run the command `npm start`.
3. After a short wait the command prompt should ask what platform to run, select Android by pressing `A`.
4. The app will then be loaded as an app on your phone.

You now have the Carrot Controller App Installed.

5. Enter the ID of the ESP Controller you would like to Control (Just the Number).
6. Press the Connect Button, wait until the app says Connected.
7. Now use the Joystick to Control your ESP32!
