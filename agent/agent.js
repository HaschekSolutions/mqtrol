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
      topic: 'mqtrol/presence/'+hostname,
      payload: 'off',
      qos: 1,
      retain: true
    },
    rejectUnauthorized: false
  }


const client  = mqtt.connect('mqtt://192.168.1.51',options)

client.on('connect', function () {
  client.subscribe('mqtrol/commands/all', function (err) {
    if (!err) {
      client.publish('mqtrol/presence/'+hostname, "on",{ qos: 1, retain: true })

      //start interval
      setInterval(intervalFunc, 30000);
    }
  })

  client.subscribe('mqtrol/commands/'+hostname)
})


client.on('message', function (topic, message) {

    var m = message.toString()
    console.log("topic => ",topic,"\tmessage => ",m)

    switch(m)
    {
        case 'ping':
            client.publish('mqtrol/results/'+hostname, "pong")
        break;

        default:
            exec(m, (err, stdout, stderr) => client.publish('mqtrol/results/'+hostname, stdout) )
    }
    
  //client.end()
})


function intervalFunc()
{
  getLoggedInUser()
}


function getLoggedInUser()
{
  exec('for /f "tokens=2" %u in (\'query session ^| findstr /R "^>"\') do @echo %u',function (error, stdout, stderr) {
      username = stdout.trim()
      client.publish('mqtrol/agentinfo/'+hostname+'/loggedinuser', username)
  });
}