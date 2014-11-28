[{"id":"1a261f25.5adce9","type":"twilio-api","sid":"","from":"","name":""},{"id":"b25038aa.43d658","type":"ibmiot","name":"in"},{"id":"df0d69de.e9edd","type":"ibmiot in","authentication":"apiKey","apiKey":"b25038aa.43d658","inputType":"evt","deviceId":"","applicationId":"","deviceType":"+","eventType":"accel","commandType":"","format":"json","name":"SensorTag","service":"registered","allDevices":"","allApplications":"","allDeviceTypes":true,"allEvents":false,"allCommands":"","allFormats":"","x":71,"y":199,"z":"86405a29.976ee8","wires":[["4da69bd5.a3855c"]]},{"id":"bd4ade60.2b42b","type":"debug","name":"","active":true,"console":"false","complete":"true","x":984,"y":334,"z":"86405a29.976ee8","wires":[]},{"id":"e232ee03.ed7f1","type":"http response","name":"Show html","x":493,"y":581,"z":"86405a29.976ee8","wires":[]},{"id":"56dd9c2c.9f5adc","type":"http in","name":"Start html","url":"/","method":"get","x":66,"y":581,"z":"86405a29.976ee8","wires":[["2db4f174.71ed6e"]]},{"id":"874a5627.ead158","type":"function","name":"get distance","func":"// Define the location of the sensor\nvar sensorLocation = {\n\t\"latitude\": 48.665757, \n\t\"longitude\": 9.060126299999999 // Boeblingen Lab: 9.040126299999999 \n};\n\n// Get the location of the mobile phone from the msg object which has been passed on by the POST request\nvar mobileLocation = {\n\t\"latitude\": msg.payload.latitude, \n\t\"longitude\": msg.payload.longitude\n};\n\n// Store all data in the msg object\nmsg = {\n\tsensorLocation: sensorLocation,\n\tmobileLocation: mobileLocation,\n\tdistance: getDistance(sensorLocation, mobileLocation, 8)\n};\n\n// Get the distance between two points.\n// start and end are objects with latitude and longitude, decimals (default 2) is the number of decimals in the output, the return value is the  distance in kilometers\n// Function adapted from: https://gist.github.com/clauswitt/1604972\nfunction getDistance(start, end, decimals) {\n\t// Convert numeric degrees to radians\n\tif(typeof(Number.prototype.toRad) === \"undefined\") {\n\t\tNumber.prototype.toRad = function () {\n\t\t\treturn this * Math.PI / 180;\n\t\t}\n\t}\n\tdecimals = decimals || 2;\n\tvar earthRadius = 6371; // km\n\tlat1 = parseFloat(start.latitude);\n\tlat2 = parseFloat(end.latitude);\n\tlon1 = parseFloat(start.longitude);\n\tlon2 = parseFloat(end.longitude);\n\n\tvar dLat = (lat2 - lat1).toRad();\n\tvar dLon = (lon2 - lon1).toRad();\n\tvar lat1 = lat1.toRad();\n\tvar lat2 = lat2.toRad();\n\n\tvar a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +\n\t\t\tMath.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);\n\tvar c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));\n\tvar d = earthRadius * c;\n\n\tvar result =  Math.round(d * Math.pow(10, decimals)) / Math.pow(10, decimals);\n\treturn result;\n};\n\nreturn msg;","outputs":1,"x":258.5,"y":396,"z":"86405a29.976ee8","wires":[["f747018b.05039"]]},{"id":"f99bb995.016c88","type":"http in","name":"","url":"/location","method":"post","x":76,"y":396,"z":"86405a29.976ee8","wires":[["874a5627.ead158"]]},{"id":"f747018b.05039","type":"function","name":"is device near by","func":"// If the distance between the sensor and the mobile phone is less than 1 km the mobile phone is near by.\nif(msg.distance < 1 )\n{\n\tmsg.nearby =  true; //near by \n}\nelse\n{\n\tmsg.nearby = false;  // not near by\n}\n\n// Save the value of msg.nearby in the context.global variable which is accessible in all functions. This is necessary because the value is needed in the Node named \"check if alarm\". Also save it in the payload attribute.\ncontext.global.nearby = msg.payload = msg.nearby;\n\nreturn msg;","outputs":1,"x":447,"y":396,"z":"86405a29.976ee8","wires":[["d05862ce.9e2448"]]},{"id":"d05862ce.9e2448","type":"function","name":"check if alarm","func":"var motion = msg.motion; // true or false\nvar nearby = context.global.nearby; // true or false, loaded from the context.global variable which is accessible in all functions and which has been declared in \"is device near by\"\n\n// Only send an alarm when the sensor has detected motion and the mobile phone is not near by. The payload is the message that is going to be sent to the mobile phone.\nif(motion == true && nearby == false)\n{\n\tmsg.alarm = true;\n\tmsg.payload = \"Alarm!\";\n}\nelse\n{\n\tmsg.alarm = false;\n\tmsg.payload = \"No alarm.\";\n}\n\n// Save all data in the msg object which is going to be passed on. \nmsg = {payload: msg.payload, magnitude: msg.magnitude, motion: motion, nearby: nearby, alarm: msg.alarm};\n\nreturn msg;","outputs":1,"x":677,"y":274,"z":"86405a29.976ee8","wires":[["ccea175a.095be"]]},{"id":"ccea175a.095be","type":"switch","name":"","property":"alarm","rules":[{"t":"true"}],"checkall":"true","outputs":1,"x":855,"y":274,"z":"86405a29.976ee8","wires":[["bd4ade60.2b42b","e7042d5c.fb2fb"]]},{"id":"2db4f174.71ed6e","type":"template","name":"send location","field":"","template":"<!DOCTYPE html>\n<html>\n<head>\n\t<title>Bluemix demo // Alarm system</title>\n\t<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">\n\t<link href='http://fonts.googleapis.com/css?family=Open+Sans:400,300,600' rel='stylesheet' type='text/css'>\n\t<script type=\"text/javascript\" src=\"http://maps.google.com/maps/api/js?sensor=false\"></script>\n\t<style type=\"text/css\">\n\t\thtml {\n\t\t\tposition: relative;\n\t\t\tmin-height: 100%;\n\t\t}\t\n\t\n\t\tbody{\n\t\t\tbackground: #3b4b54;\n\t\t\tcolor: #ffffff;\n\t\t\tfont-family: 'Open Sans',​ Arial,​ sans-serif;\n\t\t\tfont-size: 25px;\n\t\t\ttext-align: center;\n\t\t\tmargin: 0 0 0 100px;\n\t\t}\n\t\t\n\t\t#map{\n\t\t\twidth: 60%;\n\t\t\tmin-height: 400px;\n\t\t\tmargin: 25px auto auto auto;\n\t\t}\n\t\t\n\t\tfooter{\n\t\t\tbackground: #ffffff;\n\t\t\tcolor: #3b4b54;\n\t\t\tpadding: 10px 0;\n\t\t\tposition: absolute;\n\t\t\tleft: 0;\n\t\t\tbottom: 0;\n\t\t\theight: 100px;\n\t\t\twidth: 100%;\n\t\t}\n\t\t\n\t\th1{\n\t\t\tmargin: 8px 0;\n\t\t}\n\t\t\n\t\tp{\n\t\t\tmargin: 24px;\n\t\t}\n\t\t\n\t\ta{\n\t\t\tcolor: #00aed1;\n\t\t\ttext-decoration: none;\n\t\t}\n\t\t\n\t\ta:hover, a:active{\n\t\t\ttext-decoration: underline;\n\t\t}\n\t\t\n\t\timg{\n\t\t\tfloat: left;\n\t\t\tmargin:  0 15px;\n\t\t\twidth: 90px;\n\t\t}\n\t\t\n\t\t// ##### Loading animation #####\n\t\t.spinner {\n\t\t  margin: 100px auto 0;\n\t\t  width: 70px;\n\t\t  text-align: center;\n\t\t}\n\n\t\t.spinner > div {\n\t\t  width: 18px;\n\t\t  height: 18px;\n\t\t  background-color: #333;\n\n\t\t  border-radius: 100%;\n\t\t  display: inline-block;\n\t\t  -webkit-animation: bouncedelay 1.4s infinite ease-in-out;\n\t\t  animation: bouncedelay 1.4s infinite ease-in-out;\n\t\t  /* Prevent first frame from flickering when animation starts */\n\t\t  -webkit-animation-fill-mode: both;\n\t\t  animation-fill-mode: both;\n\t\t}\n\n\t\t.spinner .bounce1 {\n\t\t  -webkit-animation-delay: -0.32s;\n\t\t  animation-delay: -0.32s;\n\t\t}\n\n\t\t.spinner .bounce2 {\n\t\t  -webkit-animation-delay: -0.16s;\n\t\t  animation-delay: -0.16s;\n\t\t}\n\n\t\t@-webkit-keyframes bouncedelay {\n\t\t  0%, 80%, 100% { -webkit-transform: scale(0.0) }\n\t\t  40% { -webkit-transform: scale(1.0) }\n\t\t}\n\n\t\t@keyframes bouncedelay {\n\t\t  0%, 80%, 100% { \n\t\t\ttransform: scale(0.0);\n\t\t\t-webkit-transform: scale(0.0);\n\t\t  } 40% { \n\t\t\ttransform: scale(1.0);\n\t\t\t-webkit-transform: scale(1.0);\n\t\t  }\n\t\t}\n\t</style>\n</head>\n<body>\n<h1>Bluemix demo // Alarm system</h1>\n<div id=\"coordinates\">\n\t<p>loading your location ...</p>\n\t<div class=\"spinner\">\n\t\t<div class=\"bounce1\"></div>\n\t\t<div class=\"bounce2\"></div>\n\t\t<div class=\"bounce3\"></div>\n\t</div>\n</div>\n\n<div id=\"map\"></div> \n<footer>\n\t<img src=\"https://raw.githubusercontent.com/chrrel/bluemix-alarm-system/master/readme/bluemix_logo.png\">\n\t<p>Made with <a href=\"http://bluemix.net\">Bluemix</a> // Find the code on <a href=\"https://github.com/chrrel/bluemix-alarm-system\">GitHub</a> // Christian Rellmann</p>\n</footer>\n<script>\n// Store the <div> in which the coordinates will be displayed in the variable x\nvar x = document.getElementById(\"coordinates\");\n\n// Call getLocation() when the entire page loads\nwindow.onload = function(){\n\tgetLocation();\n};\n\n// call getLocation every 30 seconds (= 30000 ms)\nsetInterval(function(){ \n\tgetLocation();\n}, 30000);\n\n// Get the location by using the HTML5 Geolocation API\nfunction getLocation()\n{\n\t// Check if geolocation is supported\n\tif (navigator.geolocation)\n\t{\n\t\tnavigator.geolocation.getCurrentPosition(showPosition);\n\t} \n\telse\n\t{ \n\t\tx.innerHTML = \"Geolocation is not supported in this browser.\";\n\t}\n}\n\n// Show the coordinates on the page / call showMap() and postData()\nfunction showPosition(position)\n{\n\tx.innerHTML = \"<p>Latitude: \" + position.coords.latitude + \" // Longitude: \" + position.coords.longitude +\"</p>\";\t\n\tshowMap(position.coords.latitude, position.coords.longitude);\n\tpostData(position.coords.latitude, position.coords.longitude);    \n}\n\n// Send the coordinates passed as parameters to the server\nfunction postData(latitude,longitude)\n{\n\t// Create a JSON object that contains the coordinates\n\tvar coordinates = '{\"latitude\": ' + latitude + ', \"longitude\": ' +longitude + '}';\n\tJSON.stringify(coordinates);\n\t\n\t// Create an XHR instance, for older Internet Explorer versions an ActiveXObject is needed\n\tvar xhr;\n\tif (window.XMLHttpRequest) {\n\t\txhr = new XMLHttpRequest();\n\t}\n\telse if (window.ActiveXObject) {\n\t\txhr = new ActiveXObject(\"Msxml2.XMLHTTP\");\n\t}\n\telse\n\t{\n\t\tthrow new Error(\"Ajax is not supported in this browser\");\n\t}\n    \n\txhr.open('POST', '/location'); // Initialize the server contact, use the post method to send data to the server path \"/location\"\n\txhr.setRequestHeader(\"Content-Type\", \"application/json\"); // Set the request header\n\txhr.send(coordinates); // Send the data\n}\n \n// Show the current location on a Map (Google Maps)\nfunction showMap(latitude, longitude)\n{\n\t// Zoom factor 13 / set the coordinates as the center / ROADMAP displays a normal, default 2D map / disable the default UI elements\n\tvar mapOptions = {\n\t\tzoom: 13,\n\t\tcenter: new google.maps.LatLng(latitude, longitude), \n\t\tmapTypeId: google.maps.MapTypeId.ROADMAP, \n\t\tdisableDefaultUI: true \n\t};\n\t\n\t// Place the map in the <div> with the ID \"map\"\n\tvar map = new google.maps.Map(document.getElementById(\"map\"), mapOptions);\n\t  \n\t// Set a marker at the current location\n\tvar marker = new google.maps.Marker({\n\t\tposition: new google.maps.LatLng(latitude, longitude),\n\t\tmap: map,\n\t\ttitle: \"Location\"\n\t});\n}\n</script>\n</body>\n</html>","x":271,"y":581,"z":"86405a29.976ee8","wires":[["e232ee03.ed7f1"]]},{"id":"4da69bd5.a3855c","type":"function","name":"check if motion","func":"var accelX = msg.payload.d.accelX; // acceleration in the x direction \nvar accelY = msg.payload.d.accelY; // acceleration in the y direction \nvar accelZ = msg.payload.d.accelZ; // acceleration in the z direction \n\n// Calculate the magnitude of the acceleration vector. If the sensor is not moved the magnitude is 1 (1 g = 9,81 m/s^2, standard gravity).\nmsg.magnitude = Math.sqrt(accelX*accelX + accelY*accelY + accelZ*accelZ);\nmsg.magnitude = Math.round(msg.magnitude * 10000) / 10000\n\n// Set motion = true when a noticeable acceleration is detected.\nif(msg.magnitude > 1.2)\n{\n\tmsg.motion = true;\n}\nelse\n{\n\tmsg.motion = false;\n}\n\nreturn msg;","outputs":1,"x":431,"y":200,"z":"86405a29.976ee8","wires":[["d05862ce.9e2448"]]},{"id":"e7042d5c.fb2fb","type":"twilio out","service":"twilio","twilio":"1a261f25.5adce9","from":"","number":"","name":"twilio","x":1001,"y":177,"z":"86405a29.976ee8","wires":[]}]