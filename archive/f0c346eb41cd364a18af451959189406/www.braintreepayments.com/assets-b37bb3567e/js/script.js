/* Author: Mark Johnson

*/
$(document).ready(function() {

/* cross-browser placeholder -------------------------------------------------------------------------------- */

    if (!Modernizr.input.placeholder) {
        $('[placeholder]').focus(function() {
            var input = $(this);
            if (input.val() == input.attr('placeholder')) {
                input.val('');
                input.removeClass('placeholder');
            }
        }).blur(function() {
            var input = $(this);
            if (input.val() === '' || input.val() == input.attr('placeholder')) {
                input.addClass('placeholder');
                input.val(input.attr('placeholder'));
            }
        }).blur();
        $('[placeholder]').parents('form').submit(function() {
            $(this).find('[placeholder]').each(function() {
                var input = $(this);
                if (input.val() == input.attr('placeholder')) {
                    input.val('');
                }
            });
        });
    }

//braintree instant form errors
    var error_test_message, hide_old_info, hide_this_info, show_info;




    $.fn.hide_this_info = function() {
      var $this_input_wrapper;
        $this_input_wrapper = $(this).parents('div.info_wrapper_parent');
        $('span.info', $this_input_wrapper).fadeTo('fast', 1, function() {
          return $this_input_wrapper.removeClass('active');
        });
        return $('div.info', $this_input_wrapper).fadeOut('fast');
    };
    $.fn.show_info = function() {
      var $input_wrapper;
      $input_wrapper = $(this).parents('.info_wrapper_parent');
      if ($input_wrapper.hasClass('active')) return false;
      $input_wrapper.addClass('active');
      $('span.info', $input_wrapper).fadeTo('fast', 1);
      return $('div.info', $input_wrapper).fadeIn('fast');
    };


    hide_old_info = function() {
      return $(this).hide_old_info();
    };
    hide_this_info = function() {
      return $(this).hide_this_info();
    };
    show_info = function() {
      return $(this).show_info();
    };
    $('span.info').hoverIntent({
      over: show_info,
      timeout: 200,
      out: function() {}
    });
    $('div.info_wrapper').hoverIntent({
      over: function() {},
      timeout: 200,
      out: hide_this_info
    });
    $.fn.show_current_error = function() {
      var $this;
      $this = $(this);
      if ($this.is(':focus')) return false;
      $('div.error_wrapper').fadeOut('fast');
      return $this.parents('div.input_wrapper').find('div.error_wrapper').fadeIn('fast');
    };
    $.fn.hide_prev_error = function() {
      return $(this).parents('div.input_wrapper').find('div.error_wrapper').fadeOut('fast');
    };
    $(':input').focus(function() {
      var $this;
      $this = $(this);
      $this.show_info();
      if ($this.parents('div.input_wrapper').hasClass('hover')) return false;
      return $this.show_current_error();
    }).mouseout(function() {
      var $this;
      $this = $(this);
      $this.hide_this_info();
      $this.hide_prev_error();
      return $this.parents('div.input_wrapper').removeClass('active');
    });
    $('div.input_wrapper').hoverIntent({
      over: function() {
        var $this;
        $this = $(this);
        $this.addClass('hover');
        if ($('.field_with_errors', $this).length > 0) {
          return $this.find(':input').show_current_error();
        }
      },
      timeout: 200,
      out: function() {
        var $this;
        $this = $(this);
        $this.removeClass('hover');
        if ($(this).hasClass('active') || $this.find(':input:focus').length > 0) {
          return false;
        }
        $this.find('div.error_wrapper').fadeOut('fast');
        $(this).hide_prev_error();
        return $(':input:focus').parents('div.input_wrapper').find('div.error_wrapper').fadeIn('fast');
      }
    });
    if ($('.field_with_errors').length > 0) {
      $('.field_with_errors:eq(1)').find(':input').focus();
    }
    if (window.location.hash !== '') $(window.location.hash).focus();


    var bt_toggleLinks = $('a.toggle_content');

    bt_toggleLinks.click(function(){
        $this = $(this);
        var $elem_id = $($this.attr('rel'));

        if ( $this.hasClass('collapsed') ) {
            $this.removeClass('collapsed');
            $elem_id.slideDown();
        } else {
            $this.addClass('collapsed');
            $elem_id.slideUp();
        }
        return false;
    });


    // flexslider
    $('.flexslider').flexslider({
        animation: 'slide',
        slideshow: false,
        controlNav: false,
        controlsContainer: ".flexslider_wrapper"
    });

    // modal with text
	$('a.modal_link').click(function (e) {
    var modal_id = $(this).attr('rel');
		$("#" + modal_id).modal();
		return false;
	});
	
	  // modal with video
	$('a.modal_link').fancybox();

	$('a.iframe_video_link').fancybox({
        'width': 960,
        'height': 540,
        'type': 'iframe'
  });

	$('a.image_thumb').fancybox();

    // Lavalamp menu
    $main_nav_active = $('ul.main_navigation > li.active');
    $main_nav = $('ul.main_navigation');
    if($main_nav_active.length > 0) {
        var lava_index = $main_nav_active.index();
        $main_nav.lavaLamp({startItem: lava_index}).addClass('active');
    }
    else {
        $main_nav.lavaLamp().hover(function(){
            $(this).toggleClass('active');
        });
    }
    $page_leader_nav_active = $('ul.page_leader_nav > li.active');
    $page_leader_nav = $('ul.page_leader_nav');
    if($page_leader_nav_active.length > 0) {
        var lava_index = $page_leader_nav_active.index();
        $page_leader_nav.lavaLamp({startItem: lava_index}).addClass('active');
    }
    else {
        $page_leader_nav.lavaLamp().hover(function(){
            $(this).toggleClass('active');
        });
    }

		//smooth scroll
		$(document).ready(function(){
		  $("#submenu ul li ul li ul li a").click(function(event){
		    event.preventDefault();
		    var offset = $($(this).attr('href')).offset().top;
		    $('html, body').animate({scrollTop:offset}, 500);
		  });
		});
		
		//sticky element on scroll
		if ($('#to-top').length>0) {
			setSticky($('#to-top'));
			$('#to-top').click(function(event){
				event.preventDefault();
				$('html, body').animate({scrollTop:0}, 500);
			});
		}
		
		function setSticky($el) {
			position = $el.offset().top;
			
			$(window).scroll(function(e){ 
		    if ($(this).scrollTop() > position && $el.css('position') != 'fixed'){ 
		      $el.addClass('fixed');
		    } else if ($(this).scrollTop() < position) {
		      $el.removeClass('fixed');
		    }
			});
		}

  // Header contact phone
  function bt_contact(a){
    this.args = a;
    this.btn = $(a.selector);
    this.init();
  }

  bt_contact.prototype.init = function(){
    var self = this;

    self.btn.click(function(e){
      var el = $(this);

      if(el.hasClass(self.args.css)){
        el.removeClass(self.args.css);
      } else {
        el.addClass(self.args.css);
      }
      
    });
  }
    
  var BT_contact = new bt_contact({
    selector : '.navigation_wrapper .contact .p a',
    css : 'a'
  });

  // Home client quotes
  function bt_quotes(a){
    this.args = a;
    this.btns = $(a.btns);
    this.quotes = $(a.quotes);
    this.active = 'q_tts';
    this.pointer = $('#c_pointer');

    this.interval = '';

    this.init();
  }

  Array.prototype.clean = function(deleteValue) {
    for (var i = 0; i < this.length; i++) {
      if (this[i] == deleteValue) {         
        this.splice(i, 1);
        i--;
      }
    }
    return this;
  };

  bt_quotes.prototype.init = function(){
    var self = this;

    self.cycle(8500);
    
    self.btns.click(function(e){ e.preventDefault() });
    
    self.btns.mouseenter(function(e){ e.preventDefault();
      var el = $(this);

      // clear cycle
      clearInterval(self.interval);

      self.navTo(el);
    });
  };

  bt_quotes.prototype.navTo = function(btn){
      var self = this,
          target = btn.attr('href').split('#')[1],
          offset = btn.offset().left - $('.clients .in').offset().left + ((btn.width() / 2) - self.pointer.width() / 2 );
      
      if (target.length > 0) {
        // nav pointer
        self.pointer.stop(true,true).animate({left: offset + 'px'},300);

        // nav active
        self.btns.removeClass('a');
        btn.addClass('a');

        // move active out
        $('#' + self.active).stop(true,true).animate({top:'-100px'});

        // move new in
        $('#' + target).css({top:'180px'}).stop(true,true).animate({top:30+'px'});

        self.active = target;
      }
  };

  bt_quotes.prototype.cycle = function(time){
    var self = this,
        current = 0,
        collection = [];

    self.btns.each(function(i,e){
      var target = $(e).attr('href').split('#')[1];
      collection.push(target);
    });

    collection = collection.clean("").clean(undefined);

    self.interval = window.setInterval(function(){
      if(current < collection.length - 1){
        current++;
      } else {
        current = 0;
      }
      self.navTo($(self.btns[current]));
    },time);
  };

  if($('body.home').length > 0){
    var BT_quotes = new bt_quotes({
      btns : 'body.home .clients ul li.q a',
      quotes : 'body.home .quote blockquote'
    });
  }

  $selectedContactForm = $("[href="+$(location).attr('hash')+"]");
  if ($selectedContactForm.length > 0) {
    $selectedContactForm.click();
  }});
