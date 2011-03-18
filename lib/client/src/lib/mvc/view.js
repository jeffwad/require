/*
	@name: 				/mod/mvc/view
	
	@description: 		Core view object

	@prototypes: 		mod.protoypes.children
						mod.protoypes.event
	
	@author: 			Simon Jefford
	
*/
var object					 = require("object"),
	forEach					 = require("iter").forEach,
	event					 = require("/lib/prototypes/event"),
	children				 = require("/lib/prototypes/children"),		
	template				 = require("/lib/mvc/template"),
	$						 = require("/lib/dom/core");

exports = object(object(children, event), {
	
	constructor: module.path,

	//	default draw method. draws the main template associated with the view
	//	call it's own private __draw__ and the public draw af any child views
	draw: function(data) {
		this.__draw__(data);
		if(this.children) {
			forEach(this.children, function(child) {
				child.draw(data);
			});
		}
		return this;
	},

	//	private draw method: overwrite if you wish to stop a view being drawn by it's parent.
	__draw__: function(data) {
		this.render(this.id, "main", data);
	},

	//	renders a template into root
	render: function(root, name, data) {
		try	{
			$(root).innerHTML(this.templates[name].process({
				data: data || {},
				content: this.templateContent[name]
			}));
		}
		catch(e) {
			//console.log(e);
		}

	},

	//	writes content into the specified path
	html: function(css, data) {
		$(css, this.id).innerHTML(data);
	},

	//	loads a template and it's content: non updatable copy
	loadTemplate: function(name, raw, content) {
		if(!this.hasOwnProperty("templates")) {	
			this.templates = {};
			this.templateContent = {};
		}
		this.templates[name] = template(raw);
		this.templateContent[name] = content || {};
	},

	//	initialises the dom. call it's own private __initDom__ and the public initDom af any child views
	initDom: function() {
		this.__initDom__();
		if(this.children) {
			forEach(this.children, function(child) {
				child.initDom();
			});
		}
		return this;
	},

	//	to be overwritten further up the prototype chain
	__initDom__: function() {
		
	},

	//	shows the view
	show: function(recurse){
		this.__show__();
		if(recurse && this.children) {
			forEach(this.children, function(child) {
				child.show(recurse);	
			});
		}
		return this;
	},

	__show__: function() {
		$(this.id).show();
	},

	
	//	hides the view
	hide: function(recurse) {
		this.__hide__();
		if(recurse && this.children) {
			forEach(this.children, function(child) {
				child.hide(recurse);	
			});
		}
		return this;
	},
	
	__hide__: function(){
		$(this.id).hide();
	}

});
