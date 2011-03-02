describe("Async", function() {

	var deferred = require("async").deferred,
		when = require("async").when;

	describe("Deferred", function() {
				
		it("should return a promise", function() {
			
			var promise = deferred();
			expect(promise.constructor).toEqual("promise");
			
		});
		
		it("should fire after 1 second", function() {
			
			var promise = deferred(), response;
			promise.then(function(data) {
				response = data;
				return data;
			});

			setTimeout(function() {
				promise.fire("promise has fired");
			}, 1000);

			waits(2000);

			runs(function() {
				expect(response).toEqual("promise has fired");
			});
		});

		
	});
	
	
	describe("When", function() {

		it("should fire when all deferreds have fired", function() {
			
			var i, d = [deferred(), deferred(), deferred()], response;
			for(i = 0; i < 3; i++) (function(i) {
				setTimeout(function() {
					d[i].fire();
				}, Math.floor(Math.random()*1001));
			})(i);

			when(d[0], d[1], d[2]).then(function() {
				response = "all promises have fired";
			});
			
			waits(2000);
			
			runs(function() {
				expect(response).toEqual("all promises have fired");
			});
			
		});
		
	});
	
});
