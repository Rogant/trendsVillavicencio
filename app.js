var _ = require("underscore");
var Twit = require('twit');
var config = require('./config.json');

var T = new Twit({
    consumer_key:         config.consumerKey
  , consumer_secret:      config.consumerSecret
  , access_token:         config.accessToken
  , access_token_secret:  config.accessTokenSecret
});


var trends = new Array();

setInterval(function() {
	T.get('trends/place', { id: '23424787' },  function (err, data, response) {

		var newTrends = _.map(data[0].trends, function(currentObject) {
			var tmp = _.values(_.pick(currentObject, "name"));
			return tmp[0];
		});

		var tTt = _.difference(newTrends, trends);
		trends = newTrends;

		var tweetString = '';
		_.each(tTt, function(data){
			if (!_.isUndefined(data)) {
				if((tweetString.length + data.length) < 100){
					tweetString = tweetString + " '" + data + "'";
				}
			}
		});

		var currentdate = new Date(); 
		console.log(currentdate+': '+tweetString + ' ahora es una tendencia en #Villavicencio');

		if(tTt.length > 0){
			T.post('statuses/update', { status: tweetString + ' ahora es una tendencia en #Villavicencio' }, function(err, data, response) {
				//console.log(data);
			});
		}
	});
}, 90000 );


var stream = T.stream('statuses/filter', { track: ['villavicencio'] })
//var meta = [ '1.6029', '-74.8751', '4.6403', '-71.0876' ]
//var stream = T.stream('statuses/filter', { locations: meta })

stream.on('tweet', function (data) {
	var random = Math.floor((Math.random() * 10) + 1);
	console.log(data.id);

	if(random == 10){
		T.post('favorites/create', { id: data.id },  function (err, data, response) {
			console.log(data);
		});
	}
});