describe("Worker", function() {

	var spawn 	= require("module").spawn,
		sys		= require("sys");

	it("should spawn a module and start communicating", function() {
		
		var i = 0;
		
		sys.addListener("workerUpdate", function(data) {

			expect(data.response).toEqual("worker fires message");
			expect(data.i).toEqual(i);
			i++;
		});

		spawn("tests/spec/spawn");

		waits(2000);

		runs(function() {
			
			sys.fire("updateWorker");

		});

		waits(1000);

		runs(function() {
			
			sys.fire("updateWorker");

		});

	});


});
