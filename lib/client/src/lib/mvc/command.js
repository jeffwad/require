/*
	@name: 				mod.mvc.command
	
	@description:		Core Command object
												
	@prototypes: 		mod.protoypes.children
						mod.protoypes.event

	@author:			Simon Jefford
	
*/
var object				= require("object"),
	forEach				= require("iter").forEach,
	children			= require("/lib/prototypes/children"),
	event				= require("/lib/prototypes/event");


exports = object(object(children, event), {
	
	constructor: module.path,
		
	execute: function() {
		
		this.__execute__.apply(this, arguments);
		
		if(this.children instanceof Array) {
			forEach(this.children, function(command) {
				command.execute.apply(command, arguments);
			});
		}
	
	},

	undo: function() {
		
		this.__undo__.apply(this, arguments);
		
		if(this.children instanceof Array) {
			forEach(this.children, function(command) {
				command.__undo__.apply(command, arguments);
			});
		}
	}

});
