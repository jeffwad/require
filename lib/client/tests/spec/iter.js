describe("Iter", function() {

	var array;

	beforeEach(function() {
		array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	});
	
	describe("For each", function() {

		var forEach = require("iter").forEach;

		it("can iterate over an array", function() {
			
			var i = 1, j = 0;
			forEach(array, function(v, k) {
				expect(v).toEqual(i);
				expect(k).toEqual(j);
				i++;
				j++;
			});
			
		});
		
	});
	
});
