; (function (window, document, undefined) {
    mti = {}; mti.J = function (a, b) { var c = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : []; return function () { c.push.apply(c, arguments); return b.apply(a, c) } }; mti.h = function (a, b) { this.i = a; this.b = b }; mti.h.prototype.createElement = function (a, b, c) { a = this.i.createElement(a); if (b) for (var d in b) if (b.hasOwnProperty(d)) if (d == "style" && this.b.getName() == "MSIE") a.style.cssText = b[d]; else a.setAttribute(d, b[d]); c && a.appendChild(this.i.createTextNode(c)); return a }; function j(a, b, c) { a = a.i.getElementsByTagName(b)[0]; if (!a) a = document.documentElement; if (a && a.lastChild) { a.insertBefore(c, a.lastChild); return true } return false }
    function q(a, b) { function c() { document.body ? b() : setTimeout(c, 0) } c() } mti.h.t = false;
    function r(a, b) {
        if (mti.h.t === true) b(); else if (a.b.getName() == "MSIE") { var c = a.i, d = false, e = function () { if (!d) { d = true; b(); mti.h.t = true } }; (function () { try { c.documentElement.doScroll("left") } catch (f) { setTimeout(arguments.callee, 50); return } e() })(); c.onreadystatechange = function () { if (c.readyState == "complete") { c.onreadystatechange = null; e() } } } else if (a.b.pa == "AppleWebKit" && a.b.oa < 525) (function () { if (["loaded", "complete"].indexOf(this.i.readyState) > -1) { b(); mti.h.t = true } else setTimeout(arguments.callee, 50) })();
        else if (a.i.addEventListener) a.i.addEventListener("DOMContentLoaded", function () { b(); mti.h.t = true }, false); else window.onload = function () { b(); mti.h.t = true } 
    } function s(a, b) { if (b.parentNode) { b.parentNode.removeChild(b); return true } return false } function t(a, b, c) { a = b.className.split(/\s+/); for (var d = 0, e = a.length; d < e; d++) if (a[d] == c) return; a.push(c); b.className = a.join(" ").replace(/^\s+/, "") }
    function u(a, b, c) { a = b.className.split(/\s+/); for (var d = [], e = 0, f = a.length; e < f; e++) a[e] != c && d.push(a[e]); b.className = d.join(" ").replace(/^\s+/, "").replace(/\s+$/, "") } function w(a, b) { var c = ""; b = b.childNodes || b; for (var d = 0; d < b.length; d++) c += b[d].nodeType != 1 ? b[d].nodeValue : w(a, b[d].childNodes); return c } mti.h.prototype.getElementById = function (a) { return this.i.getElementById(a) }; mti.l = function (a, b, c, d, e, f) { this.wa = a; this.Ba = b; this.pa = c; this.oa = d; this.ya = e; this.ea = f }; mti.l.prototype.getName = function () { return this.wa }; mti.e = function (a) { this.b = a }; mti.e.f = "Unknown"; mti.e.la = new mti.l(mti.e.f, mti.e.f, mti.e.f, false); mti.e.prototype.parse = function () { return this.b.indexOf("MSIE") != -1 ? x(this) : this.b.indexOf("Opera") != -1 ? z(this) : this.b.indexOf("AppleWebKit") != -1 ? A(this) : this.b.indexOf("Gecko") != -1 ? B(this) : mti.e.la }; function C(a) { var b = F(a, a.b, /(iPod|iPad|iPhone|Android)/); if (b != "") return b; a = F(a, a.b, /(Linux|Mac_PowerPC|Macintosh|Windows)/); if (a != "") { if (a == "Mac_PowerPC") a = "Macintosh"; return a } return mti.e.f }
    function x(a) { var b = F(a, a.b, /(MSIE [\d\w\.]+)/); if (b != "") { var c = b.split(" "); b = c[0]; c = c[1]; return new mti.l(b, c, b, c, C(a), G(a, c) >= 6) } return new mti.l("MSIE", mti.e.f, "MSIE", mti.e.f, C(a), false) }
    function z(a) { var b = mti.e.f, c = mti.e.f, d = F(a, a.b, /(Presto\/[\d\w\.]+)/); if (d != "") { c = d.split("/"); b = c[0]; c = c[1] } else { if (a.b.indexOf("Gecko") != -1) b = "Gecko"; d = F(a, a.b, /rv:([^\)]+)/); if (d != "") c = d } if (a.b.indexOf("Version/") != -1) { d = F(a, a.b, /Version\/([\d\.]+)/); if (d != "") return new mti.l("Opera", d, b, c, C(a), G(a, d) >= 10) } d = F(a, a.b, /Opera[\/ ]([\d\.]+)/); if (d != "") return new mti.l("Opera", d, b, c, C(a), G(a, d) >= 10); return new mti.l("Opera", mti.e.f, b, c, C(a), false) }
    function A(a) { var b = C(a), c = F(a, a.b, /AppleWebKit\/([\d\.\+]+)/); if (c == "") c = mti.e.f; var d = mti.e.f; if (a.b.indexOf("Chrome") != -1) d = "Chrome"; else if (a.b.indexOf("Safari") != -1) d = "Safari"; var e = mti.e.f; if (a.b.indexOf("Version/") != -1) e = F(a, a.b, /Version\/([\d\.\w]+)/); else if (d == "Chrome") e = F(a, a.b, /Chrome\/([\d\.]+)/); var f = F(a, c, /\d+\.(\d+)/); return new mti.l(d, e, "AppleWebKit", c, b, G(a, c) >= 526 || G(a, c) >= 525 && parseInt(f) >= 13) }
    function B(a) {
        var b = mti.e.f, c = mti.e.f, d = false; if (a.b.indexOf("Firefox") != -1) { b = "Firefox"; var e = F(a, a.b, /Firefox\/([\d\w\.]+)/); if (e != "") { d = F(a, e, /\d+\.(\d+)/); c = e; d = e != "" && G(a, e) >= 3 && parseInt(d) >= 5 } } else if (a.b.indexOf("Mozilla") != -1) b = "Mozilla"; e = F(a, a.b, /rv:([^\)]+)/); if (e == "") e = mti.e.f; else if (!d) { d = G(a, e); var f = parseInt(F(a, e, /\d+\.(\d+)/)), g = parseInt(F(a, e, /\d+\.\d+\.(\d+)/)); d = d > 1 || d == 1 && f > 9 || d == 1 && f == 9 && g >= 2 || e.match(/1\.9\.1b[123]/) != null || e.match(/1\.9\.1\.[\d\.]+/) != null } return new mti.l(b,
c, "Gecko", e, C(a), d)
    } function G(a, b) { a = F(a, b, /(\d+)/); if (a != "") return parseInt(a); return -1 } function F(a, b, c) { if ((a = b.match(c)) && a[1]) return a[1]; return "" }; mti.c = function (a, b, c, d) { this.a = a; this.g = b; this.W = c; this.o = d || mti.c.B; this.n = new mti.A("-") }; mti.c.B = "mti"; mti.c.q = "loading"; mti.c.z = "active"; mti.c.C = "inactive"; mti.c.H = "font"; function H(a) { t(a.a, a.g, a.n.m(a.o, mti.c.q)); I(a, mti.c.q) } function J(a, b, c) { u(a.a, a.g, a.n.m(a.o, b, c, mti.c.q)); t(a.a, a.g, a.n.m(a.o, b, c, mti.c.z)); I(a, mti.c.H + mti.c.z, b, c) } function K(a) { t(a.a, a.g, a.n.m(a.o, mti.c.C)); I(a, mti.c.C) } function L(a) { u(a.a, a.g, a.n.m(a.o, mti.c.q)); t(a.a, a.g, a.n.m(a.o, mti.c.z)); I(a, mti.c.z) }
    function I(a, b, c, d) { a.W[b] && a.W[b](c, d) }; mti.ha = function () { this.ba = {} }; function M(a, b) { var c = []; for (var d in b) if (b.hasOwnProperty(d)) { var e = a.ba[d]; e && c.push(e(b[d])) } return c }; mti.p = function (a, b, c, d, e) { this.a = a; this.r = b; this.L = c; this.F = d; this.$ = e; this.X = 0; this.Q = this.aa = false; this.va = new mti.S; this.ra = new mti.j }; mti.p.T = "_,arial,helvetica"; mti.p.ga = "n4";
    mti.p.prototype.watch = function (a, b, c) { for (var d = a.length, e = 0; e < d; e++) { var f = a[e]; b[f] || (b[f] = [mti.p.ga]); this.X += b[f].length } if (c) this.aa = c; for (e = 0; e < d; e++) { f = a[e]; c = b[f]; for (var g = 0, h = c.length; g < h; g++) { var m = c[g], k = O(this, mti.p.T, m), o = this.L.M(k); s(this.a, k); k = f; var l = this.r; t(l.a, l.g, l.n.m(l.o, k, m, mti.c.q)); I(l, mti.c.H + mti.c.q, k, m); l = O(this, this.va.quote(k), m); if (o != this.L.M(l)) { s(this.a, l); J(this.r, k, m); this.Q = true; P(this) } else Q(this, this.$(), o, l, k, m) } } };
    function P(a) { if (--a.X == 0 && a.aa) a.Q ? L(a.r) : K(a.r) } mti.p.prototype.na = function (a, b, c, d, e) { if (b != this.L.M(c)) { s(this.a, c); J(this.r, d, e); this.Q = true; P(this) } else if (this.$() - a < 5E3) Q(this, a, b, c, d, e); else { s(this.a, c); a = this.r; u(a.a, a.g, a.n.m(a.o, d, e, mti.c.q)); t(a.a, a.g, a.n.m(a.o, d, e, mti.c.C)); I(a, mti.c.H + mti.c.C, d, e); P(this) } }; function Q(a, b, c, d, e, f) { a.F(function (g, h) { return function () { h.call(g, b, c, d, e, f) } } (a, a.na), 50) }
    function O(a, b, c) { c = a.ra.expand(c); b = a.a.createElement("span", { style: "position:absolute;top:-999px;font-size:300px;font-family:" + b + "," + mti.p.T + ";" + c }, "Mm"); j(a.a, "body", b); return b }; mti.s = function (a, b, c, d, e) { this.a = a; this.Z = b; this.g = c; this.F = d; this.b = e; this.N = this.O = 0 }; mti.s.prototype.V = function (a, b) { this.Z.ba[a] = b }; mti.s.prototype.load = function (a) { var b = new mti.c(this.a, this.g, a); this.b.ea ? R(this, b, a) : K(b) }; mti.s.prototype.ta = function (a, b, c, d) { if (d) a.load(mti.J(this, this.xa, b, c)); else { a = --this.O == 0; this.N--; if (a) this.N == 0 ? K(b) : H(b); c.watch([], {}, a) } };
    mti.s.prototype.xa = function (a, b, c, d) { var e = --this.O == 0; e && H(a); this.F(mti.J(this, function (f, g, h, m) { setTimeout(function () { f.watch(g, h || {}, m) }, 100) }, b, c, d, e)) }; function R(a, b, c) { c = M(a.Z, c); a.N = a.O = c.length; for (var d = new mti.p(a.a, b, { M: function (h) { return h.offsetWidth } }, a.F, function () { return (new Date).getTime() }), e = 0, f = c.length; e < f; e++) { var g = c[e]; S(g, a.b, mti.J(a, a.ta, g, b, d)) } }; mti.A = function (a) { this.ua = a || mti.A.fa }; mti.A.fa = "-"; mti.A.prototype.m = function () { for (var a = [], b = 0; b < arguments.length; b++) a.push(arguments[b].replace(/[\W_]+/g, "").toLowerCase()); return a.join(this.ua) }; mti.S = function () { this.da = '"' }; mti.S.prototype.quote = function (a) { var b = []; a = a.split(/,\s*/); for (var c = 0; c < a.length; c++) { var d = a[c].replace(/['"]/g, ""); d.indexOf(" ") == -1 ? b.push(d) : b.push(this.da + d + this.da) } return b.join(",") }; mti.j = function () { this.ca = mti.j.ka; this.w = mti.j.ma }; mti.j.ka = ["font-style", "font-weight"]; mti.j.ma = { "font-style": [["n", "normal"]], "font-weight": [["4", "normal"]] }; mti.j.U = function (a, b, c) { this.sa = a; this.Aa = b; this.w = c }; mti.j.U.prototype.expand = function (a, b) { for (var c = 0; c < this.w.length; c++) if (b == this.w[c][0]) { a[this.sa] = this.Aa + ":" + this.w[c][1]; return } };
    mti.j.prototype.expand = function (a) { if (a.length != 2) return null; for (var b = [null, null], c = 0, d = this.ca.length; c < d; c++) { var e = this.ca[c], f = a.substr(c, 1); (new mti.j.U(c, e, this.w[e])).expand(b, f) } return b[0] && b[1] ? b.join(";") + ";" : null }; window.MonoTypeWebFonts = function () { var a = (new mti.e(navigator.userAgent)).parse(); return new mti.s(new mti.h(document, a), new mti.ha, document.documentElement, function (b, c) { setTimeout(b, c) }, a) } (); window.MonoTypeWebFonts.load = window.MonoTypeWebFonts.load; window.MonoTypeWebFonts.addModule = window.MonoTypeWebFonts.V; mti.I = function (a, b, c) { this.P = a; this.a = b; this.za = c; this.v = {}; this.K = [] }; mti.I.prototype.indexOf = function (a, b) { if (a.indexOf) return a.indexOf(b); else { for (var c = 0; c < a.length; c++) if (a[c] == b) return c; return -1 } };
    function T(a, b) {
        var c = a.za, d = typeof b.currentStyle != "undefined" ? b.currentStyle.fontFamily : a.a.i.defaultView.getComputedStyle(b, null).getPropertyValue("font-family"); d = (d || "").replace(/^\s|\s$/g, "").replace(/'|"/g, ""); if (d != "") {
            var e = new RegExp(d, "ig"); for (i = 0; i < c.length; i++) {
                var f = c[i]; if (e.test(f.fontfamily.replace(/^\s|\s$/g, ""))) {
                    var g; if (b) g = typeof b.currentStyle != "undefined" ? b.currentStyle.visibility : a.a.i.defaultView.getComputedStyle(b, null).getPropertyValue("visibility"); if (g != "hidden") b.style.visibility =
"hidden"; a.K.push(b); if (f.enableSubsetting) if (a.v[d]) a.v[d] += w(a.a, b); else a.v[d] = w(a.a, b)
                } 
            } 
        } 
    }
    function U(a) { var b = "img,select,option,script,noscript,iframe,object,style,param,embed,link,meta,head,title,br,hr".split(","), c = a.P, d = null; do { d = c.firstChild; if (d == null) { c.nodeType == 1 && a.indexOf(b, c.tagName.toLowerCase()) < 0 && T(a, c); d = c.nextSibling } if (d == null) { c = c; do { d = c.parentNode; if (d == a.P) break; d.nodeType == 1 && a.indexOf(b, d.tagName.toLowerCase()) < 0 && T(a, d); c = d; d = d.nextSibling } while (d == null) } c = d } while (c != a.P); b = false; for (p in a.v) { b = true; break } if (b) return a.v; return null }; mti.k = function (a, b, c, d) { this.G = a; this.b = b; this.a = c; this.d = d; this.Y = []; this.qa = {} }; mti.k.ja = "monotype"; var V = "TTF";
    function S(a, b, c) { V = W(a); var d = a.d.projectId; if (d) { a.G["__mti_fntLst" + d] = function () { return a.d.pfL }; a.G.mti_element_cache = []; X(a); if (a.d.reqSub) { d = function () { var f = new mti.I(document.body, a.a, a.d.pfL), g = U(f); for (fontfamily in g) g[fontfamily] = Y(a, g[fontfamily]); a.G.mti_element_cache = f.K; Z(a, g) }; var e = window.MTIConfig || { isAsync: false }; if (e.isAsync === true) e.onReady = d; else r(a.a, d) } else { Z(a); q(a.a, function () { var f = new mti.I(document.body, a.a, a.d.pfL); U(f); a.G.mti_element_cache = f.K }) } c(b.ea) } else c(true) }
    function W(a) { var b = a.d.ffArray, c = a.b.getName(); c = c.toLowerCase(); if (c == "firefox") c = "mozilla"; if (/ipad|ipod|iphone/.test(a.b.ya.toLowerCase())) c = "msafari"; a = a.b.Ba; b = b[c]; c = ""; for (p in b) if (parseFloat(a) >= parseFloat(p)) c = b[p]; return c } mti.k.D = 300;
    function Z(a, b) {
        var c = a.d.projectId, d = a.d.ec, e = a.d.fcURL, f = a.d.dfcURL, g = a.a.createElement("style", { type: "text/css", id: "mti_fontface_" + a.d.projectId }); j(a.a, "head", g); var h = "", m = false, k = {}, o = { TTF: "truetype", WOFF: "woff", SVG: "svg" }, l = V != null && V.toUpperCase() == "EOT"; for (i = 0; i < a.d.pfL.length; i++) {
            var v = a.d.pfL[i], n = v.fontfamily, D = v.contentIds; a.Y.push(n); if (b && b[n] && b[n].length > mti.k.D) {
                m = true; k[n] || (k[n] = []); var N = b[n], E = (N.length - 1) / mti.k.D + 1; E = Math.floor(E); for (var y = 1; y <= E; y++) {
                    newFontFamily = n + "" +
y; k[n].push(newFontFamily); b[newFontFamily] = N.substr((y - 1) * mti.k.D, mti.k.D); h += "@font-face{font-family:'" + newFontFamily + "';src:url('" + $(a, D, c, v.enableSubsetting, d, e, f, a.d.ck, newFontFamily, b) + "')"; l || (h += " format('" + o[V.toUpperCase()] + "')"); h += ";}\n"
                } 
            } else { h += "@font-face{font-family:'" + n + "';src:url('" + $(a, D, c, v.enableSubsetting, d, e, f, a.d.ck, n, b) + "')"; if (!l) { v = D[V.toUpperCase()]; n = o[V.toUpperCase()]; v || (n = o.TTF); h += " format('" + n + "')" } h += ";}\n" } 
        } if (m === true) {
            s(a.a, a.a.getElementById("mti_stylesheet_" +
a.d.projectId) || {}); X(a, k)
        } if (g.styleSheet) g.styleSheet.cssText = h; else { a = document.createTextNode(h); g.appendChild(a) } 
    }
    function X(a, b) {
        var c = a.a.createElement("style", { type: "text/css", id: "mti_stylesheet_" + a.d.projectId }); j(a.a, "head", c); var d = ""; for (i in a.d.selectorFontMap) { var e = a.d.selectorFontMap[i]; if (b && b[e] && b[e].length > 0) e = b[e].join("','"); d += i + "{font-family:'" + e + "';}\n"; d += "/*fout specific code:*/\n"; d += "." + mti.c.B + "-loading " + i + "{visibility:hidden;}\n"; d += "." + mti.c.B + "-active " + i + ", ." + mti.c.B + "-inactive " + i + "{visibility: visible;}\n" } if (c.styleSheet) c.styleSheet.cssText = d; else {
            a = document.createTextNode(d);
            c.appendChild(a)
        } 
    } function Y(a, b) { if (b && typeof b == "string") { b = b.replace(/\s/g, "").replace(/\n/g, "").replace(/\r/g, ""); a = ""; for (var c = b.length, d = null, e = 0; e < c; e++) { d = b.charAt(e); if (a.indexOf(d) == -1) a += d } return a } return "" }
    function $(a, b, c, d, e, f, g, h, m, k) {
        var o = b[V.toUpperCase()], l = "http://"; if (window.location.protocol == "https:") l = "https://"; f = f.replace("http://", "").replace("https://", ""); g = g.replace("http://", "").replace("https://", ""); f = l + f; g = l + g; if (d) { url = g + "?"; if (e) url += h + "&"; url += "fctypeId=" + a.d.fctypeArray[V] + "&fcId=" + b.TTF + "&origId=" + o } else url = e ? o ? f + o + "." + V.toLowerCase() + "?" + h : f + b.TTF + ".ttf?" + h : f + "?fctypeId=" + a.d.fctypeArray[V] + "&fcId=" + o; url += "&projectId=" + c; if (k) url += "&content=" + escape((k[m] || "") + "giMm");
        if (V != null && V.toUpperCase() == "SVG") url += "#" + o; return url
    } mti.k.prototype.load = function (a) { a(this.Y, this.qa) }; mti.ia = function (a) { this.u = a }; mti.ia.prototype.protocol = function () { var a = ["http:", "https:"], b = a[0]; if (this.u && this.u.location && this.u.location.protocol) { var c = 0; for (c = 0; c < a.length; c++) if (this.u.location.protocol == a[c]) return this.u.location.protocol } return b }; mti.R = function (a, b) { this.a = a; this.d = b };
    mti.R.prototype.appendBannerScript = function () { var a; a = new RegExp(escape("WFS_MTI_SS") + "=([^;]+)"); if (a.test(document.cookie + ";")) { a.exec(document.cookie + ";"); a = unescape(RegExp.$1) } else a = false; var b = this.d.bannerHandlerURL; if (b) { b += "?projectId=" + this.d.projectId; if (a !== false) b += "&WFS_MTI_SS=" + a; b += "&" + escape((new Date).getTime()); j(this.a, "head", this.a.createElement("Script", { type: "text/javascript", src: b })) } };
    MonoTypeWebFonts.V(mti.k.ja, function (a) { var b = (new mti.e(navigator.userAgent)).parse(), c = new mti.h(document, b); window.MonoTypeWebFonts.BannerHandler = new mti.R(c, a); return new mti.k(window, b, c, a) });
})(this, document);
if(window.addEventListener){  window.addEventListener('load', function(){MonoTypeWebFonts.cleanup(); MonoTypeWebFonts.loadColo();}, false);}else if(window.attachEvent){  window.attachEvent('onload', function(){MonoTypeWebFonts.cleanup(); MonoTypeWebFonts.loadColo();});}MonoTypeWebFonts.cleanupExecuted = false;MonoTypeWebFonts.cleanup = function(){if(MonoTypeWebFonts.cleanupExecuted === true){ return; }MonoTypeWebFonts.cleanupExecuted = (window['mti_element_cache'].length > 0);for(i = 0; i < window['mti_element_cache'].length; i++){window['mti_element_cache'][i].style.visibility = "";}var className = document.documentElement.className;className = className.replace(/\b(mti\-.*?(loading|active|inactive))\b/g,'').replace(/^\s+|\s+$/g,'').replace(/\s+/g,' ');setTimeout(function(){document.documentElement.className = className+' mti-repaint';},20);/*IE sometimes requires redrawing the browser after fonts are downloaded. Adding a classname might help*/if(!document.getElementById('MonoTypeFontApiFontTracker')){  var fontTrackingUrl = "http://fast.fonts.com/t/1.css";  if(window.location.protocol == 'https:'){    fontTrackingUrl = fontTrackingUrl.replace(/http:/,'https:');  }  var head = document.getElementsByTagName('HEAD')[0];  var cssEle = document.createElement('LINK');  if(cssEle){      cssEle.setAttribute('id','MonoTypeFontApiFontTracker');      cssEle.setAttribute('type','text/css');      cssEle.setAttribute('rel','stylesheet');      cssEle.setAttribute('href',fontTrackingUrl + "?apiType=css&projectid=e32a88dd-64b2-47c3-a2fd-71786263728a");      head.appendChild(cssEle);  }}window['mti_element_cache'] = [];};MonoTypeWebFonts._fontActiveEventList = [];MonoTypeWebFonts._fontLoadingEventList = [];MonoTypeWebFonts._activeEventList = [];MonoTypeWebFonts._inActiveEventList = [];MonoTypeWebFonts.addEvent = function(eventName, callbackFunction){   if(eventName.toLowerCase() == 'fontactive'){      MonoTypeWebFonts._fontActiveEventList.push(callbackFunction);  }else if(eventName.toLowerCase() == 'fontloading'){      MonoTypeWebFonts._fontLoadingEventList.push(callbackFunction);  }else if(eventName.toLowerCase() == 'inactive'){      MonoTypeWebFonts._inActiveEventList.push(callbackFunction);  }else if(eventName.toLowerCase() == 'active'){      MonoTypeWebFonts._activeEventList.push(callbackFunction);  }};MonoTypeWebFonts.loadFonts = function(){MonoTypeWebFonts.load({monotype:{ reqSub:false,pfL:[{'fontfamily' : "Avenir LT W01 35 Light" ,contentIds :{EOT: '3511a780-31ca-4ee1-9083-89b1b7185748',WOFF: 'c4352a95-7a41-48c1-83ce-d8ffd2a3b118',TTF: '3e419b5b-c789-488d-84cf-a64009cc308e',SVG: 'ca038835-1be3-4dc5-ba25-be1df6121499'}, enableSubsetting : false},{'fontfamily' : "AvenirLTW01-35LightObli" ,contentIds :{EOT: '6500273c-8e8b-48d2-b0c0-dcae293c0120',WOFF: '47fd1045-6e5b-4c87-9235-cfbc2b42cde7',TTF: '60662abb-0ac3-46b2-930f-4719462489c9',SVG: '9cf39ac2-87a5-4c4e-a604-7cece19d30bd'}, enableSubsetting : false},{'fontfamily' : "Avenir LT W01 45 Book" ,contentIds :{EOT: '4f32268f-fd86-4960-b72c-4bb1ba75ec6f',WOFF: '939cba03-5b40-4d01-9bc5-7589eca863db',TTF: '849bc5b9-a2ff-4343-977b-26ba8bd24a60',SVG: 'f67fa3b5-c1d1-488f-8e60-a828b9ad56a4'}, enableSubsetting : false},{'fontfamily' : "AvenirLTW01-45BookObliq" ,contentIds :{EOT: 'acc13cdc-338a-43e6-a156-e54a4c87582d',WOFF: 'ca94ed56-18fc-4856-940a-70a072607c7c',TTF: 'dd6da407-70fe-4aa3-a1c7-64f0cb086f01',SVG: 'c7f424be-90e1-45b8-b617-ee3589a859bd'}, enableSubsetting : false},{'fontfamily' : "Avenir LT W01 55 Roman" ,contentIds :{EOT: '2f5a6074-badc-4e08-83f1-ed67fe5c3d7c',WOFF: 'b9ebb19d-88c1-4cbd-9baf-cf51972422ec',TTF: '5ed4f98e-9044-4810-88ff-74d412c1351f',SVG: '4cb16859-16ca-4342-b89c-292dc83266af'}, enableSubsetting : false},{'fontfamily' : "AvenirLTW01-55Oblique" ,contentIds :{EOT: '8f21e618-9282-4df1-b556-73ee82bdd673',WOFF: '3695342c-b5e2-4010-b0d4-56f563465922',TTF: '2ba9f875-66d9-414d-a426-5a012b443475',SVG: '0a88351a-e628-4b1f-99eb-3a729518af0a'}, enableSubsetting : false},{'fontfamily' : "Avenir LT W01 65 Medium" ,contentIds :{EOT: '212ab03d-5db2-4d6a-b94c-171cc702aa51',WOFF: '2cac77ec-9bc0-4ee7-87e4-27650190744f',TTF: 'aaf11848-aac2-4d09-9a9c-aac5ff7b8ff4',SVG: '294099f3-8d00-4676-afc5-5e9d8d43ad69'}, enableSubsetting : false},{'fontfamily' : "AvenirLTW01-65MediumObl" ,contentIds :{EOT: '2a6f81a2-475c-4831-9949-33d7748ee561',WOFF: 'e0af2f49-a399-482b-a54e-d745e268ec80',TTF: '6803d3dd-2107-45fc-ac8a-a4fa13771547',SVG: '1bb1acb5-8d4e-4800-88af-dbcf1fe96ef8'}, enableSubsetting : false},{'fontfamily' : "Avenir LT W01 85 Heavy" ,contentIds :{EOT: 'f61bf0f6-c193-4100-b940-12a1a01dcee5',WOFF: '7147ec3a-8ff8-4ec9-8c5c-bd1571dc6ae6',TTF: 'd1dc54b2-878d-4693-8d6e-b442e99fef68',SVG: '731dd4d3-64da-427d-ba61-01575b3cf3f7'}, enableSubsetting : false},{'fontfamily' : "AvenirLTW01-85HeavyObli" ,contentIds :{EOT: '7be0fdec-384a-42b5-ab27-c60a322cde7d',WOFF: '53554f6f-4b01-4815-87fe-82c49b8ba5a9',TTF: '28dfedaf-6372-45a1-8833-b3078dc56a21',SVG: 'f747b6ee-4d13-4e45-815d-f33ac1b71d63'}, enableSubsetting : false},{'fontfamily' : "Avenir LT W01 95 Black" ,contentIds :{EOT: 'a24b3f55-c8c8-41a1-a77e-7cdf417d82f6',WOFF: '5a05cf7f-f332-456f-ae67-d8c26e0d35b3',TTF: 'c33278bc-988e-440b-b4be-6acc095e6044',SVG: '7bdad4a5-289b-42f9-b6fa-c5883b9e9f23'}, enableSubsetting : false},{'fontfamily' : "AvenirLTW01-95BlackObli" ,contentIds :{EOT: 'fbf3e69b-73b2-406d-84bc-feda30a0a563',WOFF: '36ec15b9-f8da-447f-8fed-a9cfdfb91fbb',TTF: '230d6b14-6d44-4dd5-a6ae-a4287936e51e',SVG: '9bce4920-94e2-4e4d-bd34-818801dd3eb3'}, enableSubsetting : false}],selectorFontMap:{},ck:'d44f19a684109620e484157ca490e8184271cfc1bfa1761034d0517be1ea1bcb8878ab64e7c34ef0ebf856210f4ff23f4f7a4f315818797a2a9f5ee877f71b6722ee75a2caec2df22462753ed72eed8be046b5e0ae781a0bd80cce3f0772608a84f2381afcbe12c0eaf133f619eebe67dbaf6abc00309011947d800f721048200b7549f0dd2ceb9c1917132ff449b6f86f3038c85936a3596c',ec:'true',fcURL:'http://fast.fonts.com/d/',dfcURL:'',sO:'True',ffArray:{safari: {'3.1': 'ttf'}, msafari: {'1' : 'svg', '4.2' : 'ttf'}, chrome: {'3' :'svg', '4' : 'ttf','5':'woff'}, opera: {'10' : 'ttf', '11.10' : 'woff'}, msie: {'4' : 'eot', '9' : 'woff'}, mozilla: {'3.5' : 'ttf', '3.6' : 'woff'}},fctypeArray:{'ttf':'1','eot':'2','woff':'3','svg': '11'},projectId:'e32a88dd-64b2-47c3-a2fd-71786263728a',EOD:null},fontloading:function(fontFamily, fontDescription){  for(var i=0; i<MonoTypeWebFonts._fontLoadingEventList.length; i++){      MonoTypeWebFonts._fontLoadingEventList[i].call(MonoTypeWebFonts, fontFamily, fontDescription);  }},fontactive:function(fontFamily, fontDescription) {  for(var i=0; i<MonoTypeWebFonts._fontActiveEventList.length; i++){      MonoTypeWebFonts._fontActiveEventList[i].call(MonoTypeWebFonts, fontFamily, fontDescription);  }},inactive:function(){  MonoTypeWebFonts.cleanup();  for(var i=0; i<MonoTypeWebFonts._inActiveEventList.length; i++){      MonoTypeWebFonts._inActiveEventList[i].call(MonoTypeWebFonts);  }},active:function(){  MonoTypeWebFonts.cleanup();  for(var i=0; i<MonoTypeWebFonts._activeEventList.length; i++){      MonoTypeWebFonts._activeEventList[i].call(MonoTypeWebFonts);  }}});};MonoTypeWebFonts.loadFonts();MonoTypeWebFonts.RefreshFonts=function(){MonoTypeWebFonts.cleanupExecuted = false;if(document.getElementById('mti_stylesheet_e32a88dd-64b2-47c3-a2fd-71786263728a')!=null){var nodeToRemove1 = document.getElementById('mti_stylesheet_e32a88dd-64b2-47c3-a2fd-71786263728a');var parentNode1 = nodeToRemove1.parentNode;parentNode1.removeChild(nodeToRemove1);}if(document.getElementById('mti_fontface_e32a88dd-64b2-47c3-a2fd-71786263728a')!=null){var nodeToRemove2 = document.getElementById('mti_fontface_e32a88dd-64b2-47c3-a2fd-71786263728a');var parentNode2 = nodeToRemove2.parentNode;parentNode2.removeChild(nodeToRemove2);}MonoTypeWebFonts.loadFonts();};MonoTypeWebFonts.loadColo = function(){};setTimeout(function(){ MonoTypeWebFonts.cleanup(); }, 6000);