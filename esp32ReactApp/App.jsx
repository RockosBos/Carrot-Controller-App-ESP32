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
xUUID = "beb5483e-36e1-4688-b7f5-ea07361b26a9";
yUUID = "ea651f32-4055-4655-98a7-80974e92d4a2";


function App() {

	const [xValue, setXValue] = useState(0);
	const [yValue, setYValue] = useState(0);
	const [espDevice, setDevice] = useState();
	const [serviceUUID, setServiceUUID] = useState("");
	const [xCharUUID, setXCharUUID] = useState("");
	const [yCharUUID, setYCharUUID] = useState("");

	useEffect(() => {
		writeXData();
	}, [xValue]);

	useEffect(() => {
		writeYData();
	}, [yValue]);

	function scanDevices(){

		console.log("Scanning Devices");
		manager.startDeviceScan(null, null, (error, device) => {
			if(device?.name == "MyESP32_2"){
				console.log("ESP Device Found");
				manager.stopDeviceScan();
				setDevice(device);
			
				device.connect()
				.then(device => {
					console.log("Device Connected");
					return device.discoverAllServicesAndCharacteristics()
				})
				.then(espDevice => {
					espDevice.services().then(services => {
						const chars = [];
		
						console.log("Checking Services");
						services.forEach((service, i) => {
							console.log("Service UUID: " + service.uuid);
							setServiceUUID(service.uuid);
							service.characteristics().then(c => {
								chars.push(c);
								c.forEach((char, i) => {
									console.log("UUID: " + char.uuid);
									if(char.uuid == xUUID){
										setXCharUUID(char.uuid);
										console.log("X Characteristic found");
									}
									else if(char.uuid == yUUID){
										setYCharUUID(char.uuid);
										console.log("Y Characteristic found");
									}
								})
							})
		
						});
					})
				}).catch(error => {
					// Handle errors
				});
			}
		});
	}

	function writeXData(){
		if(espDevice){
			manager.writeCharacteristicWithResponseForDevice(espDevice.id, serviceUUID, xCharUUID, base64.encode(xValue.toString()),
			).then(characteristic => {
				console.log('X Value changed to :', base64.decode(characteristic.value));
				
			});
			
		}
	}

	function writeYData(){
		if(espDevice){
			manager.writeCharacteristicWithResponseForDevice(espDevice.id, serviceUUID, yCharUUID, base64.encode(yValue.toString()),
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
