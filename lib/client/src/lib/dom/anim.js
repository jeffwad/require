/*
	@name: 			/mod/dom/anim
	
	@description:	Animation factory
	
	@author: 		Simon Jefford

*/
var object					= require("object"),
	extend					= require("extend"),
	generateGuid			= require("utils").generateGuid, 
	iter					= require("iter"),
	camelCase				= require("string").camelCase,
	$						= require("/lib/dom/core"),	
	forEach					= iter.forEach,
	reduce					= iter.reduce,
	map						= iter.map,
	easing;

easing = {};

// make a transition function that gradually accelerates. pass a=1 for smooth
// gravitational acceleration, higher values for an exaggerated effect
extend(easing, {
	makeEaseIn: function(a) {
		return function(pos) {
			return Math.pow(pos, a*2); 
		};
	},
	// as makeEaseIn but for deceleration
	makeEaseOut: function(a) {
		return function(pos) {
			return 1 - Math.pow(1 - pos, a*2); 
		};
	},
	// make a transition function that, like an object with momentum being attracted to a point,
	// goes past the target then returns
	makeElastic: function(bounces) {
		return function(pos) {
			pos = easing.easeInOut(pos);
			//return ((1-Math.cos(pos * Math.PI * bounces)) * (1 - pos)) + pos; 
			return ((1-Math.cos(pos * Math.PI * bounces)) * (1.2 *(1 - pos))) + pos; 
		};
	},
	// make a transition function that, like a ball falling to floor, reaches the target and/
	// bounces back again
	makeBounce: function(bounces) {
		var fn = easing.makeElastic(bounces);
		return function(pos) {
			pos = fn(pos); 
			return pos <= 1 ? pos : 2-pos;
		};
	}
});

// pre-made transition functions to use with the 'transition' option
extend(easing, {
	easeInOut: function(pos){
		return ((-Math.cos(pos*Math.PI)/2) + 0.5);
	},
	linear: function(pos) {
		return pos;
	},
	easeIn: easing.makeEaseIn(1.5),
	easeOut: easing.makeEaseOut(1.5),
	strongEaseIn: easing.makeEaseIn(2.5),
	strongEaseOut: easing.makeEaseOut(2.5),
	elastic: easing.makeElastic(1),
	veryElastic: easing.makeElastic(3),
	bouncy: easing.makeBounce(1),
	veryBouncy: easing.makeBounce(3)
});


exports.easing = easing;

//	factory, creates an fx factory
exports.factory = function(i) {
	
	var animator,
		e,
		controller,
		dimension,
		tween,
		tweens,
		hexToRgb,
		animation;

	//	each factory has its own animator, which contains a set of animations
	animator = function() {
		
		var stack,
			update,
			self,
			timer = false,
			interval = i || 20;
			
		stack = [];
		
		update = function() {
			var i = 0;
			try {
				while(true) {
					stack[i++].next();
				}
			}
			catch(e) {
				//console.log(e);
			}

			if(stack.length === 0) {
				clearTimeout(timer);
				timer = false;
			}
		};
					
		self = {
			add: function(fx) {
				stack.push(fx);				
				if(!timer) {
					update();
					timer = setInterval(update, interval);
				}
			},
			remove: function(fx) {
				var i;
				for(i = 0; i < stack.length; i++) {
					if(stack[i].__id__ === fx.__id__) {
						stack.splice(i, 1);
						break;
					}
				}					
				
			},
			interval: interval
		};

		return self;
		
	}();
	
	//	empty callback function
	e = function() {};
	
	//	all animations must have this as their prototype. It controls individual animations
	controller = {

		__init__: function() {
			if(!this.hasOwnProperty("__id__")) {
				this.__id__ = generateGuid();
			}
			this.bindEvents(this.options.events);
			this.from = 0;
			this.to = 1;
		},
		
		start: function(params) {
			if(params) {
				this.animation.updateAnimationProperties(params);
				this.from = 0;
			}			
			this.time = new Date().getTime();
			if(!this.running) {			
				animator.add(this);
			}
			this.running = true;
			this.onStart();
		},
		stop: function() {
			this.running = false;
			animator.remove(this);	
			this.onStop();
		},
		reset: function() {
			this.from = 0;
		},
		next: function() {
			this.getState();			
			this.animation.update(this.from);
			this.onUpdate(this.from);
			if(this.from === this.to) {
				this.reset();
				this.running = false;			
				animator.remove(this);
				this.onComplete();
			}
		},
		bindEvents: function(events) {
			var self = this;
			forEach(events || {}, function(e, name) {
				self[name] = e;
			});
		},
		getState: function() {
			var movement, now, diff;

			if(this.from !== this.to) {
				now = new Date().getTime();
				diff = (now - this.time);///1000;
				movement = (diff / this.duration) * (this.from < this.to ? 1 : -1);
				this.time = now;				
				if(Math.abs(movement) >= Math.abs(this.from - this.to)) {
					this.from = this.to;
				}
				else {
					this.from += movement;
				}
			}
		},
		onComplete: e,
		onUpdate: e,
		onStart: e,
		onStop: e
	};

	hexToRgb = function(hex) {
		return {
			r: parseInt(hex.slice(1, 3), 16),
			g: parseInt(hex.slice(3, 5), 16),
			b: parseInt(hex.slice(5, 7), 16)
		};
			
	};


	dimension = {
		
		__init__: function() {
			if(this.options) {			
				this.easing = this.options.easing || easing.linear;
				this.suffix = this.options.suffix || "px";
			}
		},
		update: function(state) {
			this.node.style[this.property] = this.getValue(state) + this.suffix;
		},
		getValue: function(state) {
			return (this.currentValue = Math.round((this.begin + ((this.end - this.begin) * this.easing(state))) * 100)/100);
		},
		updateAnimationProperties: function(params) {
			this.begin = (typeof params.begin !== "undefined") ? params.begin:  this.currentValue;
			this.end = (typeof params.end !== "undefined") ? params.end: this.end;
		}
	};	
	
	tweens = {

		dimension: dimension,

		opacity: object(dimension, {
			__init__: function() {
				this.callSuper(arguments);
				this.suffix = "";
			},
			update: function(state) {
				var v = this.getValue(state);
				this.node.style['opacity'] = v / 100;
				this.node.style['-moz-opacity'] = v / 100;
				if(this.node.filters) this.node.filters.alpha['opacity'] = v;						
			}
		}),

		colour: object(dimension, {
			__init__: function() {
				this.callSuper(arguments);
				this.suffix = "";
				if(this.begin) {				
					this.begin = hexToRgb(this.begin);
					this.currentValue = this.begin;
					this.end = hexToRgb(this.end);
				}			
			},			
			getValue: function(state) {
				var begin = this.begin, end = this.end;				
				return ["rgb(", map(["r", "g", "b"], function(colour) {
					return Math.round(begin[colour] + ((end[colour] - begin[colour]) * state));
				}), ")"].join("");
			},
			updateAnimationProperties: function(params) {
				this.begin = params.begin ? hexToRgb(params.end): this.currentValue;
				this.currentValue = this.begin;
				this.end = hexToRgb(params.end || this.end);
			}
		})
	};


	tween = function(node, property, begin, end, options) {
			
		return object(tweens[(function() {
				if(/color/.test(property)) return "colour";
				else if (property === "opacity") return "opacity";
				else return 'dimension';
		})()], {
			node: $(node)[0],
			property: camelCase(property),
			currentValue: begin,			
			begin: begin,
			end: end,
			options: options
		})
	};

	//	dom animation, for animating more than one tween from the same controller
	animation = function(node, duration, options) {

		var animation = {
			update: function(state) {
				var i, l;				
				for(i = 0, l = this.stack.length; i < l; i++) {
					this.stack[i].update(state);
				}
			},
			stack: reduce([], options.tweens, function(r, values, property) {
				r.push(tween(node, values[0], values[1], values[2], {
					easing: values[4] || false,
					suffix: values[3] || "" 
				}));
				return r;
			}),
			updateAnimationProperties: function(params) {
				var i, l;				
				for(i = 0, l = this.stack.length; i < l; i++) {
					this.stack[i].updateAnimationProperties(params[i]);
				}
			}
		};
						
		return object(controller, {
			duration: duration,
			options: options,
			animation: animation
		});

	};


	return {
		controller: controller,

		tween: function(node, property, duration, begin, end, options) {
			
			options = options || {};
		
			return object(controller, {
		
				duration: duration,
				options: options,
				animation: tween(node, property, begin, end, options)
			});

		},
		animation: animation
	};
	
};


//	create a default factory
exports.fx = exports.factory(15);
