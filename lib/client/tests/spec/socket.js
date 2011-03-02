
describe("Socket", function() {

	var net = require("net");

	it("should connect client socket to server", function() {

		//*
		var s = net.socket("ws://127.0.0.1:8080/socket.io/websocket");

		s.on("socketConnected", function() {
			console.log("socketConnected");
			s.fire("pingServer", {
				response: "ping the server one time"
			});
		});

		s.on("socketClosed", function() {
			console.log("socketClosed");
		});

		s.on("initialiseClient", function(data) {
			console.log(data.response);
		});

		s.on("pingServer", function(data) {
			console.log(data);
		});

		// */
	});

});
