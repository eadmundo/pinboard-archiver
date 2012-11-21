Developers = function(){
	this.githubData = '';
	this.githubBtn  = $('#bt_github');
	this.githubOrgList = $('#bt_pub_repos');

	this.init();
};

Developers.prototype.init = function(){
	this.modals({
		selector : 'a[data-modal]'
	});
	this.github();
};

Developers.prototype.modals = function(a){
	var self = this,
		link = $(a.selector),
		overlay = $('#modal_overlay'),
		close = $('.modal .close'),
		modal;

	link.click(function(e){ e.preventDefault();
		var target = $(this).attr('data-modal');
			
		modal = $('.modal#' + target );
		
		overlay.fadeIn('fast',function(){
			modal.fadeIn('fast');
		});
	});

	close.click(function(e){ e.preventDefault();
		modal.fadeOut('fast',function(){
			overlay.fadeOut('fast');
		});
	});

	overlay.click(function(){
		modal.fadeOut('fast',function(){
			overlay.fadeOut('fast');
		});
	});

	$(document).keyup(function(e) {
		if (e.keyCode == 27) { // esc
			modal.fadeOut('fast',function(){
				overlay.fadeOut('fast');
			});
		}
	});	
}

Developers.prototype.github = function(){
	var self = this,
		orgList = $('');

	$.ajax({
		url : 'https://api.github.com/orgs/braintree',
		context : document.body,
		dataType : 'jsonp',
		type : 'get',
		success : function(result){
			self.githubData = result;
			self.setRepoCount(result.data.public_repos);
		},
		error : function(error){
		}
	});

	this.githubBtn.click(function(e){ e.preventDefault();
		if(self.githubOrgList.hasClass('loading')){
			$.ajax({
				url : 'https://api.github.com/orgs/braintree/repos',
				data : {type:'public',sort:'updated'},
				context : document.body,
				dataType : 'jsonp',
				type : 'post',
				success : function(result){
					self.githubOrgList.removeClass('loading').html('');
					self.setRepoList(result.data);
				},
				error : function(error){
				}
			});
		}
	});
};

Developers.prototype.setRepoCount = function(count){
	var content = this.githubBtn.find('small'),
		text = content.text(),
		message = count + ' ' + text;

	content.text(message);
};

Developers.prototype.setRepoList = function(data){
	var self = this;

	$.each(data, function(i,e){
		self.githubOrgList.append('<li><a href="' + e.html_url + '">' + e.name.toString().replace('_',' ') + '</a> ( ' + e.language + ' ) </li>');
	});	
};
