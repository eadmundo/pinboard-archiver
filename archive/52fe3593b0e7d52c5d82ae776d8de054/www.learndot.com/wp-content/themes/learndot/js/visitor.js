/**
 * Learndot Vistor Insights: Visitor tracking and marketing insights library.
 * Used to get a better understanding of the leads generated through our website.
 *
 * Copyright: ©2012 Matygo Educational Incorporated operating as Learndot
 *
 * @author Paul Roland Lambert <pr@learndot.com>
 */

// 3rd-party Polyfills
/**
 * Minified JSON2.js
 * Source code: https://raw.github.com/douglascrockford/JSON-js/master/json2.js
 * Compiled with Google Closure Compiler: http://closure-compiler.appspot.com/home
 */
"object"!==typeof JSON&&(JSON={});
(function(){function k(a){return 10>a?"0"+a:a}function p(a){q.lastIndex=0;return q.test(a)?'"'+a.replace(q,function(a){var c=s[a];return"string"===typeof c?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function m(a,j){var c,d,h,n,g=e,f,b=j[a];b&&("object"===typeof b&&"function"===typeof b.toJSON)&&(b=b.toJSON(a));"function"===typeof i&&(b=i.call(j,a,b));switch(typeof b){case "string":return p(b);case "number":return isFinite(b)?String(b):"null";case "boolean":case "null":return String(b);
case "object":if(!b)return"null";e+=l;f=[];if("[object Array]"===Object.prototype.toString.apply(b)){n=b.length;for(c=0;c<n;c+=1)f[c]=m(c,b)||"null";h=0===f.length?"[]":e?"[\n"+e+f.join(",\n"+e)+"\n"+g+"]":"["+f.join(",")+"]";e=g;return h}if(i&&"object"===typeof i){n=i.length;for(c=0;c<n;c+=1)"string"===typeof i[c]&&(d=i[c],(h=m(d,b))&&f.push(p(d)+(e?": ":":")+h))}else for(d in b)Object.prototype.hasOwnProperty.call(b,d)&&(h=m(d,b))&&f.push(p(d)+(e?": ":":")+h);h=0===f.length?"{}":e?"{\n"+e+f.join(",\n"+
e)+"\n"+g+"}":"{"+f.join(",")+"}";e=g;return h}}"function"!==typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+k(this.getUTCMonth()+1)+"-"+k(this.getUTCDate())+"T"+k(this.getUTCHours())+":"+k(this.getUTCMinutes())+":"+k(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf()});var r=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
q=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,e,l,s={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},i;"function"!==typeof JSON.stringify&&(JSON.stringify=function(a,j,c){var d;l=e="";if("number"===typeof c)for(d=0;d<c;d+=1)l+=" ";else"string"===typeof c&&(l=c);if((i=j)&&"function"!==typeof j&&("object"!==typeof j||"number"!==typeof j.length))throw Error("JSON.stringify");return m("",{"":a})});
"function"!==typeof JSON.parse&&(JSON.parse=function(a,e){function c(a,d){var g,f,b=a[d];if(b&&"object"===typeof b)for(g in b)Object.prototype.hasOwnProperty.call(b,g)&&(f=c(b,g),void 0!==f?b[g]=f:delete b[g]);return e.call(a,d,b)}var d,a=String(a);r.lastIndex=0;r.test(a)&&(a=a.replace(r,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)}));if(/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return d=eval("("+a+")"),"function"===typeof e?c({"":d},""):d;throw new SyntaxError("JSON.parse");})})();

/* IE6-compatible localStorage polyfill using cookies as datastore
 * From https://developer.mozilla.org/en-US/docs/DOM/Storage (accessed November 10, 2012)
 * Compiled with Google Closure Compiler: http://closure-compiler.appspot.com/home
 */
 window.localStorage||(window.localStorage={getItem:function(a){return!a||!this.hasOwnProperty(a)?null:unescape(document.cookie.replace(RegExp("(?:^|.*;\\s*)"+escape(a).replace(/[\-\.\+\*]/g,"\\$&")+"\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"),"$1"))},key:function(a){return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/,"").split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[a])},setItem:function(a,b){a&&(document.cookie=escape(a)+"="+escape(b)+"; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/",this.length=document.cookie.match(/\=/g).length)},
length:0,removeItem:function(a){a&&this.hasOwnProperty(a)&&(document.cookie=escape(a)+"=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/",this.length--)},hasOwnProperty:function(a){return RegExp("(?:^|;\\s*)"+escape(a).replace(/[\-\.\+\*]/g,"\\$&")+"\\s*\\=").test(document.cookie)}},window.localStorage.length=(document.cookie.match(/\=/g)||window.localStorage).length);

/* BrowserDetection (not technically a polyfill)
 * From http://www.quirksmode.org/js/detect.html (accessed November 10, 2012)
 * Compiled with Google Closure Compiler: http://closure-compiler.appspot.com/home
 */
var BrowserDetect={init:function(){this.browser=this.searchString(this.dataBrowser)||"An unknown browser";this.version=this.searchVersion(navigator.userAgent)||this.searchVersion(navigator.appVersion)||"an unknown version";this.OS=this.searchString(this.dataOS)||"an unknown OS"},searchString:function(b){for(var a=0;a<b.length;a++){var c=b[a].string,d=b[a].prop;this.versionSearchString=b[a].versionSearch||b[a].identity;if(c){if(-1!=c.indexOf(b[a].subString))return b[a].identity}else if(d)return b[a].identity}},
searchVersion:function(b){var a=b.indexOf(this.versionSearchString);if(-1!=a)return parseFloat(b.substring(a+this.versionSearchString.length+1))},dataBrowser:[{string:navigator.userAgent,subString:"Chrome",identity:"Chrome"},{string:navigator.userAgent,subString:"OmniWeb",versionSearch:"OmniWeb/",identity:"OmniWeb"},{string:navigator.vendor,subString:"Apple",identity:"Safari",versionSearch:"Version"},{prop:window.opera,identity:"Opera",versionSearch:"Version"},{string:navigator.vendor,subString:"iCab",
identity:"iCab"},{string:navigator.vendor,subString:"KDE",identity:"Konqueror"},{string:navigator.userAgent,subString:"Firefox",identity:"Firefox"},{string:navigator.vendor,subString:"Camino",identity:"Camino"},{string:navigator.userAgent,subString:"Netscape",identity:"Netscape"},{string:navigator.userAgent,subString:"MSIE",identity:"Explorer",versionSearch:"MSIE"},{string:navigator.userAgent,subString:"Gecko",identity:"Mozilla",versionSearch:"rv"},{string:navigator.userAgent,subString:"Mozilla",
identity:"Netscape",versionSearch:"Mozilla"}],dataOS:[{string:navigator.platform,subString:"Win",identity:"Windows"},{string:navigator.platform,subString:"Mac",identity:"Mac"},{string:navigator.userAgent,subString:"iPhone",identity:"iPhone/iPod"},{string:navigator.platform,subString:"Linux",identity:"Linux"}]};BrowserDetect.init();

// End Polyfills

/**
 * Begin Learndot Vistors Insight code
 */

$(document).ready(function() {

    // create Learndot namespace
    Learndot = {

        // Constants and Data

        STORE_KEY: "LearndotVisitor",

        DataFields: {
                /* This is a mapping of the data fields we track 
                * to the placeholder values of their respective hidden fields in the onsite forms
                *
                *  We store
                *  (a) a unique id,
                *  (b) the http referrer string [source] from first visit,
                *  (c) landing page of their first visit,
                *  (d) date of first visit,
                *  (e) Browser and OS
                *  (f) Browsing history through site
                */
                visitorId: "VI-vistor-id",
                referrer: "VI-first-visit-referrer",
                landingPage: "VI-first-visit-page",
                landingDate: "VI-first-visit-date",
                browser: "VI-browser",
                history: "VI-history",

                /* In addition, we send raw json of data fields
                 * Documented here as protocol.
                 */
                rawJson: "VI-json-raw"
        },

        // Methods

        savePage: function() {
            var visitorData = {};

            if (!localStorage.hasOwnProperty(Learndot.STORE_KEY)) {
                /* No existing data, presumed first-time visitor to the site.
                *  Capture first visit data.
                */
                visitorData.visitorId = Math.floor(Math.random() * 1000000000000) + (new Date()).getTime(); // a weak UUID
                visitorData.referrer = document.referrer  || "no referrer (direct)";
                visitorData.landingPage = document.location.pathname
                visitorData.landingDate = new Date();
                visitorData.browser = BrowserDetect.browser + ' ' + BrowserDetect.version + ' on ' + BrowserDetect.OS;
                visitorData.history = [[visitorData.landingDate, visitorData.landingPage]]; // array treated as a stack for browsing history
            }
            else {
                /*
                * Been here before. Store page view + date to history
                */
                visitorData = JSON.parse(localStorage.getItem(Learndot.STORE_KEY));
                visitorData.history.push([new Date(), document.location.pathname]);
            }

            // save data
            localStorage.setItem(Learndot.STORE_KEY, JSON.stringify(visitorData))
        },

        populateForms: function() {
            /* Data is sent through to the server by populating hidden fields that
             * use the placeholder values from Learndot.DataFields to indicate what data they are interested in.
             *
             * Data automatically set on page ready for all forms on the page.
             */
            var rawJson = localStorage.getItem(Learndot.STORE_KEY);
            var visitorData = JSON.parse(rawJson);

            $('input:hidden[value=' + Learndot.DataFields.visitorId + ']').val(visitorData.visitorId);
            $('input:hidden[value=' + Learndot.DataFields.referrer + ']').val(visitorData.referrer);
            $('input:hidden[value=' + Learndot.DataFields.landingPage + ']').val(visitorData.landingPage);
            $('input:hidden[value=' + Learndot.DataFields.landingDate + ']').val(visitorData.landingDate.toString());
            $('input:hidden[value=' + Learndot.DataFields.browser + ']').val(visitorData.browser);
            $('input:hidden[value=' + Learndot.DataFields.history + ']').val(Learndot.historyPrettyString(visitorData.history));

            // In addition, we send the rawJson
            $('input:hidden[value=' + Learndot.DataFields.rawJson + ']').val(rawJson);
        },

        // Helper Methods
        historyPrettyString: function(historyRaw) {
            /* Make browsing history more legible
             */
            var prettyString = "";
            for (var i = 0; i < historyRaw.length; i++) {
                 prettyString += (new Date(historyRaw[i][0])) + " -> " + historyRaw[i][1] + "  ||  ";
            }
            return prettyString;
        }
    };

    Learndot.savePage();
    Learndot.populateForms();

});

