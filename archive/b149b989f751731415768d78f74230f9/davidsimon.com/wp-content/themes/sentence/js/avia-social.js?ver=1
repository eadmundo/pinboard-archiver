(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/all.js#xfbml=1";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));


jQuery(document).ready(function(){
	
	//activate avia retweet link
	if(jQuery.fn.avia_twitter_link)
	jQuery(".avia_retweet_link").avia_twitter_link();
	
	//activate avia facebook link
	if(jQuery.fn.avia_facebook_link)
	jQuery(".avia_facebook_likes").avia_facebook_link();
	

});

/************************************************************************
Retweet and FACEBOOK links
*************************************************************************/
(function($)
{
	$.fn.avia_facebook_link = function(options) 
	{	
		var win = $(window);

	    function avia_fb_click(modifier, widget) 
	    {
	    	var container 	= $(widget.dom.parentElement).parents('.like-count:eq(0)').addClass('avia_interacted_button'),
	    		current 	= container.find('.avia_count'),
	       		cur_count	= parseInt(current.text(),10);
	       		
	       		if(modifier > 0)
	       		{
	       			container.addClass('avia_like_active');
	       		}
	       		else
	       		{
	       			container.removeClass('avia_like_active');
	       		}
	       		
	       		current.text(cur_count+modifier);
	    }
	    
	    function avia_fb_click_add(href, widget){avia_fb_click( 1, widget);}
	    function avia_fb_click_rem(href, widget){avia_fb_click(-1, widget);}
		
		try{
			FB.Event.subscribe('edge.create', avia_fb_click_add );
			FB.Event.subscribe('edge.remove', avia_fb_click_rem );
		}catch(err){}
		
		return this.each(function()
		{	
			var link 		= $(this),
				container 	= link.parents('.like-count:eq(0)'),
				fb_container= container.find('.avia-facebook-like');
				
			link.bind('click', function()
			{				
				if(fb_container.css('opacity') > 0)
				{
					return false;
				}
			});
			
			
		});
	};
})(jQuery);	

(function($)
{
	$.fn.avia_twitter_link = function(options) 
	{	
		var win = $(window);
		
		return this.each(function()
		{	
			var links = $(this).attr('target','_blank'),
				popup_dimesion = {
					width: 	500,
					height: 280
				},
				popup_pos = 
				{
					left:	(screen.width/2)-(popup_dimesion.width/2),
					top:	(screen.height/2)-(popup_dimesion.height/2)
				};

			function recalc(event)
			{
				var link 		= $(event.data.element),
					current 	= link.find('.avia_count'),
					cur_count	= parseInt(current.text(),10),
					id 			= link.data('post_id');
				
				$.ajax({
					url: link.data('json'),
					dataType: 'jsonp',
					success: function(json)
					{
					
						if(json && typeof json.count == 'number' && cur_count < json.count)
						{
							link.addClass('avia_like_active');
							current.text(json.count);
							$.ajax({
							url: avia_framework_globals.ajaxurl,
							type: "POST",
							data: "action=avia_ajax_update_social_count&post_id="+id+"&av_nonce="+avia_social_count_nonce.nonce+"&new_count="+parseInt(json.count,10)+"&network=twitter"
							});
						}
					}
				});
				
				win.unbind('focus.avia_twitter_link');
			}	
				
			links.bind('click', function()
			{	
				var popUp = window.open(links.attr('href'), 'tweet_this', 'width='+popup_dimesion.width+', height='+popup_dimesion.height+', left='+popup_pos.left+', top='+popup_pos.top+', scrollbars, resizable');
				
				win.bind('focus.avia_twitter_link', {element: this}, recalc);
				
				//only if popup really opens cancel the click event, otherwise just open url in new window ;)
				if (popUp != null && typeof(popUp) !='undefined') 
				{
					popUp.focus();
					return false;
				}
			});
			
			
		});
	};
})(jQuery);	