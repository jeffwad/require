/*
	@name: 				/mod/mvc/frontcontroller
	
	@description: 		Initially runs the application passing in the #hash URL property when the app loads
						Handles URL #hash changes and fires a DISPATCH_URL event
	
	@author: 			Simon Jefford
	
*/
var delay				 = require("func").delay,
	eventMachine		 = require("eventMachine"),
	currentHash 		 = "",
	controller, 
	getHash, 
	setHash,	
	testLocation, 
	dispatchURL, 
	start, 
	stop,
	hashchange = false;


//	returns the hash value of the URL	
getHash = function() {
	return window.location.hash.toString();
};

//	sets the hash value of the URL	
setHash = function(hash) {
	window.location.hash = hash;
};


//	test location - if it has changed then stop monitoring and fire the DISPATCH_URL event
testLocation = function() {
	var hash = getHash();
	if(hash !== currentHash) {
		stop();
		dispatchURL(hash);
		currentHash = hash;
		start();
	}
};

if ("onhashchange" in window) {
	hashchange = true;
	window.onhashchange = testLocation;	
}


//	call the dispatcher with a DISPATCH_URL message
dispatchURL = function(hash) {

	eventMachine.fire("dispatchURL", {
		url: hash
	});
};

//	start monitoring the URL
start = function() {
	testLocation();
	if(!hashchange) {
		controller = delay(arguments.callee, 30);
	}
};	

//	stop monitoring the URL
stop = function() {
	clearInterval(controller);
};

//	the frontControllers starter motor
exports.run = function(hash) {
	setHash(hash);	
	start();
};
