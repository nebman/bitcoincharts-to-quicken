var strftime = require('strftime');
var request = require('request');

var express = require('express');
var app = express();


var reply = [];
var lastUpdate = 0;


var sendResponse = function(res) {
  res.set('Content-Type', 'application/json');
  res.set('Content-Length', reply.length);
  res.send(reply);
  console.log('sent response');
};


app.get('/twomonths', function(req, res) {
  console.log('got request');

  if (lastUpdate + 3600000 < +new Date()) { // request only every hour max.
    request('http://bitcoincharts.com/charts/chart.json?m=bitstampUSD&SubmitButton=Draw&r=60&i=&c=0&s=&e=&Prev=&Next=&t=S&b=&a1=&m1=10&a2=&m2=25&x=0&i1=&i2=&i3=&i4=&v=1&cv=0&ps=0&l=0&p=0&', function(err, resChart, body) {
      if (err) res.status(500).send('error getting chart data');

      lastUpdate = +new Date();
      var datajson = JSON.parse(body);
      reply = "";

      for (var i in datajson) {
        var row = datajson[i];
        var time = (strftime("%m/%d/%Y", new Date(row[0]*1000)));
        var volume = (row[5]/100).toFixed(2);
        var close = row[4];
        var high = row[2];
        var low = row[3];

        reply += ['BTCUSD', close, '--', time, '--', high, low, volume,'*'].join(',') + "\n";
      }
      console.log ('read new data');
      sendResponse(res);
    });
  } else {
    sendResponse(res);
  }
});



app.listen(process.env.PORT || 3000);
console.log('ready');
