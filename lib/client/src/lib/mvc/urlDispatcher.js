/*
	@name: 				/mod/mvc/urlDispatcher
	
	@description: 		Listens for DISPATCH_URL events fired by the front controller
						The incoming Hash URL (#some/data/here/would+be+processed) is then matched against
						the dispatchers routes. When a route matches, it's own event is fired and any captured parameters
						get converted into a request object
	
						The following route:
						
						route = {
							
							pattern: /#brand\/(\w+)\/model\/(\w+)\/device\/(\w+)\/?/g,
							
							event: "LOAD_NEW_DEVICE",
							
							params: ["brand, "model", "device"]
						};
	
						
						would ouput when matching URL #brand/nokia/model/n96/device/nokia_n96_ver1
						
						eventMachine.fire({
							type: "LOAD_NEW_DEVICE",
							data : {
								brand: "nokia",
								model: "n96",
								device: "nokia_n96_ver1"
							}
						});
						
						
	@author: 			Simon Jefford
	
*/
var iter	 			 = require("iter"),
	eventMachine		 = require("eventMachine"),
	forEach				 = iter.forEach,
	reduce				 = iter.reduce,
	routes,
	dispatchURL,
	createRequest;

dispatchURL = function(data) {

	try {

		var matched = false, url = data.url;
		forEach(routes, function(route) {
			var m = url.match(route.pattern);
			if(m) {
				matched = true;
				m.shift();
				eventMachine.fire(route.event, {
					data: createRequest(m, route.params)
				});
			}
		});	
		if(!matched) {
			console.warn(url, ": No route match found");
		}
	}
	catch(err) {
		console.log(err);
	}
};

createRequest = function(values, keys) {
	return reduce({}, keys, function(request, name, i) {
		request[name] = values[i];
		return request;
	});
};

//	register the url dispatcher to run when a dispatch url message is sent
eventMachine.addListener("dispatchURL", dispatchURL);

exports.loadRoutes = function(r) {
	routes = r;
};
