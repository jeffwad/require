require.define("/tests/timer",

	["eventMachine"],

	function(require, exports, module) {

		var eventMachine = require("eventMachine"),
			i = 0,
			t;
		
		setTimeout(function() {
		
			eventMachine.fire("update", {
				id: i++
			});
		
			if(i === 10) {
				console.log("console-log: " + i);
			}
			else {
				setTimeout(arguments.callee, 1000);
			}
		
		}, 1000);
		
		
		return [exports, module];
	}

);