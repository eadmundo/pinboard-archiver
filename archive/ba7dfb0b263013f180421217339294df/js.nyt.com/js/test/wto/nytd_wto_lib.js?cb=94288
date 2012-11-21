/*
 * $Id: nytd_wto_lib.js 94288 2012-04-11 21:21:38Z helckt $
 * (c)2011 The New York Times Company  
 */

NYTD = window.NYTD || {};
NYTD.wto = NYTD.wto || {};

NYTD.wto.regStatus = window.regstatus;
NYTD.wto.meta      = document.getElementsByTagName("meta");
NYTD.wto.testGroup  = 'subscription_funnel';
NYTD.wto.firstClick = true;
NYTD.wto.logFlag  = 0;

NYTD.wto.getCookie = function (name) {
  return new RegExp(name + '=([^;]+)').test(unescape(document.cookie)) ? RegExp.$1 : null;
};

if(NYTD.wto.getCookie("abTestLogFlag"))  { NYTD.wto.logFlag = 1; }

NYTD.wto.setLogCookie = function () {
    NYTD.wto.setCookie("abTestLogFlag",1,1);
};

NYTD.wto.setOrderFormCookie = function (testAlias, days) {
    testAlias = testAlias || NYTD.wto.testAlias;
    days = days || 30;
    NYTD.wto.setCookie('abTest_orderForm', testAlias, days);
};


NYTD.wto.setCookie = function (name, value, expires, path, domain, secure) {
    var today = new Date();
    today.setTime(today.getTime());

    if(expires) { expires = expires * 1000 * 60 * 60 * 24; }
    var expires_date = new Date(today.getTime() + (expires));

    var cookieStr = name + "=" +escape( value ) +
    ((path) ? ";path=" + path : ";path=/" ) +
    ((expires) ? ";expires=" + expires_date.toGMTString() : "" ) +
    ((domain) ? ";domain=" + domain : ";domain=.nytimes.com" ) +
    ((secure) ? ";secure" : "" );
    document.cookie = cookieStr;
};

try { NYTD.wto.meterCount = parseInt(NYTD.wto.getCookie("nyt-m").split('&')[3].substr(4),10); }
catch(err) { NYTD.wto.meterCount = 0; }

NYTD.wto.setFirstClick = function() {
    NYTD.wto.firstClick = false;
    setTimeout(function(){ NYTD.wto.firstClick = true; }, 1000);
};

NYTD.wto.appendStyleTag = function(styleStr) {
    var newNode = document.createElement('style');
    newNode.setAttribute("type", "text/css");
    if (newNode.styleSheet) {                       // IE 
        newNode.styleSheet.cssText = styleStr;
    } else {
        newNode.appendChild(document.createTextNode(styleStr));
    }
    document.getElementsByTagName('head')[0].appendChild(newNode);
    return newNode;
};

NYTD.wto.runWhenReady = function(testFunction, inFunction, mlsecs, reps) {
    setTimeout(function z() {
        if(testFunction()) { inFunction(); }
        else if(--reps)    { setTimeout(z, mlsecs); }
    }, mlsecs);
};

NYTD.wto.getTarget = function(e) {
    var targ;
    if (!e) { e = window.event; }
    if (e.target) { targ = e.target; }
    else if (e.srcElement) { targ = e.srcElement; }
    if (targ.nodeType == 3) { targ = targ.parentNode; }    // defeat Safari bug
    return targ;
};

NYTD.wto.log = function(msg) {
    if(NYTD.wto.logFlag && window.console) {
        console.log(msg);
    }    
};

NYTD.wto.submitHandler = function(convName, submitFunction) {
    if(NYTD.wto.firstClick) { NYTD.wto.setFirstClick(); }
    else { return; }
    convName = convName || 'submit';

    var convHandler = function(wtCallbackObject) {
        if (wtCallbackObject.target.zccdd3ca1db.conversionPoint === convName) {
            submitFunction();
        }
    };

    WTOptimize.addEventHandler(WTEvent.CONVERSION, convHandler);   
    NYTD.wto.log("testName: " + NYTD.wto.testAlias + " -- conversion name: " + convName + " -- no link passed, triggered by submit");
    WTOptimize.conversion(NYTD.wto.testAlias, {conversionPoint: convName});  
};


NYTD.wto.nonLinkEventConversion = function(params) {
    if(NYTD.wto.firstClick) {NYTD.wto.setFirstClick(); }
    else { return; }
    
    var e = params.e;
    var element = (e.target) ? e.target : e.srcElement;

    var convName = params.convName;
    if(!convName) {
        convName = NYTD.wto.concoctConversionName(e, element);
    }

    NYTD.wto.log("testName: " + NYTD.wto.testAlias + " -- conversion name: " + convName + " -- no link passed, triggered by non-link event");
    WTOptimize.conversion(NYTD.wto.testAlias, {conversionPoint: convName});  
};

NYTD.wto.linkConversion = function(params) {
    if(NYTD.wto.firstClick) {NYTD.wto.setFirstClick(); }
    else { return; }

    var    followFlag = true;
    var e = params.e;
    var element = (e.target) ? e.target : e.srcElement;

    var findLink = function(element) {
        while (element && element != document) {
            if(element.nodeName === "A" || element.nodeName === "AREA") { return element; }
            element = element.parentNode;
        }
        return null;
    };

    var isTab = function(element) {
        while (element && element != document) {
            if(element.className.match(/\btab\b/)) { return 1; }
            element = element.parentNode;
        }
        return 0;
    };

    var isLeftButton = function(e) {
        e = e || window.event;
        var button = e.which || e.button;
        return button == 1;
    };

    var link = (params.link && findLink(params.link)) || findLink(element);

    if(e.altKey || !link || !link.href || link.href === '') {
        NYTD.wto.log("NO CONVERSION!!!");
        return;
    }

    
    if(!link || !isLeftButton(e) || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey || 
       (link.target || link.target !== '') ||
       link.href.match(/^javascript:/i) || link.href.match(/^mailto:/i) || link.href.match('#') ||
       isTab(element)) {

        followFlag = false;
    }

    var convName = params.convName;
    if(!convName) {
        convName = NYTD.wto.concoctConversionName(e, link);
    }
    

    if(followFlag) {


        var tmpHref = link.href;
        

        // IE doesn't like this version
//        if(tmpHref !== '') { 
//            setTimeout( location.href = tmpHref, 5000);    
//        }

        // So, instead use this, which requires an ugly hack to clear the bfcache, otherwise the 
        // timeout may still be running when user returns to the page. This is a bug on the Mac: both
        // Safari and FF
        if(tmpHref !== '') { 
            if (navigator.appVersion.indexOf("Mac")!=-1) { window.onunload = function(){}; }
            NYTD.wto.conversionTimer = setTimeout( function() { location.href = tmpHref; }, 5000);
        }

        NYTD.wto.log("testName: " + NYTD.wto.testAlias + " -- conversion name: " + convName + " -- passing link: " + link.id);
        WTOptimize.conversion(NYTD.wto.testAlias, link, {conversionPoint:convName, s_urlParts:true});
    }
    else {
        NYTD.wto.log("testName: " + NYTD.wto.testAlias + " -- conversion name: " + convName + " -- no link passed");
        WTOptimize.conversion(NYTD.wto.testAlias, {conversionPoint:convName, s_urlParts:true});
    }
};

NYTD.wto.concoctConversionName = function(e, link) {
    var ret = link.id;
    if(ret) { return ret.substr(0, 20); }
    
    ret = link.innerText || link.textContent || link.href.split("?")[0].split("/").pop() || "";
    return ret.substr(0, 12);
};

/* Script tags that are added to page through a Gateway campaign cannot be relied upon to 
   load synchronously. Sometimes you need to test that this library finished loading.
*/   
NYTD.wto.libraryLoaded = true;

