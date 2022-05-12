<h1 align="center">MQTrol</h1


<div align="center">
  
![](https://img.shields.io/badge/nodejs-brightgreen.svg)
![](https://img.shields.io/badge/html5-brightgreen.svg)
[![Apache License](https://img.shields.io/badge/license-Apache-blue.svg?style=flat)](https://github.com/HaschekSolutions/mqtrol/blob/master/LICENSE)
[![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2FHaschekSolutions%2Fmqtrol&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=hits&edge_flat=false)](https://hits.seeyoufarm.com)
[![](https://img.shields.io/github/stars/HaschekSolutions/mqtrol.svg?label=Stars&style=social)](https://github.com/HaschekSolutions/mqtrol)

#### Very simple `command and control` agent for Windows devices based on `MQTT` with a simple `web frontend`. Meant to be a framework rather than a complete product
  
</div>

MQtrol can be used for automating sysadmin stuff.

You can manage all (Windows) clients running the agent via web interface or directly over MQTT

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