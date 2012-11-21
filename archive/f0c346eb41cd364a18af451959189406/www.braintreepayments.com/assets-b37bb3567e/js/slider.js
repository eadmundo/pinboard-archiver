Slider = function(a){
	this.nav = $(a.nav);
	this.viewport = $(a.viewport);
	this.container = $(a.container);
	this.panel = $(a.panel);
	this.next = $('.overview .next');
	this.activeClass = 'active';
	this.current = 0;

	this.init();
};

Slider.prototype.init = function(){
	var self = this;
	
	self.viewport.css({ height: self.panel.eq(self.current).outerHeight() });

	this.intro();
	this.events();
};

Slider.prototype.events = function(){
	var self = this;

	this.nav.each(function(i){
		$(this).click(function(e){ e.preventDefault();
			self.navTo(i);
			if (i == 0 || i == 1) {
				self.next.show();
			}
		});
	});

	this.next.click(function(e){ e.preventDefault();
		var next = (self.current + 1 < self.panel.length) ? self.current + 1 : 0 ;
		self.navTo(next);
		if(next == 2) {
			self.next.hide();
		} else {
			self.next.show();
		}
	});
};

Slider.prototype.intro = function(){
	var self = this,
		flash = 'flash';

	window.setTimeout(function(){
		self.nav.removeClass(self.activeClass).eq(0).addClass(flash);
		window.setTimeout(function(){
			self.nav.removeClass(self.activeClass).removeClass(flash);
			self.nav.eq(1).addClass(flash);
			window.setTimeout(function(){
				self.nav.removeClass(self.activeClass).removeClass(flash);
				self.nav.eq(2).addClass(flash);
				window.setTimeout(function(){
					self.nav.removeClass(self.activeClass).removeClass(flash);
					self.nav.eq(0).addClass(self.activeClass);
				},700);
			},700);
		},700);
	},700);	
}

Slider.prototype.setHeight = function(target){
	var self = this,
		height = self.panel.eq(target).outerHeight();

	self.viewport.animate({
		height: height
	}, 'slow');
};

Slider.prototype.toSliderTop = function(){
	$('html, body').animate({
		scrollTop: $('.page_developers .main_col .overview').offset().top + 'px'
	}, 'slow');
};

Slider.prototype.navTo = function(target){
	var self = this,
		offset = (self.panel.eq(target).offset().left - self.container.offset().left) * -1,
		next = (self.current + 1 < self.panel.length) ? self.current + 1 : 0 ;;

	// set height
	self.setHeight(target);

	// slide to
	this.container.stop(true,true).animate({
		left : offset
	}, 'slow');

	// clear nav active classes
	this.nav.removeClass(self.activeClass);

	// set nav active
	this.nav.eq(target).addClass(self.activeClass);

	// increment current
	this.current = target;

	// back to top of slider
	if ($(window).scrollTop() > $('.page_developers .main_col .overview').offset().top) {
		self.toSliderTop();	
	}

	if(next == 2) {
		self.next.hide();
	} else {
		self.next.show();
	}
};