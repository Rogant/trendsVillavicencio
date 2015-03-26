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
	var random10 = Math.floor((Math.random() * 10) + 1);

	T.get('trends/place', { id: 23424848 },  function (err, data, response) {

		console.log(err);
		console.log(data);

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

		T.get('search/tweets', { q: trends[random10], count: 100 },  function (err, data, response) {
			var random = Math.floor((Math.random() * 100) + 1);
			var toFav = data.statuses[random];

			console.log('https://twitter.com/'+toFav.user.screen_name+'/status/'+toFav.id_str);

			T.post('favorites/create', { id: toFav.id_str },  function (err, data, response) {
				console.log(err);
				//console.log(data.id);
			});
		});

		var currentdate = new Date(); 
		console.log(currentdate+': '+tweetString + '  is now trending in #India');

		if(tTt.length > 0){
			T.post('statuses/update', { status: tweetString + '  is now trending in #India' }, function(err, data, response) {
				console.log(err);
				//console.log(data.id);
			});
		}
	});
}, 60000 );


var stream = T.stream('statuses/filter', { track: ['दिल्ली'] })
//var meta = [ '1.6029', '-74.8751', '4.6403', '-71.0876' ]
//var stream = T.stream('statuses/filter', { locations: meta })

stream.on('tweet', function (data) {
	var random = Math.floor((Math.random() * 100) + 1);

	if(random == 10){
		console.log('https://twitter.com/'+data.user.screen_name+'/status/'+data.id_str);

		T.post('favorites/create', { id: data.id_str },  function (err, data, response) {
			console.log(err);
			//console.log(data.id);
		});
	}
});