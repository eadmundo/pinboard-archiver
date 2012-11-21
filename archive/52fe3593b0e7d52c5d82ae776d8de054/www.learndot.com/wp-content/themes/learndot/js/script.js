// JS by AwesomeJS

$(document).ready(function(){
  
	var ua = navigator.userAgent;
	var isiPad = /iPad/i.test(ua) || /iPhone OS 3_1_2/i.test(ua) || /iPhone OS 3_2_2/i.test(ua) || /iPhone/i.test(ua) ;
	var isiPhone = /iPhone/i.test(ua) ;

	// Placeholder labels
	$("p.labelify label, label.gfield_label").inFieldLabels();	

	// Custom select
	if(!isiPad){
		$("form select").select2({
			minimumResultsForSearch: 20
		});		
	}

	// Custom checkboxes
	$('.contactForm input[type=checkbox], .contactForm input[type=checkbox]').prettyCheckboxes({
		checkboxWidth: 27,
		checkboxHeight: 27
	});

	// Testimonial Slide
	$('#testimonial-slide').cycle({
		timeout: 4000,
		speed:300,
		fx: 'fade',
		slideResize: 0,
        fit:1,
        pause: 1,
		after: onAfter
	});

	/* Posts Slide */
	var activeSlide = 0;

	$('#blog-slider').cycle({
		timeout: 0,
		speed:300,
		fx: 'scrollHorz',
		slideResize: 1,
        fit:1,
        prev:'#prev-posts',
        next:'#next-posts',
        pager: '#nav-posts',
        after: function(curr, next, obj) {
	        activeSlide = obj.currSlide;
	    }
	});	

	$(window).resize(function(){
		$('#blog-slider').cycle('destroy');

	    $('#blog-slider').cycle({
	    	timeout: 0,
			speed:300,
			fx: 'scrollHorz',
			slideResize: 1,
	        fit:1,
	        prev:'#prev-posts',
	        next:'#next-posts',
	        pager: '#nav-posts',
		    after: function(curr, next, obj) {
		        activeSlide = obj.currSlide;
		    },
		    startingSlide: activeSlide
	    });			
	});

	function onAfter(curr, next, opts) {
	    var index = opts.currSlide + 1;
	    $('#testimonial-nav a.active').removeClass('active');
	    $('#testimonial-nav a[href="#'+index+'"]').addClass('active');
	}	

	// Featured work subNav
	$('#testimonial-nav a').click(function(e) {
		e.preventDefault();
		$('#testimonial-slide').cycle('pause'); 
		$('#testimonial-nav a.active').removeClass('active');
		$(this).addClass('active');
		var target = parseInt($(this).attr('href').slice(1));
		$('#testimonial-slide').cycle(target-1);
	});  

	// Testimonial Slider
	$('#testimonial-slider').cycle({
		timeout: 4000,
		speed:300,
		fx: 'fade',
		slideResize: 0,
        fit:1,
	});

	// Mobile Tooltips slider
	if(isiPhone){
        //initial fade-in time (in milliseconds)
        var initialFadeIn = 1000;

        //interval between items (in milliseconds)
        var itemInterval = 5000;

        //cross-fade time (in milliseconds)
        var fadeTime = 1000;

        // number of items
		var numberOfItems = $('.tablet-tooltips .tooltip').length;
 
        //set current item
        var currentItem = 0;

        $('.tablet-tooltips .tooltip').eq(currentItem).fadeIn(initialFadeIn);

        //loop through the items
        var infiniteLoop = setInterval(function(){
            $('.tablet-tooltips .tooltip').eq(currentItem).fadeOut(fadeTime);

            if(currentItem == numberOfItems -1){
                currentItem = 0;
            }else{
                currentItem++;
            }
            $('.tablet-tooltips .tooltip').eq(currentItem).fadeIn(fadeTime);

        }, itemInterval);

	}

	// Validate contact form
	$('.contactForm').validate({
	    onfocusout: function(element) { $(element).valid(); },
	    onkeyup: false,
	    onclick: true,/*
		rules: {
	         'fullname': { required: true },
	         'title': { required: true },
	         'email': { required: true, email:true },
	         'website': { required: true },
	         'phone' : { required: true },
	         'learners' : { required: true}
	    },*/
		errorPlacement: function(error, element) { 
			if ( element.is(':radio') || element.is(':checkbox') || element.is('select') ) {
				error.insertAfter( element.next() );
			} else { 
				error.insertAfter( element );
			}
		}
	});

	// Validate newsletter form
	$('#suscribeForm').validate({
	    onfocusout: function(element) { $(element).valid(); },
	    onkeyup: false,
	    onclick: true,
		rules: {
	         'email': { required: true, email:true }
	    },
		errorPlacement: function(error, element) { 
			if ( element.is(':radio') || element.is(':checkbox') || element.is('select') ) {
				error.insertAfter( element.next() );
			} else { 
				error.insertAfter( element );
			}
		}
	});	

	// Blog articles hover effect
	$('.articles li a').hover(
		function(){
			$(this).find('.color').stop(true,true).animate({opacity:1});
		},
		function(){
			$(this).find('.color').stop(true,true).animate({opacity:0});
		}
	);

	// Focus when others its clicked
	$('#other').click(function(){
		$('#other-learn').focus();
	});

	// Scroll to (smooth)
	function goToByScroll(id){
	    $('html,body').animate({scrollTop: $(id).offset().top},1500, 'easeOutBack');
	}

	$('.slideTo').click(function(e){
		e.preventDefault();
		goToByScroll($(this).attr('href'));
	});

	// Modal box referral
	if ((document.referrer.match("matygo") && !document.referrer.match("www.learndot.com")) || window.location.href.match("rebrand")){
		showAnnouncementPopup();	
	} 


	function showAnnouncementPopup(){
		$('#myModal').modal('show');
	}

	// Refresh infieldlabels and prettycheckboxes on Gravity Forms

	$(document).bind('gform_page_loaded', function(event, form_id, current_page){
		// Custom checkboxes
		$('.contactForm input[type=checkbox]').prettyCheckboxes({
			checkboxWidth: 27,
			checkboxHeight: 27
		});

		// Placeholder labels
		$("label.gfield_label").inFieldLabels();		
	});		

	// Show the second form
	$('#showForm2').live('click', function(e){
		e.preventDefault();
		$('.form-step-1').fadeOut('slow', function(){
			$('.form-step-2').fadeIn('slow');
		});
	});

	$('#hideForm').live('click', function(e){
		e.preventDefault();
		$('.form-step-1').fadeOut('slow', function(){
			$('.form-step-3').fadeIn('slow');
		});
	});

	// Runabout
    $('#mycarousel').roundabout({
    	responsive: true
    });

    $(window).resize(function(){
    	console.log('resizing');
    	//$('#mycarousel').roundabout("relayoutChildren");
    })

});
