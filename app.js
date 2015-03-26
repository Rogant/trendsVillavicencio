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
	var currentdate = new Date(); 

	T.get('trends/place', { id: config.place },  function (err, data, response) {
		var newTrends = _.map(data[0].trends, function(currentObject) {
			var tmp = _.values(_.pick(currentObject, "name"));
			return tmp[0];
		});

		var tTt = _.difference(newTrends, trends);
		trends = newTrends;

		if(tTt.length > 0){
			var tweetString = '';

			_.each(tTt, function(data){
				if (!_.isUndefined(data)) {
					if((tweetString.length + data.length) < 100){
						tweetString = tweetString + " '" + data + "'";
					}

					T.get('search/tweets', { q: data, count: 100, result_type: 'recent' },  function (err, data, response) {
						var random = Math.floor((Math.random() * data.statuses.length) + 1);
						var toFav = data.statuses[random];

						if(!_.isUndefined(toFav.favorited)){
							if((toFav.user.id != config.userId) && (!toFav.favorited)){
								T.post('favorites/create', { id: toFav.id_str },  function (err, data, response) {
									if(err){
										console.log(err);
									}else{
										console.log(currentdate +', search favorite: '+ toFav.id_str);
									}
								});
							}
						}
					});
				}
			});

			T.post('statuses/update', { status: tweetString + config.template }, function(err, data, response) {
				if(err){
					console.log(err);
				}else{
					console.log(currentdate+': '+tweetString + config.template);
				}
			});
		}
	});
}, 60000 );


var stream = T.stream('statuses/filter', { track: config.track })
stream.on('tweet', function (data) {
	var random = Math.floor((Math.random() * 10) + 1);

	if(random == 2){
		if(!_.isUndefined(data.favorited)){
			if((data.user.id != config.userId) && (!data.favorited)){
				T.post('favorites/create', { id: data.id_str },  function (err, data, response) {
					var currentdate = new Date(); 

					if(err){
						console.log(err);
					}else{
						console.log(currentdate +', stream favorite: '+ data.id_str);
					}
				});
			}
		}
	}
});