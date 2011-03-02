require.define("/tests/main",

	["module","eventMachine"],

	function(require, exports, module) {

		var spawn = require("module").spawn,
			eventMachine = require("eventMachine");
		
		eventMachine.addListener("update", function(data) {
			console.log("worker ping: ", data.id);
		});
		
		
		spawn("/tests/timer", function() {
			console.log("worker spawned");
		});
		
		
		var socket = new WebSocket("ws://127.0.0.1:8124");
		
		console.log(socket)
		
		socket.onopen = function() {
			console.log("opened");	
		}
		socket.onmessage = function(data) {
			console.log(data);	
		}
		socket.onclose = function() {
			console.log("close");	
		}
		socket.onerror = function(e) {
			console.log();	
		}
		
		
		return [exports, module];
	}

);