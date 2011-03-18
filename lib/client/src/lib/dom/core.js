/*
	@name: 				mod.dom.core

	@description: 		Core DOM manipulation functions. Built to be jquery ish in use.

	@author: 			Simon Jefford
	
*/
var object				 	= require("object"),
	iter					= require("iter"),
	string					= require("string"),
	generateGuid		 	= require("utils").generateGuid,
	Sly						= require("/lib/3rd_party/sly"),
	forEach					= iter.forEach,
	reduce					= iter.reduce,
	map						= iter.map,
	trim				 	= string.trim,
	camelCase			 	= string.camelCase,
	getRegEx,
	find,
	dom,
	observe,
	instanceEvents,
	nodeListArray,
	nodeList;

//	define node type
if(typeof document.ELEMENT_NODE === 'undefined') {
	document.ELEMENT_NODE = 1;
	document.ATTRIBUTE_NODE = 2;
	document.TEXT_NODE = 3;
	document.CDATA_SECTION_NODE = 4;
	document.ENTITY_REFERENCE_NODE = 5;
	document.ENTITY_NODE = 6;
	document.PROCESSING_INSTRUCTION_NODE = 7;
	document.COMMENT_NODE = 8;
	document.DOCUMENT_NODE = 9;
	document.DOCUMENT_TYPE_NODE = 10;
	document.DOCUMENT_FRAGMENT_NODE = 11;
	document.NOTATION_NODE = 12;
};


getRegEx = function() {

	var cache = {};

	return function(expr, modifiers) {
		modifiers = modifiers || "";
		var regEx = cache[expr + modifiers];
		if(!regEx) {
			regEx = cache[expr + modifiers] = new RegExp(expr, modifiers);
		};
		return regEx;
	};

}();


observe = function() {

	var observer, fire; 

	observer = {
		start: function(capture) {
			if(!this.isActive) {
				this.obj.addEventListener(this.type, this.func, capture || false);
				this.isActive = true;
			};
		},
		stop: function(capture) {
			if(this.isActive === true) {
				this.obj.removeEventListener(this.type, this.func, capture || false);
				this.isActive = false;
			};
		}
	};

	return function(obj, type, func) {
		var l;	
		l = object(observer, {
			obj: obj,
			type: type,
			func: func
		});
		l.start();
		return l;
	};

}();

/*

	instance methods

*/

instanceEvents = {
	on: function() {

		var bind = function(obs, type, id) {
			if(typeof id !== 'undefined') {
				obs[id][type]();
			}
			else {
				forEach(obs, function(o) {
					o[type]();
				});
			};
		};

		return function() {				

			var type = arguments[0], func = arguments[1], expr, listener, obs;
			if(arguments.length === 3) {
				expr = arguments[1];
				listener = arguments[2];
				func = function(e) {

					var node = e.target;
					while(node) {
						if(Sly.match(expr, node)) {
							e.boundTarget = node;
							listener.call(node, e);
							break;
						};
						node = node.parentNode;
					};
				};

			};
			obs = map(this, function(node) {
				return observe(node, type, func);
			});

			return {
				stop: function(id) {
					bind(obs, 'stop', id);
				},
				start: function(id) {
					bind(obs, 'start', id);
				}
			};
		};
	}()
};

dom = {

	hasAttribute: function (attr, operator, value) {
		attr = (window.ActiveXObject && attr === 'class') ? 'className' : attr;
		var v, re, node = this[0];

		switch (true) {
			case operator === false || operator == undefined || operator === "":
				return !! node.hasAttribute(attr);
			case operator === "~=":
				return node.getAttribute(attr).indexOf(value) !== -1 ? true: false;
			default:
				if(operator === "=")  re = getRegEx('(^| |%20)' + value + '(%20| |$)');
				if(operator === "^=") re = getRegEx('^' + value);
				if(operator === "$=") re = getRegEx(value + '$');
				return !!re.test(node.getAttribute(attr));
		};

	},

	hasClass: function(c) {
		if(!this.hasAttribute('class', '=', c)) {
			return false;
		};
		return true;
	},

	addClass: function(c) {
		var reClass = getRegEx("" + c + "", "gi");
		forEach(this, function(node) {
			node.className += !node.className.match(reClass) ? ((node.className.length > 0) ? ' ' + c : c) : '';
		});
		return this;
	},

	removeClass: function(c) {
		var reClass = getRegEx("^(.*?)" + c + "(.*)", "i");
		forEach(this, function(node) {
			node.className = trim(node.className.replace(reClass,"$1$2")).replace('  ', ' ');
		});
		return this;
	},

	getStyle: function(prop) {		
		return document.defaultView.getComputedStyle(this[0] , "").getPropertyValue(camelCase(prop));
	},

	show: function(type) {
		type = type || 'block';
		var self = this;
		forEach(this, function(node) {
			node.style.display = type;
		});
		return this;
	},

	hide: function() {
		return this.show("none");
	},

	toggle: function(type) {
		type = type || 'block';
		var self = this;
		forEach(this, function(node) {
			node.style.display = (self.getStyle("display") === "none") ? type : "none";
		});
		return this;
	},

	innerHTML: function(html) {
		forEach(this, function(node) {
			node.innerHTML = html;
		});
		return this;
	},

	value: function() {

		return this[0].value;

	}

};

/*

	Constructor

*/
nodeListArray = {
	constructor: module.path,
	length: 0,
	push: function(i) {
		this[this.length++] = i;
	}
};

nodeList = object(object(object(nodeListArray, instanceEvents), dom), { toString: function() {
	return reduce([], this, function(i, value){
		i.push(value);
		return i;
	}).join(',');
}});

exports = function(init, context) {

	var nodes, i, l, o = false;
	if(typeof init === 'string') {
		o = object(nodeList);
		nodes = Sly.search(init, context || false);
		for(i = 0, l = nodes.length; i < l; i++) {
			o.push(nodes[i]);
        };
	}
	else if(init.nodeType === document.ELEMENT_NODE || init === document || init === document.body) {
		o = object(nodeList);
		o.push(init);
	}
	else if(init.constructor === module.path) {
		o = init;
	};

	return o;
};
