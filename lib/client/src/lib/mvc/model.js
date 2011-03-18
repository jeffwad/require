/*
	@name: 			/mod/mvc/model
	
	@description: 	base model
	
	@author: 		Simon Jefford
	
*/
var uuid = require("/lib/3rd_party/uuid");


exports = {

	__init__: function() {

		this.__data__ = {};

	},

	put: function(data, callback) {

		if(!data.id) {
			data.id = uuid.generate();
		}
		this.__data__[data.id] = data;

		callback(false, data.id);	
	},

	get: function(id, callback) {
		var data = this.__data__[id],
			err = data ? false : new Error("Invalid key");
		
		callback(err, data);
	},

	find: function() {

	},

	del: function(id) {

	}

};
