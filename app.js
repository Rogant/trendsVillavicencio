var _ = require("underscore");
var Twit = require('twit');

var cities = [
	{
		data: require('./colombia.json')
	},
	{
		data: require('./bogota.json')
	},
	{
		data: require('./medellin.json')
	}
];

function trends(config){
	var T = new Twit({
	    consumer_key:         config.consumerKey
	  , consumer_secret:      config.consumerSecret
	  , access_token:         config.accessToken
	  , access_token_secret:  config.accessTokenSecret
	});

	var city = config.name;
	var trends = new Array();
	var oldTweet;

	setInterval(function() {
		var currentdate = new Date(); 

		T.get('trends/place', { id: config.place },  function (err, data, response) {
			if(err){
				console.log(currentdate+': trends/place '+city);
				console.log(err);
			}else{
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
							if((tweetString.length + data.length + config.template.length) < 138){
								if(tweetString == ''){
									tweetString = "'" + data + "'";
								}else{
									tweetString = tweetString + " '" + data + "'";
								}
							}

							T.get('search/tweets', { q: data, count: 100, result_type: 'recent' },  function (err, data, response) {
								if(err){
									console.log(currentdate+': search/tweets '+city);
									console.log(err);
								}else{
									var random = Math.floor((Math.random() * data.statuses.length) + 1);
									var toFav = data.statuses[random];

									if((toFav.user.id != config.userId) && _.isUndefined(toFav.retweeted_status) && toFav.user.lang == 'es'){
										T.post('favorites/create', { id: toFav.id_str },  function (err, data, response) {
											if(err){
												console.log(currentdate+': favorites/create '+city);
												console.log(err);
											}else{
												console.log(currentdate +': search favorite in '+city+' id '+ toFav.id_str);
											}
										});
									}
								}
							});
						}
					});

					if(tweetString != oldTweet){
						T.post('statuses/update', { status: tweetString + config.template }, function(err, data, response) {
							if(err){
								console.log(currentdate+': statuses/update '+city);
								console.log(err);
							}else{
								console.log(currentdate+': '+tweetString + config.template);
							}
						});

						oldTweet = tweetString;
					}
				}
			}
		});
	}, 60000 );


	var stream = T.stream('statuses/filter', { track: config.track })
	stream.on('tweet', function (data) {
		var random = Math.floor((Math.random() * 100) + 1);

		if(random == 2){
			if(!_.isUndefined(data.favorited)){
				if((data.user.id != config.userId) && _.isUndefined(data.retweeted_status) && data.user.lang == 'es'){
					T.post('favorites/create', { id: data.id_str },  function (err, data, response) {
						var currentdate = new Date(); 

						if(err){
							console.log(currentdate+': favorites/create '+city);
							console.log(err);
						}else{
							console.log(currentdate +': stream favorite in '+city+' id '+ data.id_str);
						}
					});
				}
			}
		}
	});
}

_.each(ciudades, function(ciudad){
	trends(ciudad.data);
});