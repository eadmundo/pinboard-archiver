req = null;
function getCommenterName() {
	cValue = "";
	dc = document.cookie;
	cookies = dc.split(";");
	for (x=0;x<cookies.length;x++) {
		if (cookies[x].match(/commenter_name=/)) {
		cValue = cookies[x].replace(/commenter_name=/, "");
		}
	}
	if (cValue.length>1) {
		return unescape(cValue);
	} else {
		return "";
	}
}

function trimString (str) {
  str = this != window? this : str;
  return str.replace(/^\s+/g, '').replace(/\s+$/g, '');
}

function getSelectedState(st) {
	opts = document.getElementById("statesel").options;
	for (i=0;i<opts.length;i++) {
		if (opts[i].value == st) {
			document.getElementById("statesel").selectedIndex=i;
		}
	}
}

loginWhere = "";


function formCheck(e) {
	form = document.getElementById('profile_signup');
	isEmpty = false;
	elems = form.elements;
	for (x=0;x<elems.length;x++) {
		elem = elems[x];
		if (elem.name != "zip" && elem.name != "terms_accept") {
			if (elem.value == "") {
				elem.style.border = "2px solid red";
				isEmpty = true;
			} else {
				elem.style.border = "";
			}
		} else if (elem.name == "terms_accept") {
			if (!elem.checked) {
				elem.style.backgroundColor = "red";
				isEmpty = true;
			} else {
				elem.style.border = "";
			}
		}
	}
	if (isEmpty) {
		alert("You must fill out all highlighted fields and read and accept the terms of use before submitting.");
		if (e && e.preventDefault) e.preventDefault(); // DOM style
	}
	return !isEmpty;
}

function formListener() {
	form = document.getElementById('profile_signup');
	if (window.attachEvent) {
		form.attachEvent('onsubmit', function(){return formCheck();});
	} else {
		form.addEventListener('submit', formCheck, true);
	}
}

function talkCount(txt) {
	if (txt.value.length>64) txt.value = txt.value.substring(0,64);
	document.getElementById('numLeft').innerHTML = (64-txt.value.length) + " characters left";
}



// Copyright (c) 1996-1997 Athenia Associates.
// http://www.webreference.com/js/
// License is granted if and only if this entire
// copyright notice is included. By Tomer Shiran.

function setCookie (name, value, expires, path, domain, secure) {
    var curCookie = name + "=" + escape(value) + (expires ? "; expires=" + expires : "") +
        (path ? "; path=" + path : "") + (domain ? "; domain=" + domain : "") + (secure ? "secure" : "");
    document.cookie = curCookie;
}

function getCookie (name) {
    var prefix = name + '=';
    var c = document.cookie;
    var nullstring = '';
    var cookieStartIndex = c.indexOf(prefix);
    if (cookieStartIndex == -1)
        return nullstring;
    var cookieEndIndex = c.indexOf(";", cookieStartIndex + prefix.length);
    if (cookieEndIndex == -1)
        cookieEndIndex = c.length;
    return unescape(c.substring(cookieStartIndex + prefix.length, cookieEndIndex));
}

function deleteCookie (name, path, domain) {
    if (getCookie(name))
        document.cookie = name + "=" + ((path) ? "; path=" + path : "") +
            ((domain) ? "; domain=" + domain : "") + "; expires=Thu, 01-Jan-70 00:00:01 GMT";
}



// The Central Randomizer 1.3 (C) 1997 by Paul Houle (houle@msc.cornell.edu)
// See:  http://www.msc.cornell.edu/~houle/javascript/randomizer.html

rnd.today=new Date();
rnd.seed=rnd.today.getTime();

function rnd() {
        rnd.seed = (rnd.seed*9301+49297) % 233280;
        return rnd.seed/(233280.0);
};

function rand(number) {
        return Math.ceil(rnd()*number);
};
