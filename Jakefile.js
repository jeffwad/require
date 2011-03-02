//	er, pinched runCmds from geddy. nicely done sir.
//	create a new project
var sys = require('sys'),
	child_process = require('child_process'),
	fs = require('fs'),
	runCmds;

namespace("create", function() {

	desc("Create a new application");
	task("app", [], function(appName) {

		var dirs = [
			"",
			"/client",
			"/client/htdocs",
			"/client/htdocs/app",
			"/client/htdocs/app/commands",
			"/client/htdocs/app/controllers",
			"/client/htdocs/app/models",
			"/client/htdocs/app/shaders",
			"/client/htdocs/app/templates",
			"/client/htdocs/app/views",
			"/client/htdocs/config",		
			"/client/htdocs/lib",		
			"/client/htdocs/lib/webgl",
			"/client/htdocs/lib/webgl/core",
			"/client/htdocs/lib/webgl/shaders",
			"/client/src",
			"/client/src/app",
			"/client/src/app/commands",
			"/client/src/app/controllers",
			"/client/src/app/models",
			"/client/src/app/shaders",
			"/client/src/app/templates",
			"/client/src/app/views",
			"/client/src/config",		
			"/client/src/lib",
			"/client/src/lib/webgl",
			"/client/src/lib/webgl/core",
			"/client/src/lib/webgl/shaders",
			"/server",
			"/tests"
		
		].map(function(dir){
			return "mkdir -p ../" +appName + dir;
		});
	
		runCmds(dirs, function() {

			var files = [
				//"cp -R lib/client/src/app/* ../" + appName + "/client/src/app/",
				"cp -R lib/client/src/* ../" + appName + "/client/src/",
				"cp lib/utils/* ../" + appName
			];
		
			runCmds(files, function() {

				console.log("Created app " + appName + ".");

			});

		});
	});


});

namespace("update", function() {

	desc("Create a new application");
	task("app", [], function(appName) {

		var files = [
			"cp -R lib/client/src/lib/* ../" + appName + "/client/src/lib",
			"cp -R lib/client/src/require.js ../" + appName + "/client/src/require.js",
			"cp -R lib/client/src/worker.js ../" + appName + "/client/src/worker.js",
			"cp lib/utils/* ../" + appName
		];

		runCmds(files, function() {

			console.log("Updated app " + appName + ".");

		});

	});


});


// Runs an array of shell commands asynchronously, calling the
// next command off the queue inside the callback from child_process.exec.
// When the queue is done, call the final callback function.
runCmds = function (arr, callback, printStdout) {
	var run = function (cmd) {
		child_process.exec(cmd, function (err, stdout, stderr) {
			if (err) {
				console.error('Error: ' + JSON.stringify(err));
			}
			else if (stderr) {
				console.error('Error: ' + stderr);
			}
			else {
				if (printStdout) {
					console.log(stdout);
				}
				if (arr.length) {
					var next = arr.shift();
					run(next);
				}
				else {
					if (callback) {
						callback();
					}
				}
			}
		});
	};
	run(arr.shift());
};
