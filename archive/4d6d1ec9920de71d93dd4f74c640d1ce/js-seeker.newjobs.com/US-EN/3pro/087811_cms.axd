// Attaches event handlers.
	TwoTierCheckBoxList.prototype.attachEvents = function() {
		if ( !this.disabled ) {
//		    var checkBoxes = document.forms[this.formID].elements[this.name + "_values"];
                                              var name = this.name + '_values';
		    var checkBoxes = $('#' + this.name + '\\:Div input[name=' + name + ']').get();
			var k = 0;
			var checkBox;

			var onClick = function() {
				var checkBoxList = window[ this.checkBoxListName ];
				checkBoxList.selection = null;
				checkBoxList.value = null;
				if ( checkBoxList.validate() ) checkBoxList.onChange( this.getItem() );
				else this.checked = false;
			}

			if ( this.folderToRender != null ) {
				var getItem = function() { return window[ this.checkBoxListName ].folderToRender.items[ this.itemIndex ]; }

				for ( var j = 0; j < this.folderToRender.items.length; j++ ) {
					checkBox = ( checkBoxes.length != null ) ? checkBoxes[ k++ ] : checkBoxes;
					this.folderToRender.items[ j ].checkBox = checkBox;
					checkBox.itemIndex = j;
					checkBox.checkBoxListName = this.name
					checkBox.getItem = getItem;
					checkBox.onclick = onClick;
				}
			}

			else {
				var getItem1 = function() { return window[ this.checkBoxListName ].folders[ this.folderIndex ].items[ this.itemIndex ]; }
				var getItem2 = function() { return window[ this.checkBoxListName ].items[ this.itemIndex ]; }

				if ( this.renderItemsFirst ) {
					for ( var j = 0; j < this.items.length; j++ ) {
						checkBox = ( checkBoxes.length != null ) ? checkBoxes[ k++ ] : checkBoxes;
						this.items[ j ].checkBox = checkBox;
						checkBox.itemIndex = j;
						checkBox.checkBoxListName = this.name
						checkBox.getItem = getItem2;
						checkBox.onclick = onClick;
					}
				}

				for ( var i = 0; i < this.folders.length; i++ ) {
					var folder = this.folders[ i ];

					for ( var j = 0; j < folder.items.length; j++ ) {
						checkBox = ( checkBoxes.length != null ) ? checkBoxes[ k++ ] : checkBoxes;
						folder.items[ j ].checkBox = checkBox;
						checkBox.folderIndex = i;
						checkBox.itemIndex = j;
						checkBox.checkBoxListName = this.name
						checkBox.getItem = getItem1;
						checkBox.onclick = onClick;
					}
				}

				if ( !this.renderItemsFirst ) {
					for ( var j = 0; j < this.items.length; j++ ) {
						checkBox = ( checkBoxes.length != null ) ? checkBoxes[ k++ ] : checkBoxes;
						this.items[ j ].checkBox = checkBox;
						checkBox.itemIndex = j;
						checkBox.checkBoxListName = this.name
						checkBox.getItem = getItem2;
						checkBox.onclick = onClick;
					}
				}
			}
		}
	}

var JSFieldManager = {

    jsFields: new Array(),

    addJSField: function (isAdvancedOption, hasUserInputHandler, clearHandler) {
        JSFieldManager.jsFields[JSFieldManager.jsFields.length] = new JSField(isAdvancedOption, hasUserInputHandler, clearHandler)
    },

    hasAdvancedOptions: function () {
        for (var i = 0; i < JSFieldManager.jsFields.length; i++) {
            var jsField = JSFieldManager.jsFields[i];

            if (jsField.isAdvancedOption && jsField.hasUserInput())
                return true;
        }

        return false;
    },

    clear: function () {
        for (var i = 0; i < JSFieldManager.jsFields.length; i++) {

            JSFieldManager.jsFields[i].clear();
        }
    }
}

function JSField(isAdvancedOption, hasUserInputHandler, clearHandler) {
    this.isAdvancedOption = isAdvancedOption;
    this.hasUserInput = hasUserInputHandler;
    this.clear = clearHandler;
}

function PromptingTextBox(elemId) {

    this.elem = $('#' + elemId)[0];
    this.prompt = this.elem.title;

    this.ClearPrompt = function () {
        if (this.elem.value == this.prompt) { this.elem.value = ''; }
    }

    this.ResetPrompt = function () {
        if (this.elem.value.length == 0) { this.elem.value = this.prompt; }
    }

    this.Clear = function () {
        this.elem.value = this.prompt;
    }

    this.HasValue = function () {
        return (this.elem.value.length > 0 && this.elem.value != this.prompt);
    }
    
    $(this.elem).parents("form").bind('submit', { "textBox": this }, function (event) {
        event.data.textBox.ClearPrompt();
    });

    $(this.elem).bind('focus', { "textBox": this }, function (event) {
        event.data.textBox.ClearPrompt();
    });

    $(this.elem).bind('blur', { "textBox": this }, function (event) {
        event.data.textBox.ResetPrompt();
    });
    
}

function SearchBox () {

    this.jLnkMoreJSOptions = $("#jsMoreOpt");
    this.jLnkLessJSOptions = $("#jsFewerOpt");
    this.jLnkAdvancedJSOptions = $("#jsAdvEntered");
    this.jDivAdvancedJSOptions = $("#js_adv_content");

    $(document).ready(function (callerObject) {
        return function () {
            if (!callerObject.jDivAdvancedJSOptions.is(':visible')) {
                if (JSFieldManager.hasAdvancedOptions()) {
                    callerObject.jLnkMoreJSOptions.hide();
                    callerObject.jLnkAdvancedJSOptions.show();
                }
            }
        }

    } (this));

    this.jLnkMoreJSOptions.click(function (callerObject) {
        return function () {
            callerObject.switchOptions($(this), callerObject.jLnkLessJSOptions);
        }
    } (this));

    this.jLnkAdvancedJSOptions.click(function (callerObject) {
        return function () {
            callerObject.switchOptions($(this), callerObject.jLnkLessJSOptions);
        }
    } (this));

    this.jLnkLessJSOptions.click(function (callerObject) {
        return function () {
            var jNextActiveJSLink = null;
            if (JSFieldManager.hasAdvancedOptions()) {
                jNextActiveJSLink = callerObject.jLnkAdvancedJSOptions;
            }
            else {
                jNextActiveJSLink = callerObject.jLnkMoreJSOptions;
            }

            callerObject.switchOptions($(this), jNextActiveJSLink);
        }
    } (this));

    this.switchOptions = function (jSourceLink, jNextActiveLink) {
        jSourceLink.hide();
        jNextActiveLink.show();

        this.jDivAdvancedJSOptions.toggle();
    }

    this.clear = function () {

        JSFieldManager.clear();

        if (!this.jDivAdvancedJSOptions.is(':visible')) {
            if (JSFieldManager.hasAdvancedOptions()) {
                this.jLnkMoreJSOptions.hide();
                this.jLnkAdvancedJSOptions.show();
            }
            else {
                this.jLnkMoreJSOptions.show();
                this.jLnkAdvancedJSOptions.hide();
            }
        }
    }
}

