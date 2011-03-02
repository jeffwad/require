define("/tests/spec/spawn",

	["sys"],

	function(require, exports, module) {

		var sys = require("sys"),
			i = 0;
		
		setTimeout(function() {
		
			sys.fire("workerUpdate", {
				response: "worker fires message",
				i: i
			});
			i++;
		}, 1000);

		sys.on("updateWorker", function() {
			sys.fire("workerUpdate", {
				response: "worker fires message",
				i: i
			});			
			i++;
		});
		
	}

);
