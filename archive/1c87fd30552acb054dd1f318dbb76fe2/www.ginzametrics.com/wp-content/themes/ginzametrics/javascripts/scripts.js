// Ginzametrics Custom Javascripts File
// Developed by: digital-telepathy.com
// Contributors: Burkett


// Let the games begin
$(document).ready(function(){

  $('.animateToAnchor').click(
    function() {
      goToByScroll( $(this).attr('href') );
      return false;
    }
  );

  // Make MailChimp input box display what we want
  $('#mc_mv_EMAIL').attr('value', $('#email_text').attr('value'));

  // Get sidebars to play nice after all the social insertions
  setTimeout(expandSidebar, 1000);

	// Show and Hide Content on a Button Click -- Also, if user clicks off, re-hide content
	if($('.btn-show').length){
		$('.btn-show').click(function(e){
			var self = $(this);
			var dropdown = self.children('.btn-show-content');
			if(self.hasClass('open')){
				self.removeClass('open');
				dropdown.hide();
			}else{
				$('.btn-show-content').hide();
				$('.btn-show').removeClass('open');
				self.addClass('open');
				dropdown.show();
				e.stopPropagation();
			}
		})
		$('body').click(function(){
				if($('.btn-show').hasClass('open')){
					$('.btn-show').removeClass('open');
					$('.btn-show-content').hide();
				}
		});
		$('.btn-show-content').click(function(e){
			e.stopPropagation();
		});
	}
	
	// Show and Hide content on a hover -- animation included
	if($('.btn-hover').length){

		var config = {
			over: function(){
				$(this).children('.btn-hover-content').fadeIn(50).dequeue();
				$(this).children('.btn-hover-content').animate({'bottom': '160px'}, 100).dequeue();
				$(this).addClass('open');
			},
			timeout: 50,
			out: function(){
				$(this).children('.btn-hover-content').fadeOut(100).dequeue();
				$(this).children('.btn-hover-content').animate({'bottom': '130px'}, 100).dequeue();
				$(this).removeClass('open');
			}
		};

		$('.btn-hover').hoverIntent( config );
	}

	// Auto Size the Side bars
	if($('.sidebar.left').length){
		var contentHeight1 = $('.content').height();
		$('.sidebar.left').css('height', contentHeight1 + 3);
	}
	if($('.blog-sidebar').length){
		var contentHeight2 = $('.bcont').height();
		$('.blog-sidebar').css('height', contentHeight2 + 3);
	}

	// Nav Sub-Menu
	if($('.sub-menu').length){
		$('.sub-menu').prev('a').click(function(e){
			e.preventDefault();
			if(!$(this).hasClass('active')){
				$('.sidebar-menu .sub-menu').slideUp('75');
				$('.sidebar-menu a').removeClass('active');
				$(this).addClass('active');
				$(this).next('.sub-menu').slideDown('200');
			}else{
				$(this).next('.sub-menu').slideUp('75');
				$(this).removeClass('active');
			}
		});
	}


	// Remove Text From Fields
	if($('input[type="text"]').length){
		$('input[type="text"]').each(function(e){
			var textVal = $(this).val();
			$(this).click(function(){
				if(textVal == $(this).val()){
					$(this).val('');
					$(this).addClass('textAdded');
				}
			});
			$(this).focusout(function(){
				if($(this).val() == ''){
					$(this).val(textVal);
					$(this).removeClass('textAdded');
				}
			});

		});
	}

	if($('textarea').length){
		$('textarea').each(function(e){
			var textVal = $(this).html();
			$(this).click(function(){
				if(textVal == $(this).html()){
					$(this).html('');
					$(this).addClass('textAdded');
				}
			});
			$(this).focusout(function(){
				if($(this).html() == ''){
					$(this).html(textVal);
					$(this).removeClass('textAdded');
				}
			});

		});
	}
});

// Credit: improved version of http://djpate.com/2009/10/07/animated-scroll-to-anchorid-function-with-jquery/
function goToByScroll(id, speed){
  var bodyElem = ($.browser.safari || $.browser.chrome) ? $("body") : $("html,body,document");
  var animate_speed = (speed == null) ? 'slow' : speed;
  bodyElem.animate({scrollTop: $(id).offset().top}, animate_speed);
}

function expandSidebar() {
  var colHeight = $('#content-col').height();
  $('#sidebar').css('height', colHeight);
}