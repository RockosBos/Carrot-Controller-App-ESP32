/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useRef, useState } from 'react';
import {
	Button,
  	Pressable,
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

updateFrequency = 20;
updateCounter = 0;

updateYFrequency = 20;
updateYCounter = 0;

function App() {

	const [xValue, setXValue] = useState(0);
	const [yValue, setYValue] = useState(0);
	const [espDevice, setDevice] = useState();
	const [serviceUUID, setServiceUUID] = useState("");
	const [xCharUUID, setXCharUUID] = useState("");
	const [yCharUUID, setYCharUUID] = useState("");
	const [deviceID, setDeviceID] = useState("0");

	const xSavedCallback = useRef();
	const ySavedCallback = useRef();
	const deviceSavedCallback = useRef();

	function xCallback(){
		return xValue;
	}

	function yCallback(){
		return yValue;
	}

	function deviceCallback(){
		return {
			espDevice,
			serviceUUID,
			xCharUUID,
			yCharUUID
		};
	}

	const [time, setTime] = useState(new Date());

	// useEffect(() => {
	// 	//console.log("x value updated: " + xValue);
	// }, [xValue]);

	// useEffect(() => {
	// 	//console.log("y value updated: " + yValue);
	// }, [yValue]);

	useEffect(() => {
		xSavedCallback.current = xCallback;
		ySavedCallback.current = yCallback;
		deviceSavedCallback.current = deviceCallback;
	});

	useEffect(() => {

		const interval = setInterval(() => {
			device = deviceSavedCallback.current();

			if(device.espDevice != undefined){
				writeXData(xSavedCallback.current(), device);
				writeYData(ySavedCallback.current(), device);
			}
		}, 100);
		return () => {
			clearInterval(interval);
		};
	}, []);



	function scanDevices(){
		console.log("Scanning Devices");
		manager.startDeviceScan(null, null, (error, device) => {
			if(device?.name == "ESP32_" + deviceID){
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
									setDeviceIsActive(true);
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

	function writeXData(x, device){
		console.log("X Updated: " + x);
		manager.writeCharacteristicWithResponseForDevice(device.espDevice.id, device.serviceUUID, device.xCharUUID, base64.encode(x.toString()),
		).then(characteristic => {
				
		});
	}

	function writeYData(y, device){
		console.log("Y Updated: " + y);
		manager.writeCharacteristicWithResponseForDevice(device.espDevice.id, device.serviceUUID, device.yCharUUID, base64.encode(y.toString()),
		).then(characteristic => {
			
		});
	}

	function onChangeId(num){
		setDeviceID(num);
	}

	function onDisconnect(){
		

		espDevice.cancelConnection().then(() => {
			setDeviceIsActive(false);
			console.log("Device Disconnected");
		})
	}

  return (
    <SafeAreaView>
		<View style={styles.header}>
			<Text style={styles.headerText}> Enter Carrot ID: </Text>
			<TextInput
				style={styles.input}
				editable
				maxLength={2}
				onChangeText={num => onChangeId(num)}
			/>
			<Pressable
				style={styles.connectButton}
				onPress={() => {
					scanDevices(); 
				}}                                 
			>
				<Text>Connect</Text>
			</Pressable>
			{espDevice &&
				<Pressable
					style={styles.disconnectButton}
					onPress={() => {
						onDisconnect(); 
					}}                                 
				>
					<Text>Disconnect</Text>
				</Pressable>
			}
		</View>
		{espDevice && <Text>
			Connected!
		</Text>
		}
		<View style={styles.joystick}>
			<AxisPad
				resetOnRelease={true}
				autoCenter={false}
				size={150}
				onValue={({ x, y }) => {
					// values are between -1 and 1
					setXValue(x);
					setYValue(y);
				}}>
			</AxisPad>
		</View>
		<Text>
			{xValue}
		</Text>
		<Text>
			{yValue}
		</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  joystick: {
	display: 'flex',
    alignItems: 'center',
    flex: 1,
	marginTop: "10%"
  },
  header: {
	display: 'flex',
    alignItems: 'center',
    height: '25%',
	backgroundColor: "#b1c27e",
	flexDirection: "row"
  },
  input: {
	backgroundColor: "#010101",
	borderRadius: 4,
	height: "80%",
	justifyContent: "center",
  },
  headerText: {
	color: "#FFFFFF",
  },
  connectButton: {
	backgroundColor: "#6b9e43",
	margin: "2%",
	height: "80%",
	paddingHorizontal: "5%",
	borderRadius: 4,
	justifyContent: "center",
  },
  disconnectButton: {
	backgroundColor: "#d58d4c",
	margin: "2%",
	height: "80%",
	paddingHorizontal: "5%",
	borderRadius: 4,
	justifyContent: "center",
  },
});

export default App;
