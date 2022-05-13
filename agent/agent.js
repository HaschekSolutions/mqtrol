const mqtt = require('mqtt')
const exec = require('child_process').exec
var os = require("os");
var fs = require('fs');
var http = require('http');
var https = require('https');
const { exit } = require('process');
var hostname = os.hostname();
var networkinfo = os.networkInterfaces();

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


const client  = mqtt.connect(process.env.mqtrol_broker_url,options)

client.on('connect', function () {
  client.subscribe('mqtrol/commands/all', function (err) {
    if (!err) {
      client.publish('mqtrol/presence/'+hostname, "on",{ qos: 1, retain: true })

      //start interval
      setInterval(intervalFunc, 30000);
      intervalFunc();
    }
  })

  client.subscribe('mqtrol/commands/'+hostname)
})


client.on('error', err => {
  console.error('MQTT broker error', err)
  client.end()
  client.reconnect()
})

client.on('message', function (topic, message) {

    var m = message.toString()
    if(m.length==0) return;
    console.log("topic => ",topic,"\tmessage => ",m)

    switch(m)
    {
        case 'ping':
            client.publish('mqtrol/results/'+hostname, JSON.stringify({err:"", stdout:"pong", stderr:""}))
        break;

        case 'upgrade':
          upgrade();
          client.publish('mqtrol/results/'+hostname, JSON.stringify({err:"", stdout:"upgrading from git...", stderr:""}))
        break;

        default:
            exec(m, (err, stdout, stderr) => client.publish('mqtrol/results/'+hostname, JSON.stringify({err:err, stdout:stdout, stderr:stderr}) ))
    }
    
  //client.end()
})


function intervalFunc()
{
  getLoggedInUser()
  client.publish('mqtrol/presence/'+hostname, "on",{ qos: 1, retain: true })
  client.publish('mqtrol/agentinfo/'+hostname+'/networkinfo', JSON.stringify(getIPsAndMacs()),{ qos: 1, retain: true })
  client.publish('mqtrol/agentinfo/'+hostname+'/uptime', os.uptime(),{ qos: 1, retain: true })
}


function getLoggedInUser()
{
  exec('for /f "tokens=2" %u in (\'query session ^| findstr /R "console"\') do @echo %u',function (error, stdout, stderr) {
      username = stdout.trim()
      if(Number.isNaN(Number(username))) //if it's a number it's the empty ID
        client.publish('mqtrol/agentinfo/'+hostname+'/loggedinuser', username)
      else
        client.publish('mqtrol/agentinfo/'+hostname+'/loggedinuser', "")
  });
}

function getIPsAndMacs()
{
    var o = [];
    for(iface in networkinfo)
    {
        var data = networkinfo[iface]

        for(var i=0;i<data.length;i++)
        {
            var d = data[i]
            if(d.family=="IPv4")
            {
                console.log(d.address,d.mac)
                if(d.mac!='00:00:00:00:00:00' && !d.address.startsWith('127.') && !d.address.startsWith('169.') && !d.address.startsWith('172.'))
                    o.push({ip:d.address,mac:d.mac})
            }
        }
    }

    return o;
}

function upgrade()
{
  console.log("Updating...")
  client.end()
  download("https://raw.githubusercontent.com/HaschekSolutions/mqtrol/master/agent/agent.js", __filename)
  setTimeout(function () {
    process.on("exit", function () {
        require("child_process").spawn(process.argv.shift(), process.argv, {
            cwd: process.cwd(),
            detached : true,
            stdio: "inherit"
        });
    });
    process.exit();
  }, 5000);
}


//functions
async function download(url, filePath) {
  const proto = !url.charAt(4).localeCompare('s') ? https : http;

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    let fileInfo = null;

    const request = proto.get(url, response => {
      if (response.statusCode !== 200) {
        fs.unlink(filePath, () => {
          reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        });
        return;
      }

      fileInfo = {
        mime: response.headers['content-type'],
        size: parseInt(response.headers['content-length'], 10),
      };

      response.pipe(file);
    });

    // The destination stream is ended by the time it's called
    file.on('finish', () => resolve(fileInfo));

    request.on('error', err => {
      fs.unlink(filePath, () => reject(err));
    });

    file.on('error', err => {
      fs.unlink(filePath, () => reject(err));
    });

    request.end();
  });
}