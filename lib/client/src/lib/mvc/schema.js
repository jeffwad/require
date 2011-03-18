/*
	@name: 				/mod/mvc/schema
	
	@description: 		Core schema object

	@author: 			Simon Jefford
	
*/
var object			 = require("object"),
	filter			 = require("iter").filter,
	reduce			 = require("iter").reduce,
	schema,
	validate;


validate = function(schema, raw, onlyValidateRawFields) {

	try {

		var r = filter(schema.schema, function(field) {
			var rule, value = raw[field.name], rules = schema.rules, l;							
			if(field.required) {
				rule = field.required;
			}
			else if(field.validate) {
				rule = field.validate;							
			}
			else {
				return false;			
			}
			if(onlyValidateRawFields && (typeof raw[field.name] === 'undefined')) return false;
			

			//	must return true to populate filtered array. back to front logic required
			switch(true) {

				case !!rules[rule]:
					return !(rules[rule].test(value));

				case /^characterCount-(\d+):(\d+)*$/.test(rule):
					l = value.length;
					return (parseFloat(RegExp.$1) <= l && l <= parseFloat(RegExp.$2)) ? false : true;

				case /^wordCount-(\d)+:(\d)+$/.test(rule):
					l = value.split(" ").length;
					return (parseFloat(RegExp.$1) <= l && l <= parseFloat(RegExp.$2)) ? false : true;

				case /^confirm-(.+)$/.test(rule):
					return value === raw[RegExp.$1] ? false : true;

				case /^true$/.test(rule):
					return value === true ? false : true;

				case /^false$/.test(rule):
					return value === false ? false : true;

				case typeof rule === 'function':
					return !(rule(raw));

				case rule instanceof RegExp:
					return !(rule.test(value));

			};

			return false;

		});

		return (r.length === 0) ? {success: true} : reduce({success: false, errorType: "validation", errors: {}} ,r, function(err, field) {
			err.errors[field.name] = field.name;
			return err;
		});

	}
	catch(e) {
		log(module, e);
	}
};

schema = {

	validate: function(raw, onlyValidateRawFields) {
		return validate(this, raw, onlyValidateRawFields);
	},
	rules: {
		isNotEmpty: /.+/,
		email: /^([a-zA-Z0-9])+([\.a-zA-Z0-9_-])*@([a-zA-Z0-9])+(\.[a-zA-Z0-9_-]+)+$/
	}

};

exports = function(def) {
	return object(schema, {"schema": def});
};

