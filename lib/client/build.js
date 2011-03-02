var fs		 = require("fs"),
	copyFile,
	createTransportFile,
	run,
	runTests;


copyFile = function(filename) {

	fs.readFile(filename, "utf8", function(err, data) {

		//	write the file
		filename = filename.replace("/src/", "/htdocs/");

		fs.writeFile(filename, data, "utf8", function(err) {
			console.log("build file: " + filename);
		});
	});
};

createTransportFile = function(filename) {

	fs.readFile(filename, "utf8", function(err, data) {

		var requires, transport, raw, start;
	
		requires = [];
		transport = [
			"define(\"" + filename.split(__dirname + "/src")[1].split(".js")[0] + "\",\n\n",
			"\tfunction(require, exports, module) {\n\n",
			//"\t\treturn [exports, module];\n",
			"\t}\n\n",
			");"
		];

		//	does the module have any dependencies
		requires = data.match(/require\(["'](\w*|\/*|:*|-*|\.tpl)+["']\)/g);
		requires = requires ? requires.map(function(dependency) {
			return "\"" + dependency.replace(/require\("/, "").replace(/"\)/, "") + "\"";
		}) : false;

		//	split at the first end comment block
		raw = data.split("*/\n");

		//	find the line at which the module start		
		start = raw[0].split("\n").length;

		//	stich the module back together
		raw.shift();
		data = raw.join("*/\n").replace(/\n/g, "\n\t\t");

		//	insert raw module into transport
		transport.splice(2, 0, "\t\t" + data + "\n");

		//	insert the requires list and calculate the actual start position
		if(requires) {
			start = start - 6;
			transport.splice(1, 0, "\t[" + requires.join(",") + "],\n\n");
		}
		else {
			start = start - 4;
		}

		//	push the start position down. ensures line numbers match	
		for(var i = 0; i < start; i++) {
			transport.unshift("\n");		
		}

		//	write the file
		filename = filename.replace("/src/", "/htdocs/");

		fs.writeFile(filename, transport.join(""), "utf8", function(err) {
			console.log("build file: " + filename);
		});

	});
};

run = function(filename){

	fs.stat(filename, function(err, stats) {
		if(err) throw err;
		if(stats.isFile() && /\.js$/.test(filename)) {
			if(!/(require|worker)\.js$/.test(filename)) {
				createTransportFile(filename);
			}
			else {
				copyFile(filename);
			}
		} 
		else if(stats.isFile()) {
			copyFile(filename);
		} 
		else if(stats.isDirectory()) {

			fs.readdir(filename, function(err, files) {
				files.forEach(function(file){
					run(filename + '/' + file);
				});
			});

		}
	});
};

runTests = function(filename){

	fs.stat(filename, function(err, stats) {
		if(err) throw err;
		if(stats.isFile()) {
			copyFile(filename);
		} 
		else if(stats.isDirectory()) {

			fs.readdir(filename, function(err, files) {
				files.forEach(function(file){
					runTests(filename + '/' + file);
				});
			});

		}
	});
};

//	start batch.
run(__dirname + "/src");
runTests(__dirname + "/tests");
