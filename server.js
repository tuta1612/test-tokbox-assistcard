var apiKey = "46256142";
var apiSecret = "e34ceb15c0eca4af5bfc5e1b75f374dc913ab744";

var OpenTok = require('opentok'),
opentok = new OpenTok(apiKey, apiSecret);


const express = require('express');
const bodyParser = require('body-parser');
const app = express();


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(process.env.PORT || 5000, function () {
    console.log('Example app listening on port:'+process.env.PORT || 5000);
});

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

app.get('/faqs',  function(req, res){
    var json = '{"faqs":[{"pregunta":"¿Qué es Telemed?", "respuesta":"Es un servicio de asistencia médica remota, que a través de una plataforma digital te permite tener una videollamada con un médico clínico/pediatra desde cualquier lugar en cualquier momento. El profesional atenderá tu llamado como una consulta médica tradicional, brindando un  diagnóstico para  darte la mejor solución."},{"pregunta":"¿Qué beneficios tiene la Telemedicina?", "respuesta":"A través de esta plataforma podrás consultar un médico en línea las 24hs del día en todo el mundo. Además, con el análisis de tu historia clínica, la asistencia médica online podrá darte un diagnóstico preciso a través de un especialista.\nEl alcance a un profesional de la salud a través de Telemed te permite no solo ahorrar tiempo, ya que no será necesario el traslado hacia una clínica, o la espera de una visita médica, sino que a su vez te permitirá el contacto directo con un médico sin tener que ser derivado por un tercero."},{"pregunta":"Si el caso es de mayor gravedad ¿el médico me atenderá igual?", "respuesta":"Ante un caso de mayor gravedad, ASSIST CARD recomienda SIEMPRE ponerse en contacto directo con un asesor para que dicha persona le indique el paso a seguir: visita médica/ traslado al hospital más cercano, o bien sugiere se acerque directamente al centro de atención más cercano y una vez allí se comunique con ASSIST CARD. Es fundamental que sí siente que los síntomas que presenta son de gravedad no pierda tiempo, y acceda directo en contacto con un asesor o se presente en la clínica."},{"pregunta":"¿Cuánto me cuesta obtener este Upgrade?", "respuesta":"Este servicio no tiene un valor aparte. Podrás obtener de dicho beneficio con tu tarjeta de asistencia médica básica. En ASSIST CARD nos interesa hacer de tu viaje una experiencia única y, por ello, queremos que sólo te preocupes por disfrutar y descansar, que de tu bienestar nos ocupamos nosotros."},{"pregunta":"¿Puedo obtener una receta médica?", "respuesta":"En caso de ser necesario que se recete un medicamento, ASSIST CARD le enviará un médico a domicilio que le entregará el certificado correspondiente. Sólo en EE.UU. está permitido realizar recetas vía telefónica.\nEn los demás casos, el médico online sí podrá darle todas las precisiones sobre qué medicamentos tomar y dónde conseguirlos, siempre y cuando sean de venta libre."},{"pregunta":"¿Las consultas quedan guardadas?", "respuesta":"Sí. Contamos con un sistema que nos permite abrir su caso y así armar la historia clínica. Esto nos da la ventaja de que si al mismo día, o al tiempo usted accede a través de otro canal de comunicación (telefónico, chat, etc.) nuestros asesores conozcan sus antecedentes."},{"pregunta":"¿Desde qué edad se puede acceder a este servicio?", "respuesta":"A partir de los 15 años, un usuario con tarjeta de asistencia médica activa puede obtener dicho servicio sin necesidad de un mayor. ASSIST CARD acompaña a las quinceañeras en sus viajes. Por dicho motivo esta es la edad mínima para el acceso directo al servicio."}]}';
    res.send(json);
});

app.get('/tips',  function(req, res){
    var json = '{"tips":[{"pregunta":"¿Qué es Telemed?", "respuesta":"No se pero suena como un canal nuevo de tele."},{"pregunta":"¿Qué beneficios tiene la Telemedicina?", "respuesta":"Que podes mirar la tele y hay un medico adentro"},{"pregunta":"Si el caso es de mayor gravedad ¿el médico me atenderá igual?", "respuesta":"No, cagate por curioso, solo curamos gente sana."},{"pregunta":"¿Cuánto me cuesta obtener este Upgrade?", "respuesta":"Vas a tener que pagar con tu sangre."},{"pregunta":"¿Puedo obtener una receta médica?", "respuesta":"Te buscas un amigo medico que te de el papelito."},{"pregunta":"¿Las consultas quedan guardadas?", "respuesta":"Vos fumá, aca guardamos todo."},{"pregunta":"¿Desde qué edad se puede acceder a este servicio?", "respuesta":"Con que seas menor q Mirta Legrand es suficiente."}]}';
    res.send(json);
});

var salaDeEspera = {};

app.post('/Api/Turn/CheckStatus',function (req, res) {
    if(salaDeEspera[req.body.Parameters.TurnToken] == undefined){
        var turno = {"QtyPatientsBefore": 10, 
                    "ElapsedPercentual": 0,
                    "TakenByMedicalSpecialist": false,
                    "SuggestedSecondsToRetry": 10};
        salaDeEspera[req.body.Parameters.TurnToken] = turno;
    } else {
        var turno = salaDeEspera[req.body.Parameters.TurnToken];
        if(turno.QtyPatientsBefore>0){
            turno.QtyPatientsBefore = turno.QtyPatientsBefore - 1; 
            turno.ElapsedPercentual = turno.ElapsedPercentual + 10;
        } else {
            turno.TakenByMedicalSpecialist = true;
        }
        salaDeEspera[req.body.Parameters.TurnToken] = turno;
    }

    var rta = JSON.stringify(salaDeEspera[req.body.Parameters.TurnToken]);
    var json = '{"ResponseEntity": ' + rta + ',"ApplicationName": null,"StatusCode": 200,"ApplicationStatusCodeSource": null,"StatusCodeParameters": null,"ApplicationEventTableName": null,"ErrorId": 0,"Message": null}';
    res.send(json);
});

var sesionesDeTokbox = {};

app.post('/Api/Tokbox/GetTokboxSessionId',function (req, res) {
    var rta = "000"
    if(sesionesDeTokbox[req.body.Parameters.TurnToken] == undefined){
        var sessionOptions = {mediaMode:"routed", archiveMode: "always"};
        opentok.createSession(sessionOptions, function(err, session){
            if(err){
                var json = '{"ResponseScalar": "aaa","ApplicationName": null,"StatusCode": 500,"ApplicationStatusCodeSource": null,"StatusCodeParameters": null,"ApplicationEventTableName": null,"ErrorId": 0,"Message": "no se pudo crear la sesion"}';
                res.send(json);
            }else{
                sesionesDeTokbox[req.body.Parameters.TurnToken] = session.sessionId;
                var json = '{"ResponseScalar": "' + session.sessionId + '","ApplicationName": null,"StatusCode": 200,"ApplicationStatusCodeSource": null,"StatusCodeParameters": null,"ApplicationEventTableName": null,"ErrorId": 0,"Message": null}';
                res.send(json);
            }
        });
    } else {
        var rta = sesionesDeTokbox[req.body.Parameters.TurnToken];
        var json = '{"ResponseScalar": "' + rta + '","ApplicationName": null,"StatusCode": 200,"ApplicationStatusCodeSource": null,"StatusCodeParameters": null,"ApplicationEventTableName": null,"ErrorId": 0,"Message": null}';
        res.send(json);
    }
});

app.post('/Api/Tokbox/GetTokboxToken',function (req, res) {
    if(sesionesDeTokbox[req.body.Parameters.TurnToken] == undefined){
        var json = '{"ResponseScalar": null,"ApplicationName": null,"StatusCode": 500,"ApplicationStatusCodeSource": null,"StatusCodeParameters": null,"ApplicationEventTableName": null,"ErrorId": 0,"Message": "no hay una sesion de tokbox para ese turno"}';
        res.send(json);
    } else {
        var token = opentok.generateToken(sesionesDeTokbox[req.body.Parameters.TurnToken]);
        var json = '{"ResponseScalar": "' + token + '","ApplicationName": null,"StatusCode": 200,"ApplicationStatusCodeSource": null,"StatusCodeParameters": null,"ApplicationEventTableName": null,"ErrorId": 0,"Message": null}';
        res.send(json);
    }
});