# Demo: Building a cloud-based alarm system with Bluemix

## Overview

* **Bluemix Demo** using Node-RED Start
* **Required services:** Internet of Things, Twilio (and Cloudant used automatically by Node-RED)
* **Functionality:** The App will send a text message when the sensor (e.g. mounted on a door) detects motion and your phone is not nearby.
* **Needed Devices:** TI SensorTag, Linux-PC / Mac with Bluetooth 4.0 (BLE)
* **Presentation:** You can find my presentation for this demo as a PowerPoint file and as a PDF in the presentation directory.

## Introduction

![The program](https://raw.githubusercontent.com/chrrel/bluemix-alarm-system/master/readme/program_chart.png)

This demo shows how to build a cloud-based alarm system as an example for [Bluemix'](https://bluemix.net/) capabilities related to the Internet of Things.

The app sends an alarm notification as a text message if the sensor that is for example mounted on a door detects motion. Consequently you will receive an alarm when the door is opened.

To make sure that it is not you who is opening the door, the app checks if your mobile phone is nearby and won't send an alarm in this case.

As a sensor we use the [TI SensorTag](http://www.ti.com/tool/cc2541dk-sensor) which sends the data it is collecting via Bluetooth to a computer that passes it on to your Bluemix app using the MQTT protocol. This is done by a node.js app running on your computer.

**Requirements**: The computer you are using for publishing the sensor data has to support Bluetooth 4.0 (BLE) and shall either run on a Linux or a Mac system. You can also use a single-board computer, e.g. a BeagleBone Black. 

Since this demo is based on Ryan Baxter's SensorTag demo I suggest to also have a look at [his documentation](https://github.com/IBM-Bluemix/iot-sensor-tag).

## Preparation

Set up the node.js app on your computer that connects to a TI Sensor Tag and publishes the received data to your IoT Service in Bluemix.

You have to have installed [node.js](http://nodejs.org/download/), [npm](https://www.npmjs.org/package/download) and [git](http://git-scm.com/downloads).
_______________


### If you are using Linux

[Additional information]( http://blog.izs.me/post/87525128203/how-to-install-node-js-and-npm-on-ubuntu-14-04) on installing node.js on Ubuntu.

Install additional packages for connecting to the SensorTag.

	sudo apt-get install bluez
	sudo apt-get install libbluetooth-dev

### If you are using OSX

Run the following command so that connecting to the SensorTag is possible. Restart your computer afterwards.

	sudo nvram bluetoothHostControllerSwitchBehavior="never"

_______________


Clone the repository by Ryan Baxter that contains the node.js app.

	git clone https://github.com/IBM-Bluemix/iot-sensor-tag.git

Open the cloned directory, go to the publish directory and replace the content of the package.json file with the following lines:

```javascript
{
   "author": "IBM",
   "dependencies": {
      "sensortag":"*",
      "mqtt":"*",
      "getmac":"*",
      "properties":"*",
      "noble":"*",
      "debug":"*"
   },
   "description": "Published data to the IoT cloud.",
   "main": "sensor-tag.js"
}
```
In the terminal change to the publish directory.

	cd iot-sensor-tag/publish

Install the needed dependencies by using the following command

	npm install 

#Setting up a new app for this demo

1. **Log in to Bluemix.**

2. **Add the Internet of Things service**

	a. On your dashboard click: „Add a service“.

	b. Choose the “Internet of Things” Service in the catalog.

	c. Click "Create".

	d. Click "Launch".

	e. Add a new device, select TI SensorTag and enter the MAC-Adress of the computer publishing the data to Bluemix (without the “:”).

	f. Click "Continue".

	c. Create a file named config.properties in the publish directory on your computer and copy the displayed credentials into it. Afterwards click "Done".

3. **Create a new app using Node-RED**

	a. On the Bluemix dashboard click: "Create an app"

	b. Select “Node-RED Starter”

	c. Choose a name for your app.

	d. Now the dashboard of your app is displayed.

## Creating the program with Node-RED

Now you can visit your app at *YourAppName.mybluemix.net*. Follow the red button to your Node-Red interface.

![The complete flow](https://raw.githubusercontent.com/chrrel/bluemix-alarm-system/master/readme/complete_flow.png)

1. **Import the Node-RED flow.**

	a. Copy the JSON code from the file "flow_without_twilio" in the node-red folder in this repository to your clipboard.

	b. In Node-RED click on the button next to the “Deploy”-Button and select “Import ... Clipboard”.

	c. Paste the copied code here and click "OK".

	d. Click "Deploy".
   
2. **Modify the flow for your app.**

	a. Launch your IoT service (where you registered the device) again and go to the tab "API Keys".

	b. Add a new API Key.

	c. Copy the displayed key and the auth token and open Node-RED again.

	d. Click on the “SensorTag”-Node and afterwards on the button next to the API Key field. Insert the copied credentials in the corresponding fields and click "Update".

	e. Change the Device Id to the Id you have registered in the “Internet of Things”-Service and click "Ok".

	f. Set the location of your sensor by opening the "get distance" node and changing the coordinates in the sensorLocation Object.

	g. Click "Deploy". 


## Adding the Twilio service for sending text messages
1. **Now you can add the Twilio service.**

	a. Open your app on the Bluemix dashboard.

	b. Click “Add a service”.

	c. Choose the “Twilio” service.

	c. You now will be asked to enter your Account SID and Auth Token. 

	If you don’t have a Twilio account you can register at [twilio.com](https://www.twilio.com/). 
	Copy your credentials displayed on twilio.com to the corresponding fields in the Bluemix dialog. 
	
	Make sure to give Twilio the permission to send messages in your country by enabling the needed countries at https://www.twilio.com/user/account/settings/international.

	d. Click "Create". 

	e. Bluemix will now ask you if you want to restage your app. Click "Ok".

	f. Copy the JSON code from the file "twilio" in the node-red folder in this repository to your clipboard.

	g. Import the code in Node-RED (“Import ... Clipboard”) and connect the new twilio node to the switch node.

	h. Open the “Twilio”-Node and select the name of the service you have added to your app in step four. Also set the phone number which is going to send the messages (your Twilio number) and the one that is going to receive the messages from your app.


## Using the app

Make sure your app is running and open *YourAppName.mybluemix.net*. 

Then go to your publish directory in the terminal and start the node.js program on your computer.

	node sensor-tag.js 
	
If you are working on Ubuntu you have to use the following command.

	sudo nodejs sensor-tag.js 

You should now see the following output

	Device MAC Address: 28d244692c6d
	
	Make sure the Sensor Tag is on!


Press the power button on the SensorTag.  The output now is

	Discovered device with UUID: 78a5048c275b

	Connected To Sensor Tag

Your data is now beeing published to the IoT service you use in your Bluemix app.

## Hints for using the app

* At *YourAppName.mybluemix.net* your current location will be detected. You don't necessarily need to open it on a mobile device, opening it on your computer will be fine, too. 

	The website will ask you to share your location, which is essential for the system to work. Best select “Always share location” because the site will check your location every 30 seconds. 

* In case an alarm has been detected the you will get an alarm text message but can also see the alarm in the Node-RED debug tab.

* Keep in mind: If you set the location of the sensor to the coordinates where you are right now the app will come to the conclusion that you are nearby and so it won't  send an alarm as long as you are near. ;)

* It may be necessary to change the values for the minimum acceleration which decides if there has been motion (“check if motion") and the minimum distance to decide if the device is nearby (“is device nearby”). This depends on the accuracy you want to have.

## Additional technical information

### Detecting the location

![Flow for detecting the location](https://raw.githubusercontent.com/chrrel/bluemix-alarm-system/master/readme/location_site.png)

The flow creates a website that uses the HTML 5 Geolocation API to detect your location on the client side. It does a new check every 30 seconds and then sends a JSON object which contains the coordinates to your Bluemix app by using an Ajax POST request.

### Getting the location and the distance to the sensor

![Flow for getting the location](https://raw.githubusercontent.com/chrrel/bluemix-alarm-system/master/readme/location_get.png)

This flow receives the JSON object containing the coordinates from a POST request. Then the distance between your location and the given location of the sensor is calculated so that the program can decide whether your device is nearby or not. 
 
The information if the device is nearby will be stored in the context.global variable. This is necessary because the value is needed in the “check if alarm” node. (Actually the flow does not need to be connected optically with the flow that checks if the sensor has detected motion in Node-RED. This is just done for visualizing the algorithm.)

### Receiving the sensor data and checking for motion

![Flow for receiving sensor data](https://raw.githubusercontent.com/chrrel/bluemix-alarm-system/master/readme/get_sensordata.png)

The TI SensorTag has a three axis acceleration sensor. Consequently the IoT input node receives three acceleration values. These are the accelerations in the x, the y and the z direction. Since we only are interested in the fact if acceleration has been detected or not, we calculate the magnitude of the acceleration vector. 

If the sensor is not moved the magnitude will be approx. 1 due to the standard gravity which is 1 g (= 9.81 m/s²).

Afterwards the information if motion has been detected will be passed on. 

### Combining the data and checking for an alarm 

![Flow for checking for an alarm](https://raw.githubusercontent.com/chrrel/bluemix-alarm-system/master/readme/alarm_check.png)

Combining the sensor and the location information we can then decide if someone else has opened the door and an alarm needs to be sent with the twilio service.
