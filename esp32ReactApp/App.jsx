/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
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

import {BleManager} from 'react-native-ble-plx';
import base64 from 'react-native-base64';
import AxisPad from 'react-native-axis-pad';

const manager = new BleManager();
xUUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
yUUID = "ea651f32-4055-4655-98a7-80974e92d4a2";


function App() {

	const [xValue, setXValue] = useState(0);
	const [yValue, setYValue] = useState(0);
	const [device, setDevice] = useState();
	const [serviceUUID, setServiceUUID] = useState("");
	const [xCharUUID, setXCharUUID] = useState("");
	const [yCharUUID, setYCharUUID] = useState("");

	useEffect(() => {
		writeData();
	}, [xValue]);

	function scanDevices(){

		let serviceUUID = "", charUUID = "";
		console.log("Scanning Devices");
		manager.startDeviceScan(null, null, (error, device) => {
			if(device?.name == "MyESP32"){
				console.log("ESP Device Found");
				manager.stopDeviceScan();
				setDevice(device);
			}
			if(device){
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
								setServiceUUID(service.uuid);
								service.characteristics().then(c => {
									chars.push(c);
									c.forEach((char, i) => {
										if(char.uuid == xUUID){
											setXCharUUID(char.uuid);
										}
										else if(char.uuid == yUUID){
											setYCharUUID(char.uuid);
										}
									})
								})
							}
		
						});
					})
				}).catch(error => {
					// Handle errors
				});
			}
		});
	}

	function writeData(){
		if(device){
			manager.writeCharacteristicWithoutResponseForDevice(device.id, serviceUUID, xCharUUID, base64.encode(xValue.toString()),
			).then(characteristic => {
				console.log('X Value changed to :', base64.decode(characteristic.value));
			});
			manager.writeCharacteristicWithoutResponseForDevice(device.id, serviceUUID, yCharUUID, base64.encode(yValue.toString()),
			).then(characteristic => {
				console.log('Y Value changed to :', base64.decode(characteristic.value));
			});
		}
	}

  return (
    <SafeAreaView>

		<Button
			title="Connect"
			onPress={() => {
				scanDevices(); //usual call like vanilla javascript, but uses this operator
			}}                                 
        />
		<AxisPad
			style={styles.joystick}
			resetOnRelease={true}
			autoCenter={false}
			onValue={({ x, y }) => {
				// values are between -1 and 1
				setXValue(x);
				setYValue(y);
			}}>
		</AxisPad>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  joystick: {
    alignItems: 'center',
    flex: 1
  },
});

export default App;
