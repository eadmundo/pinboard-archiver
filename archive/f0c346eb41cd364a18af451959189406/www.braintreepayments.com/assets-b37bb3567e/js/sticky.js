function Sticky(a){
	this.el = $(a.selector);
	this.shim = this.el.clone().css({display: 'block', height:this.el.height(), width: this.el.width()}).html('&nbsp;'); // shell clone of el
	this.container = $(a.container);

	this.settings = {};
	this.settings.shim = (a.shim) ? true : false;
	this.settings.cssClass = 'sticky';
	this.settings.offset = -147;

	this.trigger = {}
	this.trigger.top = this.setTriggerTop();
	this.trigger.btm = this.setTriggerBtm();

	this.original = {};
	this.original.left = this.container.offset().left;

	this.init();
}

Sticky.prototype.init = function(){
	var self = this;

	// append shim
	if (self.settings.shim) {
		this.el.before(self.shim);
		this.shim.hide();	
	}

	this.events();
};

Sticky.prototype.events = function(){
	var self = this;

	$(window).scroll(function(){
		self.updateElement($(this));
	}).resize(function(){
		self.original.left = self.container.offset().left;
		self.updateElement($(this));
	});
};

Sticky.prototype.updateElement = function(win){
	var self = this,
		pos = win.scrollTop();

	this.trigger.btm = self.setTriggerBtm();

	if ( pos <= self.trigger.top ) { // above
		
		self.el.css({ position: 'static', left: '', top : '' }).removeClass(self.settings.cssClass);
		self.shim.css({display:'none'});

	} else if( pos >= self.trigger.top && pos <= self.trigger.btm ) { // sticky
		
		self.el.css({ position: 'fixed', left: self.original.left + 'px', top : '0px' }).addClass(self.settings.cssClass);
		self.shim.css({display:'block'});

	} else { // below
		
		self.el.css({ position: 'absolute', left: '0px', top : self.container.height() + self.settings.offset + 'px' }).removeClass(self.settings.cssClass);
		self.shim.css({display:'block'});

	}
};

Sticky.prototype.setTriggerTop = function(){
	return this.el.offset().top;
};

Sticky.prototype.setTriggerBtm = function(){
	return this.container.offset().top + this.container.height() + this.settings.offset;
};