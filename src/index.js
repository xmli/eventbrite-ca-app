var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// This responds with "Hello World" on the homepage
// app.get('/', function (req, res) {
//    console.log("Got a GET request");
//    res.send(JSON.parse('{"Hi":"Hello GET"}'));
// })

// This responds a POST request for the homepage
app.post('/', function (req, res) {
    console.log("POST request to Eventbrite Oauth2.0");
    var post_json = req.body;

    var post_urlencoded = "code=" + post_json['code'] 
    + "&client_secret=" + "NEJTS4O4YOKRPCVP2IT5DEWPH44Q2JKMQQMMPM5X4FSLDR7IIM"
    + "&client_id=" + "URU55POLUBEJYWBHQF"
    + "&grant_type=authorization_code";

    request.post({
        headers: { 'Content-type' : 'application/x-www-form-urlencoded' },
        url: 'https://www.eventbrite.com/oauth/token',
        body: post_urlencoded
    }, 
    function(error, response, body){
        var token = JSON.parse(body)['access_token'];
        // console.log("Access Token: " + token);
        res.send(JSON.parse(body)); 
    });
})

var server = app.listen(8081, function () {
   console.log("Example app listening at port 8081");
})