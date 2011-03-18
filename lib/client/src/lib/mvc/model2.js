var car = object(model, {

	constructor: module.path,

	belongsTo: ["range"],
	hasAndBelongsToMany: ["category"],
	hasOneOfMany: ["interior", "engine", "gearbox", "colour"],
	hasMany: ["options"],
	hasOne: ["discount"],

	schema: {
		model: {required: "characters-1:20", url: "/api/validate/model"}
	}

});


var models, 
	instance,
	validateObject,
	validateProperty,
	create;


create = function(model, raw) {

	raw.__model__ = model;

	return object(instance, raw);

};

//	broadcast a http error event
httpError = function(event, err) {

	eventMachine.fire({
		type: "HTTP_REQUEST_ERROR",
		data: {
			status: err.message,
			model: event
		}
	});
};

//	broadcast a start request event
initiate = function(event) {

	this.fire({
		type: "INITIATE_ASYNC_" + this.event + "_REQUEST"
	});
};

//	broadcast a stop request event
complete = function(event) {

	this.fire({
		type: "ASYNC_" + this.event + "_REQUEST_COMPLETE"
	});
};




models = {};

instance = object(event, {

	constructor: module.path + "/instance",

	__init__: function() {
		
		var self = this, relationships = [];

		if(this.__model__.hasOne) {
			relationships.push(this.__model__.hasOne);
		}

		if(this.__model__.hasMany) {
			relationships.push(this.__model__.hasMany);
		}

		forEach(chain(relationships), function(model) {
			self["find" + capitalise(model)] = function(options) {
				return models[parent].find(options)
			};
		});


	},

	save: function() {

	},

	remove: function() {

	}

});



exports = object(event, {

	constructor: module.path,

	skipInit: true,

	__init__: function() {

		var self = this, relationships = [];
		
		if(this.belongsTo) {
			relationships.push(this.belongsTo);
		}

		if(this.hasAndBelongsToMany) {
			relationships.push(this.hasAndBelongsToMany);
		}

		if(this.hasOneOfMany) {
			relationships.push(this.hasOneOfMany);
		}

		forEach(chain(relationships), function(model) {
			self["findBy" + capitalise(model)] = function(options) {
				return models[parent].find(options)
			};
		});

	},

	load: function() {

	},

	create: function(raw) {

		try {
		
			var self = this,
				isValid = validateObject(this, raw);
		
			if(isValid.success) {

				initiate(this.event);

				async.putData(this.createURL, "json", {data: raw}).then(function(data){

					complete(self.event);

					if(data.success) {

						self.dirty();
						raw.id = data.id;
						create(self, raw);
						self.fire({
							type: self.event + "_CREATED",
							data: raw
						});
					}
					else {
						invalidData(data);					
					}
					return data;
				},
				function(err) {
					httpError(self.event, err);
				});
			}
			else {
				this.invalidData(isValid);
			}

		}
		catch(e) {
			console.log(this.event, ": ", e);
		}
	},

	find: function() {

	},

	get: function() {


	}

});
