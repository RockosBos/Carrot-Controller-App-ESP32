/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import {
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
import BleManager from 'react-native-ble-manager';

function BleTest(){
	BleManager.start({showAlert: false}).then(() => {
		console.log("Module Init...")
	});
}

let devices;
const buffer = Buffer.from([0, 0]);
let serviceUUID, charUUID;

function App(): JSX.Element {

	useEffect(() => {
		try {
		  BleManager.start({showAlert: false})
			.then(() => console.debug('BleManager started.'))
			.catch(error =>
			  console.error('BeManager could not be started.', error),
			);
		} catch (error) {
		  console.error('unexpected error starting BleManager.', error);
		  return;
		}

		BleManager.scan([], 5, true).then(() => {
			console.log("Scan Completed");
		});

		BleManager.getBondedPeripherals().then((data) => {
			let esp32Peripheral = data[0];
			devices = data;
			for(let i = 0; i < data.length; i++){
				if(data[i].name?.toString() == "MyESP32"){
					esp32Peripheral = data[i];
				}
				
			}

			BleManager.connect(esp32Peripheral.id.toString()).then(
				() => {
					console.log("Connection Successful");
					
					BleManager.retrieveServices(esp32Peripheral.id.toString()).then(
						(info) => {
							charUUID = info.characteristics[4].characteristic;
							serviceUUID = info.services[2].uuid;
							BleManager.writeWithoutResponse(
								esp32Peripheral.id,
								serviceUUID,
								charUUID,
								buffer.toJSON().data
							).then(() => {
								console.log("Success");
							});

						}
					);
				}
			);

			
		});
		
		// eslint-disable-next-line react-hooks/exhaustive-deps
	  }, []);


  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
		<TextInput
		
        value={"Hello"}
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
