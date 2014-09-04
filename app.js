var _ = require("underscore");
var Twit = require('twit');
var config = require('./config.json');

var T = new Twit({
    consumer_key:         config.consumerKey
  , consumer_secret:      config.consumerSecret
  , access_token:         config.accessToken
  , access_token_secret:  config.accessTokenSecret
});

// Averiguar el id del lugar
/*T.get('trends/closest', { lat: '6.230833', long: '-75.590556' },  function (err, data, response) {
  console.log(err);
  console.log(data);
})*/

var trends = new Array();

setInterval(function() {
	T.get('trends/place', { id: '368150' },  function (err, data, response) {

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
					//trends.push(data);
				}
			}
		});

		var currentdate = new Date(); 
		console.log(currentdate+': '+tweetString + ' ahora es una tendencia en #Medellín');

		if(tTt.length > 0){
			T.post('statuses/update', { status: tweetString + ' ahora es una tendencia en #Medellín' }, function(err, data, response) {
				//console.log(data);
			});
		}
	});
}, 60000 );


