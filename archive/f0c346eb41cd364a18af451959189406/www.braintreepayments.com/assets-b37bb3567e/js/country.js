Country = function(){
  // elements
  this.panel = $('#country_list');
  this.panelHeight = this.panel.find('.inner').outerHeight();
  this.toggle = $('#current_country');
  this.close = this.panel.find('.close');
  this.countries = this.panel.find('li a');
  this.selectForm = $('#loc_form');
  this.select = $('#loc');

  

  // data
  this.open = false;
  this.interval = '';
  this.openClass = 'open';
  this.setting = '';

  this.init();
};

Country.prototype.init = function(){
  this.get();
  this.events();
};

Country.prototype.events = function(){
  var self = this;

  // toggles
  self.toggle.click(function(e){ e.preventDefault();
    self.togglePanel();
  });
  self.close.click(function(e){ e.preventDefault(); 
    self.togglePanel();
  });
  $(document).keyup(function(e){
    if ( self.open && e.keyCode == 27 ) { self.togglePanel(); }
  });
  $('#container').click(function(e){
    if ( self.open ) {
      self.togglePanel();
    }
  });

  // countries
  self.countries.click(function(e){ e.preventDefault();
    var el = $(this);
    self.set(el);
  });
};

Country.prototype.set = function(el){
  var self = this,
      value = el.data('value');

  self.select.val(value); // update input
  self.toggle.removeClass(self.setting).addClass(value).data('value',value); // update toggle
  self.setting = value; // update object setting
  self.togglePanel();
  self.selectForm.submit();
};

Country.prototype.get = function(){
  var self = this;

  self.setting = self.select.find(":selected").attr("class");

  self.toggle.addClass(self.setting);
};

Country.prototype.togglePanel = function(){
  var self = this;

  if ( self.open ) {
    self.open = false;
    self.closePanel();
    self.toggle.removeClass(self.openClass);
  } else {
    self.open = true;
    self.openPanel();
    self.toggle.addClass(self.openClass);
  }
};

Country.prototype.openPanel = function(){
  var self = this;

  self.stickScroll(true);

  this.panel.animate({
    height: self.panelHeight + 'px'
  },'fast',function(){
    self.stickScroll(false);
  });
};

Country.prototype.closePanel = function(){
  var self = this;

  this.panel.animate({
    height: 0 + 'px'
  },'fast');
};

Country.prototype.stickScroll = function(start){
  var self = this,
      rate = 10;

  if ( start ) {
    self.interval = window.setInterval(function(){
      $('html, body').animate({
        scrollTop: self.panel.offset().top
     }, rate);
    },rate);
  } else {
    window.clearInterval(self.interval);
  }
};

$(function(){
  var country = new Country();
});
