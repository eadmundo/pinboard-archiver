// see: http://bugs.jquery.com/ticket/8346
jQuery.cssHooks["MsTransform"] = {
	set: function( elem, value ) {
		elem.style.msTransform = value;
	}
};

jQuery.extend({
	// find a random number between 0 and int
	random: function(X) {
		return Math.floor(X * (Math.random() % 1));
	},
	// find a random number between minValue and maxValue
	randomBetween: function(MinV, MaxV) {
		return MinV + jQuery.random(MaxV - MinV + 1);
	},
	// random background-image position
	randomBackgroundPosition: function() {
		var top = ['top', 'center', 'bottom'],
			left = ['left', 'center', 'right'];
		return left[jQuery.random(3)] + ' ' + top[jQuery.random(3)];
	},
	// rotate filter for IE
	ieRotateFilter: function(deg) {
		deg = (deg < 0) ? 360 + deg : deg;
		var deg2radians = Math.PI * 2 / 360,
			nAngle = deg * deg2radians,
			nCos = Math.cos(nAngle).toFixed(3),
			nSin = Math.sin(nAngle).toFixed(3);
		
		return "progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand', M11=" + nCos + ", M12=" + (-nSin) + ", M21=" + nSin + ", M22=" + nCos + ")";
	}
});

function init() {
	var $ = jQuery.noConflict(),
		zIndex = 1000,
		imagesCount = $('.polaroid-gallery a.polaroid-gallery-item').size(),
		imageStr = (typeof(polaroid_gallery) !== 'undefined' ) ? polaroid_gallery.text2image : 'Image',
		thumbsOption = (typeof(polaroid_gallery) !== 'undefined' ) ? polaroid_gallery.thumbnail : 'none',
		imagesOption = (typeof(polaroid_gallery) !== 'undefined' ) ? polaroid_gallery.image : 'title3',
		scratches = (typeof(polaroid_gallery) !== 'undefined' ) ? polaroid_gallery.scratches : 'yes';
	
	$(".polaroid-gallery a.polaroid-gallery-item").each(function(currentIndex) {
		zIndex++;
		var width = $(this).width(),
			text = jQuery.trim($("span", this).attr('title')),
			randNum = $.randomBetween(-12, 12),
			randDeg = 'rotate(' + randNum + 'deg)',
			randPos = $.randomBackgroundPosition(),
			ieFilter = $.ieRotateFilter(randNum);
		
		switch (thumbsOption) {
			case 'none':
				text = '';
				break;
			case 'image1':
				text = imageStr +'&nbsp; '+ (currentIndex + 1);
				break;
			case 'image2':
				text = imageStr +'&nbsp; '+ (currentIndex + 1) +' / '+ imagesCount;
				break;
			case 'number1':
				text = (currentIndex + 1);
				break;
			case 'number2':
				text = (currentIndex + 1) +' / '+ imagesCount;
				break;
		}
		
		if(text === '') {
			text = '&nbsp;';
		}
		
		var cssObj = {
			'z-index' : zIndex,
			'-webkit-transform' : randDeg,
			'-moz-transform' :  randDeg,
			'-ms-transform' : randDeg,
			'-o-transform' : randDeg,
			'transform' : randDeg
		};
		var cssHoverObj = {
			'z-index' : '1998',
			'-webkit-transform' : 'scale(1.15)',
			'-moz-transform' :  'scale(1.15)',
			'-ms-transform' : 'scale(1.15)',
			'-o-transform' : 'scale(1.15)',
			'transform' : 'scale(1.15)'
		};
		var cssIeObj = {
			'filter' : ieFilter,
			'-ms-filter' : '"'+ ieFilter +'"'
		};
		
		if ($.browser.msie && parseInt($.browser.version, 10) < 9) {
			$("span", this).after('<span class="polaroid-gallery-text">'+text+'</span>');
			$("span.polaroid-gallery-text", this).width(width);
			$(this).css(cssIeObj);
		} else {
			$("span", this).after('<span class="polaroid-gallery-text">'+text+'</span>');
			$("span.polaroid-gallery-text", this).width(width);
			if(scratches === 'yes') {
				$("span.polaroid-gallery-text", this).after('<span class="polaroid-gallery-scratches" style="background-position: '+randPos+';"></span>');
			}
		}
		
		$(this).css(cssObj);
		$(this).hover(function () {
			$(this).css(cssHoverObj);
		}, function () {
			$(this).css(cssObj);
		});			
	});
	
	$(".polaroid-gallery").css('visibility', 'visible');
	
	$(".polaroid-gallery a.polaroid-gallery-item").fancybox({
		'padding'			: 20,
		'margin'			: 40,
		'transitionIn'		: 'elastic',
		'transitionOut'		: 'elastic',
		'titlePosition'		: 'inside',
		'titleFormat'		: function(title, currentArray, currentIndex, currentOpts) {
			var text = '';
			switch (imagesOption) {
				case 'title1':
					text = title;
					break;
				case 'title2':
					text = (currentIndex + 1) + ' &nbsp; ' + title;
					break;
				case 'title3':
					text = (currentIndex + 1) + ' / ' + currentArray.length + ' &nbsp; ' + title;
					break;
				case 'title4':
					text = imageStr + ' ' + (currentIndex + 1) + ' &nbsp; ' + title;
					break;
				case 'title5':
					text = imageStr + ' ' + (currentIndex + 1) + ' / ' + currentArray.length + ' &nbsp; ' + title;
					break;
				case 'image1':
					text = imageStr + ' ' + (currentIndex + 1);
					break;
				case 'image2':
					text = imageStr + ' ' + (currentIndex + 1) + ' / ' + currentArray.length;
					break;
				case 'number1':
					text = (currentIndex + 1);
					break;
				case 'number2':
					text = (currentIndex + 1) + ' / ' + currentArray.length;
					break;
			}
			if(jQuery.trim(text) === '') {
				text = '&nbsp;';
			}
			return '<span id="fancybox-title-over">' + text + '</span>';
		}
	});
	
}

// For Safari due to Safari is unable to get width and height of image/element
if(jQuery.browser.webkit) {
	jQuery(window).load(function() {
		init();
	});
} else {
	jQuery(document).ready(function() {
		init();
	});
}
