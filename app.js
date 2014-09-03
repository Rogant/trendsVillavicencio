var Twit = require('twit');
var config = require('./config.json');

var T = new Twit({
    consumer_key:         config.consumerKey
  , consumer_secret:      config.consumerSecret
  , access_token:         config.accessToken
  , access_token_secret:  config.accessTokenSecret
});


/*T.get('trends/closest', { lat: '4.1425', long: '-73.629444' },  function (err, data, response) {
  console.log(err);
  console.log(data);
})*/

var trends = new Array();

setInterval(function() {
	T.get('trends/place', { id: '23424787' },  function (err, data, response) {
		var tTt = new Array();

		var i2 = 0;
		for (i = 0; i < data[0].trends.length; i++) {
			if(trends.indexOf(data[0].trends[i].name) < 0){
				tTt[i2] = data[0].trends[i].name;
				i2++;
			}

			trends[i] = data[0].trends[i].name;
		}

		var tweetString = '';
		for (i = 0; i < tTt.length; i++) {
			if (typeof tTt[i] != 'undefined') {
				if((tweetString.length + tTt[i].length) < 100)
					tweetString = tweetString + " '" + tTt[i] + "'";
			}
		}

		var currentdate = new Date(); 
		console.log(currentdate+': '+tweetString + ' ahora es una tendencia en #Villavicencio');

		if(tTt.length > 0){
			T.post('statuses/update', { status: tweetString + ' ahora es una tendencia en #Villavicencio' }, function(err, data, response) {
				//console.log(data);
			});
		}
	});
}, 60000 );


