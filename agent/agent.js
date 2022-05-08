const mqtt = require('mqtt')
const exec = require('child_process').exec
var os = require("os");
var hostname = os.hostname();

const clientId = hostname + '_' + Math.random().toString(16).substr(2, 8)

console.log("Starting as "+hostname)

const options = {
    keepalive: 30,
    clientId: clientId,
    protocolId: 'MQTT',
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
    will: {
      topic: 'WillMsg/'+hostname,
      payload: 'Gone bye bye',
      qos: 0,
      retain: false
    },
    rejectUnauthorized: false
  }


const client  = mqtt.connect('mqtt://192.168.1.51',options)

client.on('connect', function () {
  client.subscribe('commands', function (err) {
    if (!err) {
      client.publish('presence', 'Hello mqtt')
    }
  })
})


client.on('message', function (topic, message) {

    var m = message.toString()
    console.log("topic => ",topic,"\tmessage => ",m)

    switch(m)
    {
        case 'ping':
            client.publish('results/'+hostname, "pong")
        break;

        default:
            exec(m, (err, stdout, stderr) => client.publish('results/'+hostname, stdout) )
    }
    
  //client.end()
})
