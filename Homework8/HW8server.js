var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var request = require('request');
var app = express();
var cors = require('cors');
app.use(cors());
var a = "";

app.set('port',process.env.PORT||3000);


//Get response for initial location nearby search results
app.get('/lat/:lat/lng/:lng/distance/:distance/keyword/:keyword/type/:type', function(req, res)
{
         console.log("Latitude "+req.params.lat)
         console.log("Longitude "+req.params.lng)
         
	request.post(
    "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+req.params.lat+","+req.params.lng+
    "&radius="+req.params.distance+"&type="+req.params.type+"&keyword="+req.params.keyword+"&key=AIzaSyCuVEKl8_oFsdq7b7_WGG4qi0dCbQ9K6dE",
    { json: { key: 'value' } },
    function (error, response, body) {
    	
        if (!error && response.statusCode == 200) {
           res.header("Access-Control-Allow-Origin","*");
           res.header("Access-Control-Allow-Headers","X-Requested-With");
            console.log("https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+req.params.lat+","+req.params.lng+
    "&radius="+req.params.distance+"&type="+req.params.type+"&keyword="+req.params.keyword+"&key=AIzaSyCuVEKl8_oFsdq7b7_WGG4qi0dCbQ9K6dE")
            res.send(body);
        }  
    }
);

});

//Get response for custom location
app.get('/location1/:location1/distance/:distance/keyword/:keyword/type/:type', function(req, res)
{
      console.log(req.params.location1); 
      lat = "";
      lng = ""; 
     request.post(
    "https://maps.googleapis.com/maps/api/geocode/json?address="+req.params.location1+"&key=AIzaSyCuVEKl8_oFsdq7b7_WGG4qi0dCbQ9K6dE",
    { json: { key: 'value' } },
    function (error, response, body) {
      
        if (!error && response.statusCode == 200) {
           res.header("Access-Control-Allow-Origin","*");
           res.header("Access-Control-Allow-Headers","X-Requested-With");
            console.log("https://maps.googleapis.com/maps/api/geocode/json?address="+req.params.location1+"&key=AIzaSyCuVEKl8_oFsdq7b7_WGG4qi0dCbQ9K6dE")
           
            lat = body.results[0].geometry.location.lat;
            lng = body.results[0].geometry.location.lng;
            console.log(lat);
            console.log(lng);
            request.post(
    "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+lat+","+lng+
    "&radius="+req.params.distance+"&type="+req.params.type+"&keyword="+req.params.keyword+"&key=AIzaSyCuVEKl8_oFsdq7b7_WGG4qi0dCbQ9K6dE",
    { json: { key: 'value' } },
    function (error, response, body) {
      
        if (!error && response.statusCode == 200) {
           res.header("Access-Control-Allow-Origin","*");
           res.header("Access-Control-Allow-Headers","X-Requested-With");
            console.log("https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+lat+","+lng+
    "&radius="+req.params.distance+"&type="+req.params.type+"&keyword="+req.params.keyword+"&key=AIzaSyCuVEKl8_oFsdq7b7_WGG4qi0dCbQ9K6dE")
            res.send(body);
        }  
    }
  );

        }  
    }
);

});


//Checking for pagination
app.get('/token/:token', function(req, res)
{

    request.post(
    "https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken="+req.params.token+
    "&key=AIzaSyCuVEKl8_oFsdq7b7_WGG4qi0dCbQ9K6dE",
    { json: { key: 'value' } },
    function (error, response, body) {
        
        if (!error && response.statusCode == 200) {
           res.header("Access-Control-Allow-Origin","*");
           res.header("Access-Control-Allow-Headers","X-Requested-With");
            console.log("https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken="+req.params.token+
    "&key=AIzaSyCuVEKl8_oFsdq7b7_WGG4qi0dCbQ9K6dE")
            res.send(body);
        }  
    }
);

});


//Fetching Google reviews
app.get('/placeid/:placeid', function(req, res)
{


    request.post(
    "https://maps.googleapis.com/maps/api/place/details/json?placeid="+req.params.placeid+"&key=AIzaSyCuVEKl8_oFsdq7b7_WGG4qi0dCbQ9K6dE",
    { json: { key: 'value' } },
    function (error, response, body) {
        
        if (!error && response.statusCode == 200) {
           res.header("Access-Control-Allow-Origin","*");
           res.header("Access-Control-Allow-Headers","X-Requested-With");
            console.log("https://maps.googleapis.com/maps/api/place/details/json?placeid="+req.params.placeid+"&key=AIzaSyCuVEKl8_oFsdq7b7_WGG4qi0dCbQ9K6dE")
            res.send(body);
        }

        
    }
);

});


//Fetch yelp reviews
'use strict';

const yelp = require('yelp-fusion');

const client = yelp.client('OKuiJAA9TGa0FtSgSUfsHOelZR8-2YA8E-tYgsh5DR_vqjLDxjOYvTslEfSHZ-T2kRp2xCaXnUIydi85DjmHkx_nVdhicvLxU2a25LFSPm7obx21bQY9Z0NclAKzWnYx');

app.get('/name/:name/address1/:address1/city/:city/state/:state/country/:country/phone/:phone', function(req, res)
{

client.businessMatch('best', {
  name: req.params.name,
  address1: req.params.address1,
  
  city: req.params.city,
  state: req.params.state,
  country: req.params.country
}).then(response => {
  
 
  
  if(response.jsonBody.businesses[0].phone == req.params.phone)
  {
    a = response.jsonBody.businesses[0].id;
  }
  else
 {
    a = '';


 }
  client.reviews(a).then(response => {
  
  res.send(response.jsonBody.reviews);
}).catch(e => {
  
});

});
});

app.listen(app.get('port'), function(){
          console.log('Server started');
})