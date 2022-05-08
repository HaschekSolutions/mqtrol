# MQTrol

Is a simple MQTT based agent/web interface solution for automating sysadmin stuff.

You can manage all (Windows) clients running the agent via web interface directly over MQTT

# Installing the Agent

1. Install NodeJS from https://nodejs.org/en/
2. Set a system wide environment variable with the key `mqtrol_broker_url` and the value of your mqtt broker URL. Eg: `mqtt://192.168.1.51`
3. Go to the `agent` folder from a command prompt and run `npm install mqtt`
4. Open the file `/agent/install-service.bat` so the NSSM dialogue will appear
5. Use the following settings
  - Application tab
    - Path: Path to your node.exe
    - Startup Directory: Full path to your agent folder (doesn't need the rest of the project folders, just `/agent`)
    - Arguments: Full path to your agent.js file
  - Details tab (just fill in some name and desciption)
  - Log on
    - Ideally you'd use the Administrator account here

# Configure your MQTT Broker
For this project to work your broker must support Websockets.

An example working Mosquitto config (for testing only) looks like this:

`/etc/mosquitto/mosquitto.conf`
```conf
allow_anonymous true
listener 1883

listener 9001
protocol websockets
```

# Configure the web interface
- Create a new file `/web/broker.txt` and enter your websocket MQTT server URL. eg: `ws://192.168.1.51:9001`