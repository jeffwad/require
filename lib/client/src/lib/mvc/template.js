/*
	@name: 				/mod/mvc/template
	
	@description: 		Core template object: wraps 3rd party implementation

	@prototypes: 		mod.protoypes.children
						mod.protoypes.event
	
	@author: 			Simon Jefford
	
*/
var jsontemplate			= require("/lib/3rd_party/jsontemplate");


exports = function(raw) {
	return new jsontemplate.Template(raw);
};
