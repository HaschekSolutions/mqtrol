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
            // NEW ARRIVAL
            createNewBox(agent,online)
            agents.push(agent)

            $("#agentselectorwrapper").append(`
            <div class="form-check form-check-inline">
                <input class="agentselectorclass customagentselector form-check-input" name="agentscmd[]" type="checkbox" id="agentselector-`+agent+`" value="`+agent+`">
                <label class="form-check-label" for="agentselector-`+agent+`">`+agent+`</label>
            </div>`)
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
        console.log(output,"is jason?",isJson(output))
        if(isJson(output))
        {
            var o = JSON.parse(output)

            $("#lastoutput_"+agent).text(o.stdout)
            if(o.err)
                $("#lastoutput_"+agent).append("Error\n")
            if(o.stderr)
                $("#lastoutput_"+agent).append(o.stderr)
        }
        else
            $("#lastoutput_"+agent).text(output)
        //$("#commands_"+agent).append("<li>"+output+"</li>")
        
    }
  //client.end()
})



//button control

$( "#cmd_btn" ).on("click",function(e) {

    var cmd = $('#cmd_input').val()
    var sendto = Array.from($(".agentselectorclass:checked"), a => a.value);
    console.log("sendto",sendto)
    if(sendto[0]=='all')
        client.publish('mqtrol/commands/all', cmd)
    else
        for(var i=0;i<sendto.length;i++)
            client.publish('mqtrol/commands/'+sendto[i], cmd)

    e.preventDefault();
});

$(document).on('change', 'input[type="checkbox"]', function() {
    var agent = $(this).val()
    var checked = $(this).is(':checked')
    console.log("checkbox changed for "+agent)

    if(agent=='all')
    {
        if(checked)
            document.querySelectorAll('.customagentselector').forEach(c=> c.checked=0)
    }
    else
        $("#agentselector").prop('checked', false)
    
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
          <ul id="commands_`+name+`" class="list-unstyled mt-3 mb-4"></ul>

          <pre><code id="lastoutput_`+name+`"> -- noch kein output -- </code></pre>


          <!--<button type="button" class="w-100 btn btn-lg btn-outline-primary">Sign up for free</button>--!>
        </div>
      </div>
    </div>`

  $('#agents').append(box)
}