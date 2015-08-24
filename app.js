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
	var history = {
		tweets: [],
		favorites: [],
		errors: []
	};

	setInterval(function() {
		var currentdate = new Date();

		T.get('trends/place', { id: config.place },  function (err, data, response) {
			if(err){
				history.errors.push({error: err.code, date: currentdate});

				actions = history.tweets.length + history.favorites.length + history.errors.length;
				console.log(currentdate+': trends/place '+city+', actions: ' + actions);
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
									history.errors.push({error: err.code, date: currentdate});
									actions = history.tweets.length + history.favorites.length + history.errors.length;
									console.log(currentdate+': search/tweets '+city+', actions: ' + actions);
									console.log(err);
								}else{
									do{
										random = Math.floor((Math.random() * data.statuses.length));
										toFav = data.statuses[random];
									}while(_.pluck(history.favorites, 'uId').indexOf(toFav.user.id) >= 0)


									favoritesCreate(toFav, 'search');
								}
							});
						}
					});

					var tweetFinal = tweetString + config.template;

					if(_.pluck(history.tweets, 'tweet').indexOf(tweetFinal) < 0){
						T.post('statuses/update', { status: tweetFinal }, function(err, data, response) {
							if(err){
								history.errors.push({error: err.code, date: currentdate});
								actions = history.tweets.length + history.favorites.length + history.errors.length;
								console.log(currentdate+': statuses/update '+city+', actions: ' + actions);
								console.log(err);
							}else{
								console.log(currentdate+': '+tweetFinal);
								history.tweets.push({tweet: tweetFinal, date: currentdate})
							}
						});
					}
				}
			}
		});

		toRemove = [];
		_.each(history.favorites, function(favorite, key){
			if((currentdate.getTime() - favorite.date.getTime()) >= 3600000){
				toRemove.push(key);
			}
		});

		_.each(toRemove, function(removeKey){
			history.favorites.splice(removeKey, 1);
		});


		toRemove = [];
		_.each(history.tweets, function(tweet, key){		
			if((currentdate.getTime() - tweet.date.getTime()) >= 3600000){
				toRemove.push(key);
			}
		});

		_.each(toRemove, function(removeKey){
			history.tweets.splice(removeKey, 1);
		});

		toRemove = [];
		_.each(history.errors, function(error, key){		
			if((currentdate.getTime() - error.date.getTime()) >= 3600000){
				toRemove.push(key);
			}
		});

		_.each(toRemove, function(removeKey){
			history.errors.splice(removeKey, 1);
		});		
	}, 60000 );


	var stream = T.stream('statuses/filter', { track: config.track })
	stream.on('tweet', function (data) {
		var random = Math.floor((Math.random() * 100) + 1);

		if(random == 2){
			if(_.pluck(history.favorites, 'uId').indexOf(data.user.id) < 0){
				favoritesCreate(data, 'stream');
			}
		}
	});


	function favoritesCreate(data, source){
		if((data.user.id != config.userId) && !_.isUndefined(data.favorited) && _.isUndefined(data.retweeted_status) && (data.user.lang == 'es' || data.user.lang == 'en')){
			if(_.pluck(history.favorites, 'id').indexOf(data.id_str) < 0){
				T.post('favorites/create', { id: data.id_str },  function (err, data2, response) {
					var currentdate = new Date(); 

					if(err){
						history.errors.push({error: err.code, date: currentdate});
						actions = history.tweets.length + history.favorites.length + history.errors.length;
						console.log(currentdate+': favorites/create '+city+' id: '+data.id_str+', actions: ' + actions);
						console.log(err);
					}else{
						console.log(currentdate +': '+source+' favorite in '+city+' id '+ data.id_str);
						history.favorites.push({id: data.id_str, date: currentdate, uId: data.user.id});
					}
				});
			}
		}		
	}
}

_.each(cities, function(city){
	trends(city.data);
});