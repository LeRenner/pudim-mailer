const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
var mqtt = require('mqtt');

// Connect to MQTT broker
var hostname = require('fs').readFileSync('/config/hostname', 'utf-8').trim();
var mqttPort = require('fs').readFileSync('/config/port', 'utf-8').trim();
var client = mqtt.connect('mqtt://' + hostname + ':' + mqttPort);

const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(cors());

// Route to handle POST requests
app.post('/api/sendMail', (req, res) => {
	const receivedData = req.body;
	console.log('Received JSON data:', receivedData);

	if (receivedData.text.length < 1000 && receivedData.text.length > 0 && receivedData.name.length < 30) {
		console.log('Accepted the request!');
		// Send data to MQTT broker

		if (receivedData.name == undefined || receivedData.name == '') {
			receivedData.name = 'Anonymous';
		}

		let messageText = "<u><b>" + receivedData.name + ' says:</b></u> \n\n' + receivedData.text;

		// if received data contains the substring "/daniel", send to different mqtt topic
		if (receivedData.text.toLowerCase().includes('/daniel')) {
			console.log('Sending message to MQTT broker:', messageText);
			client.publish('danielMail', messageText);
			res.send('Message sent to Daniel!');
			return;
		}

		console.log('Sending message to MQTT broker:', messageText);

		client.publish('pudimMail', messageText);

		res.send('Message sent!');
	} else {
		if (receivedData.text.length > 1000) {
			console.log('Rejected the request for being too long!');
			res.send('The message cannot be longer than 1000 characters!');
		} else if (receivedData.name.length >= 30) {
			console.log('Rejected the request for having a name too long!');
			res.send('The name cannot be longer than 30 characters!');
		} else {
			console.log('Rejected the request for being empty!');
			res.send('The message cannot be empty!');
		}
	}
});

// Start the server
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
