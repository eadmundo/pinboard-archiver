/* $Id: crossPlatformSave.js 114140 2012-10-22 18:38:07Z reed.emmons $
/js/app/save/crossPlatformSave.js
(c)2006 - 2012 The New York Times Company */

/**
Provides a high-level wrapper around the Reading List API.

@module crossPlatformSave
**/
NYTD.crossPlatformSave = (function(window, $) {
	'use strict';

	/**
	Configuration value across this object.

	@private
	@property globalConfig
	@type Object
	**/
	var globalConfig = {
		cookies : {
			api : {
				name : 'NYT-SAVE-ACCESS',
				expires : {
					minutes : 20
				}
			},
			save : {
				name : 'NYT-SAVE-ARTICLES'
			}
		},
		host : (NYTD.Hosts) ? NYTD.Hosts.wwwHost || '' : '',
		timeout : 5000
	};

	/**
	Options stub for Ajax requests.

	@private
	@property defaultOptions
	@type Object
	**/
	var defaultOptions = {
		success : $.noop,
		fail : $.noop
	};

	/**
	Hash containing previously requested articles.

	@private
	@property assets
	@type Object
	**/
	var assets = {};

	/**
	Checks if the user is registered

	@method isLoggedIn
	@return {Boolean}
	**/
	function isLoggedIn() {
		var loggedIn = false;
		if ((window.regstatus && window.regstatus === 'registered') || ((NYTD.user && NYTD.user.id) || window.dcsvid))  {
			loggedIn = true;
		}
		return loggedIn;
	}

	/**
	Returns the cookie names set in globalConfig

	@method getCookieName
	@param  type  {String}  Which cookie you which to retrieve in globalConfig.cookies
	@return {String} The cookie name
	**/
	function getCookieName(type) {
		return (type && globalConfig.cookies[type]) ? globalConfig.cookies[type].name : false;
	}

	/**
	Stores requested articles in 'assets' which is closed over.

	@private
	@method cacheAssets
	@param  responseAssets  {Object} A response object which may or may not contain assets
	**/
	function cacheAssets(responseAssets) {
		var i, asset;
		var len = responseAssets.length;

		for (i = 0; i < len; i += 1) {
			assets[responseAssets[i].url] = responseAssets[i];
		}
	}

	/**
	Wraps the Reading List API's add method.

	Note: This method does not check if the user is allowed to access the Reading List API.
          You must provide the user's Sartre Token inside of conf.token or use
          NYTD.crossPlatformSave.request

	@method save
	@param conf {Object} A configuration object to customize the Ajax request
                         Properties:
                             url  {String}  The url to add
                             token  {String}  The user's fraud token
                             success  {Function}  (Optional) Success callback
                             fail  {Function}  (Optional) Fail callback
    @return {$.Deferred}
	**/
	function save(conf) {
		conf = $.extend({}, defaultOptions, conf);

		return ajaxFactory({
			url: '/svc/profile/reading-list/v1/add.jsonp',
			data : {
				url : conf.url
			}
		}, conf)
		.success(function(response) {
			assets[conf.url] = response.assets[0];
			conf.success(response);
		})
		.fail(conf.fail);
	}

	/**
	Wraps the Reading List API's archive method.

	Note: This method does not check if the user is allowed to access the Reading List API.
          You must provide the user's Sartre Token inside of conf.token or use
          NYTD.crossPlatformSave.request

	@method remove
	@param conf {Object} A configuration object to customize the Ajax request
                         Properties:
                             url  {String}  The url to remove
                             token  {String}  The user's fraud token
                             success  {Function}  (Optional) Success callback
                             fail  {Function}  (Optional) Fail callback
    @return {$.Deferred}
	**/
	function remove(conf) {
		conf = $.extend({}, defaultOptions, conf);

		return ajaxFactory({
			url : '/svc/profile/reading-list/v1/archive.jsonp',
			data : {
				url : conf.url
			}
		}, conf)
		.always(function(response) {
			if (assets[conf.url]) {
				assets[conf.url].state = 'archived';
			}
			conf.success(response);
		})
		.fail(conf.fail);
	}

	/**
	Wraps the Reading List API's counts method.  The response is an integer of the active count,
	not the actual HTTP response object.

	Note: This method does not check if the user is allowed to access the Reading List API.
          You must provide the user's Sartre Token inside of conf.token or use
          NYTD.crossPlatformSave.request

	@method count
	@param conf {Object} A configuration object to customize the Ajax request
                         Properties:
                             token  {String}  The user's fraud token
                             success  {Function}  (Optional) Success callback
                             fail  {Function}  (Optional) Fail callback
    @return {$.Deferred}
	**/
	function count(conf) {
		conf = $.extend({}, defaultOptions, conf);

		return ajaxFactory({
			url : '/svc/profile/reading-list/v1/counts.jsonp'
		}, conf)
		.success(function(response) {
			var count = 0;
			if (response && response.counts) {
				count = response.counts.active;
			}
			conf.success(count);
		})
		.fail(conf.fail);
	}

	/**
	Checks if the user has any articles saved.  If specified, a second request is made if the user
	has a specific article saved.

	Note: This method does not check if the user is allowed to access the Reading List API.
          You must provide the user's Sartre Token inside of conf.token or use
          NYTD.crossPlatformSave.request

	@method status
	@param conf {Object} A configuration object to customize the Ajax request
                         Properties:
                             url  {String}  The url to check
                             token  {String}  The user's fraud token
                             success  {Function}  (Optional) Success callback
                             fail  {Function}  (Optional) Fail callback
    @return {$.Deferred}
	**/
	function status(conf) {

		var entryCallback = function(response) {
			if (response && response.assets) {
				assets[conf.url] = response.assets[0];
				conf.success(response);
			}
		};
		var cookie = globalConfig.cookies.save;

		conf = $.extend({}, defaultOptions, conf);

		return ajaxFactory({
			url : '/svc/profile/reading-list/v1/quicklist.jsonp'
		}, conf).success(function(response) {
			var asset;

			if (response && response.assets) {
				cookie.value = (response.assets.length > 0);
				NYTD.cookieManager.set(cookie);

				if (!assets[conf.url] && response.assets.length === 50) {
					return check({
						url: conf.url
					}, entryCallback);
				}
			}

			conf.success(response);
		})
		.fail(conf.fail);
	}

	/**
	Wraps the Reading List API's entry method.  Checks if a specific article exists.

	Note: This method does not check if the user is allowed to access the Reading List API.
          You must provide the user's Sartre Token inside of conf.token or use
          NYTD.crossPlatformSave.request

	@method check
	@param conf {Object} A configuration object to customize the Ajax request
                         Properties:
                             url  {String}  The url to check
                             token  {String}  The user's fraud token
                             success  {Function}  (Optional) Success callback
                             fail  {Function}  (Optional) Fail callback
    @return {$.Deferred}
	**/
	function check(conf) {

		if (!conf || !conf.url) {
			return false;
		}

		if (conf.success) {
			return ajaxFactory({
				url : '/svc/profile/reading-list/v1/entry.jsonp',
				data : {
					url : conf.url
				}
			}, conf).success(function(response){
				conf.success(response);
			}).fail(conf.fail);
		}
		else {
			return assets[conf.url];
		}
	}

	/**
	Wraps the Reading List API's list method.  Retrieves the user's reading list.

	Note: This method does not check if the user is allowed to access the Reading List API.
          You must provide the user's Sartre Token inside of conf.token or use
          NYTD.crossPlatformSave.request

	@method list
	@param conf {Object} A configuration object to customize the Ajax request
                         Properties:
                             token  {String}  The user's fraud token
                             success  {Function}  (Optional) Success callback
                             fail  {Function}  (Optional) Fail callback
    @return {$.Deferred}
	**/
	function list(conf) {
		var cookie = globalConfig.cookies.save;

		conf = $.extend({}, defaultOptions, conf);

		return ajaxFactory({
			url : '/svc/profile/reading-list/v1/list.jsonp'
		}, conf)
		.success(function(response) {
			if (response && response.assets) {
				cookie.value = (response.assets.length > 0);
				NYTD.cookieManager.set(cookie);

				cacheAssets(response.assets);
			}
			conf.success(response);
		})
		.fail(conf.fail);
	}

	/**
	Wraps the add, remove, status, and list methods.  Checks if the user is logged in and is allowed to
	use the Reading List API.  If no valid Sartre token exists, it will request one and pass the requested
	method as a callback.

	@method request
	@param {Object} A configuration object to customize the Ajax request
					Properties:
                        requestType  {String}  The name of the method to request ('add', 'remove', 'list', etc...)
                        success  {Function}  Success callback.
                        fail  {Function}  Fail callback.
                        token  {String}  Override the Sartre token.
	@return {Boolean} If User is allowed to use the Reading List API.
	**/
	function request(conf) {

		var action;
		var cookie = globalConfig.cookies.save;
		var track = function(eventType) {
			var userID = (NYTD.user) ? NYTD.user.id || 0 : window.dcsvid || 0;
			if (NYTD.UPTracker && userID > 0) {
				NYTD.UPTracker.track({
					url: conf.url,
					eventType: eventType,
					userID: userID
				});
			}
		};

		// If there is no conf object
		// If the api cookie says they can't use it
		// If the save cookie says they have no saved articles and they are trying to do anything other than save
		if (!conf || NYTD.cookieManager.get(getCookieName('api')) === 'false' || (NYTD.cookieManager.get(getCookieName('save')) === 'false' && conf.requestType !== 'save')) {
			return false;
		}

		// If we're waiting for the user's info to get populated, re-call request when done
		if (NYTD.user && typeof NYTD.user.id === 'undefined') {
			$(document).on('NYTD:UserInfoComplete', function () {
				request(conf);
			});

			return false;
		}

		conf = $.extend({}, defaultOptions, conf);
		conf.requestType = (typeof conf.requestType !== 'string') ? 'list' : conf.requestType;

		if (typeof conf.url === 'string') {
			conf.url = conf.url.replace(/\?.*/,'');
		}
		
		switch(conf.requestType.toLowerCase()) {
			case 'save':
			action = function() {
				save(conf);
				track('xpsSave');
				cookie.value = true;
				NYTD.cookieManager.set(cookie);
			};
			break;
			case 'remove':
			action = function() {
				remove(conf);
				track('xpsUnSave');
			};
			break;
			case 'list':
			action = function() {
				list(conf);
			};
			break;
			case 'status':
			action = function() {
				status(conf);
			};
			break;
			case 'check':
			action = function() {
				check(conf);
			};
			break;
			case 'count':
			action = function() {
				count(conf);
			};
			break;
			default:
			action = $.noop;
		}

		if (!conf.token) {
			NYTD.sartre.getToken().always(function(response) {
				conf.token = (response && response.data) ? response.data.token : '';
				action();
			});
		}
		else {
			action();
		}

		return true;
	}

	/**
	Provides default configuration for every Ajax request needed for XPS, and initiates that request.
	Properties can be overrided by defining them in conf.

	@method ajaxFactory
	@private
	@param conf {Object} A configuration object to customize the Ajax request
	@return {$.Deferred}
	**/
	function ajaxFactory(options, conf) {
		var deferred;
		var setup = $.extend({}, options, {
			type : 'GET',
			jsonp : 'callback',
			dataType : 'jsonp',
			data : 'token=' + (conf.token || NYTD.sartre.getToken(NYTD.sartre.getToken.BEHAVIORS.cache))
		});

		if (setup.url.indexOf('http') !== 0) {
			setup.url = globalConfig.host + ((setup.url.indexOf('/') === 0) ? '' : '/') + setup.url;
		}

		setup.data += (options.data) ? '&data=' + JSON.stringify(options.data) : '';
		setup.data += (conf.limit) ? '&limit=' + conf.limit : '';
		setup.data += (conf.offset) ? '&offset=' + conf.offset : '';

		deferred = $.ajax(setup);

		// If the Reading List returns an error, it doesn't wrap it in a callback, so the browser doesn't interpret it as a response
		// and the promise remains pending.  Set a timeout to abort the request.
		setTimeout(function() {
			if (deferred.state() === 'pending') {
				deferred.abort();
			}
		}, globalConfig.timeout);

		return deferred;
	}

	return {
		request : request,
		check : check,
		isLoggedIn : isLoggedIn,
		save : save,
		remove : remove,
		status : status,
		list : list,
		count : count,
		getCookieName : getCookieName
	};

}(window, NYTD.jQuery));
