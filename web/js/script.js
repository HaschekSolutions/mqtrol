client  = mqtt.connect('ws://192.168.1.51:9001')

var agents = []

client.on('connect', function () {
    client.subscribe('mqtrol/presence/#')
    client.subscribe('mqtrol/results/#')
})

client.on('message', function (topic, message) {
    if(topic.indexOf('mqtrol/presence/') > -1)
    {
        var agent = topic.split('/')[2]
        var online = message.toString()=='on'?'online':'offline'
        console.log("PRESENCE of "+agent,message.toString())
        if(!agents.includes(agent))
        {
            createNewBox(agent,online)
            agents.push(agent)
        }
        else
        {
            $('#agent-'+agent).attr('status',online)
        }

        
    }
    
    else if(topic.indexOf('mqtrol/results/') > -1)
    {
        var agent = topic.split('/')[2]
        var output = message.toString()
        //$("#commands_"+agent).append("<li>"+output+"</li>")
        $("#lastoutput_"+agent).text(output)
    }
  //client.end()
})



//button control

$( "#cmd_btn" ).on("click",function(e) {

    var cmd = $('#cmd_input').val()
    client.publish('mqtrol/commands/all', cmd)
    //alert( "Handler for .click() called." );

    e.preventDefault();
});


// should become a template at some point
function createNewBox(name,status)
{
    var box = `
    <div id="agent-`+name+`" class="col agent-box" status="`+status+`">
      <div class="card mb-4 rounded-3 shadow-sm">
        <div class="card-header py-3">
          <h4 class="my-0 fw-normal">`+name+`</h4>
        </div>
        <div class="card-body">
          <h3 class="card-title pricing-card-title">Output</h3>
          <ul id="commands_`+name+`" class="list-unstyled mt-3 mb-4"></ul>

          <pre><code id="lastoutput_`+name+`"></code></pre>


          <!--<button type="button" class="w-100 btn btn-lg btn-outline-primary">Sign up for free</button>--!>
        </div>
      </div>
    </div>`

  $('#agents').append(box)
}