/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import {
	Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { Buffer } from 'buffer';
import {BleManager} from 'react-native-ble-plx';
import base64 from 'react-native-base64';

let devices;
const buffer = Buffer.from([0, 0]);
let serviceUUID, charUUID;
const manager = new BleManager();
const value = "1001";


function App(): JSX.Element {

	function scanDevices(){

		let serviceUUID = "", charUUID = "";
		console.log("Scanning Devices");
		manager.startDeviceScan(null, null, (error, device) => {
			//console.log(device?.name);
			if(device?.name == "MyESP32"){
				console.log("ESP Device Found");
				manager.stopDeviceScan();
				device.connect()
					.then(device => {
						console.log("Device Connected");
						return device.discoverAllServicesAndCharacteristics()
					})
					.then(device => {
						console.log("Retrieving Device Info...");
						device.services().then(services => {
							const chars = [];

							console.log("Checking Services");
							services.forEach((service, i) => {
								if(i === services.length - 1){
									serviceUUID = service.uuid;
									console.log("Checking Characteristics");
									service.characteristics().then(c => {
										chars.push(c);
										c.forEach((char, i) => {
											if(i === c.length - 1){
												charUUID = char.uuid;
											}
										})
									}).then(() => {
										console.log("Retrieved Id's!");
										console.log("ServiceID: " + serviceUUID + " | CharacteristicID: " + charUUID);

										manager.writeCharacteristicWithResponseForDevice(device.id, serviceUUID, charUUID, base64.encode(value),
										).then(characteristic => {
										  	console.log('Boxvalue changed to :', base64.decode(characteristic.value));
										});
									});
								}

							})
						})
					})
					.catch(error => {
						// Handle errors
					})
			}
		});
	}

  return (
    <SafeAreaView>

		<Button
			title="button"
			onPress={() => {
				scanDevices(); //usual call like vanilla javascript, but uses this operator
			}}                                 
        />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
