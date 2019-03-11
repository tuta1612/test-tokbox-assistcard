var apiKey = "46256142";
var apiSecret = "e34ceb15c0eca4af5bfc5e1b75f374dc913ab744";

var OpenTok = require('opentok'),
opentok = new OpenTok(apiKey, apiSecret);


var express = require('express');
var app = express();

var sesionDeTokBox = "";

app.get('/', function (req, res) {
    res.send('Hello World!');
});
app.get('/comenzar', function (req, res) {
    if(sesionDeTokBox.length==0){
        var sessionOptions = {mediaMode:"routed", archiveMode: "always"};
        opentok.createSession(sessionOptions, function(err, session){
            if(err){
                res.send("no se pudo crear la sesion");
            }else{
                sesionDeTokBox = session.sessionId;
                res.send(sesionDeTokBox);
            }
        });
    } else {
        res.send(sesionDeTokBox);
    }
});

app.get('/finalizar', function (req, res) {
    sesionDeTokBox = "";
    res.send("se finalizo la sesion de chat");
});

app.get('/token', function (req, res) {
    var token = opentok.generateToken(sesionDeTokBox);
    res.send(token);
});

app.get('/sesion', function (req, res) {
    res.send(sesionDeTokBox);
});
  
app.listen(process.env.PORT || 5000, function () {
    console.log('Example app listening on port:'+process.env.PORT || 5000);
});