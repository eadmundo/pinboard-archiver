/**
 * embeddedComments.js
 * $Id: embeddedComments.js 115014 2012-11-02 19:29:19Z reed.emmons $
 */
/*global console, window*/

if (window.console === undefined) {
    window.console = {
        log: function () {}
    };
}

var _debug = false;
var NYTD = NYTD || {};

function EmbeddedComments($, objName) {
    var that = this;
    var callbackPrefix = objName + '.';
    var state = {};
    var config = {};
    var DOMCache = {};
    var wrapper = NYTD.Hosts.wwwHost + '/svc/community/V3/requestHandler';
    var WTobj = {};

    this.init = function (args) {
        if (_debug) {
            console.log('init()');
        }

        var pageUrl = args.pageUrl || window.location.href;
        var re = /[?].*/;
        var re2 = /[#].*/;
        if (re.test(pageUrl)) {
            pageUrl = pageUrl.replace(re, '');
        }
        if (re2.test(pageUrl)) {
            pageUrl = pageUrl.replace(re2, '');
        }

        var configName = args.config || 'default';

        if (!that.commentsConfig.hasOwnProperty(configName)) {
            configName = 'default';
        }
        config = that.commentsConfig[configName];
        that.pageUrl = encodeURIComponent(pageUrl);
        state = {
            displayStyle: 'normal',
            assetTaxonomy: '',
            containDiv: $("#commentsContainer"),
            commentState: 'notLoaded',
            loaded: false,
            commentCounts: {
                all: 0,
                readerpicks: 0,
                nytpicks: 0,
                nytreplies: 0
            },
            currentTabCount: 0,
            offset: 0,
            canSubmit: true,
            commentFormLocation: 'notyet',
            replyFormLocation: undefined,
            currentTab: undefined,
            currentSort: config.defaultSort,
            //1 is newest first, 0 is oldest first
            userData: undefined,
            userID: 0,
            userEmail: undefined,
            lastPostedInfo: {},
            isScrollEventLoaded: false,
            permid: undefined,
            sharetitle: $("meta[name=hdl]").attr("content"),
            commentNotify: 0,
            gotoCommentFormNow: false,
            permidURL: window.location.href,
            WTstats: {
                comments: {},
                replies: {},
                tablist: {}
            }
        };

        //HACK
        if (state.containDiv.length === 0) {
            state.containDiv = $("#commentsColumnGroup");
        }

        if (!state.sharetitle) {
            state.sharetitle = document.title;
        }

        //Clean up permidURL
        state.permidURL = state.permidURL.replace(/#.+$/, '');
        state.permidURL = state.permidURL.replace(/[?].*$/, '');
        state.permidURL += '?comments';

        var hashref = window.location.hash;
        var hashRegex = /^#permid=(\d+(:\d+)*)$/;
        var permidParts = hashRegex.exec(hashref);
        if (permidParts === null) {
            var queryStr = window.location.search;
            var queryRegex = /[?&]permid=(\d+(:\d+)*)/;
            permidParts = queryRegex.exec(queryStr);
        }

        if (permidParts !== null && permidParts[1]) {
            state.displayStyle = 'permalink';
            config.defaultTab = 'permalink';
            state.permid = permidParts[1];
            window.scrollTo(0, state.containDiv.offset().top - 15);
        }

        var re4 = /^#postcomment$/;
        if (re4.test(hashref)) {
            if (_debug) {
                console.log('postcomment');
            }
            state.gotoCommentFormNow = true;
            window.scrollTo(0, state.containDiv.offset().top - 15);
        }

        if (!args.assetTaxonomy) {

            var communityAssetTaxonomy = $("meta[name=communityAssetTaxonomy]").attr("content");
            if (communityAssetTaxonomy && communityAssetTaxonomy !== '') {
                state.assetTaxonomy = communityAssetTaxonomy;
            } else {
                var tempArr = [];
                var CG = $("meta[name=CG]").attr("content");
                var hdl_p = $("meta[name=hdl_p]").attr("content");
                var hdl = $("meta[name=hdl]").attr("content");

                if (CG && CG !== '') {
                    tempArr.push(CG);
                }
                if (hdl_p && hdl_p !== '') {
                    if (typeof hdl === 'string') {
                        hdl_p = hdl_p.replace(/\&\#\d+\;/g, ""); //removes &#123;
                    }
                    tempArr.push(hdl_p);
                } else if (hdl && hdl !== '') {
                    if (typeof hdl === 'string') {
                        hdl =  hdl.replace(/\&\#\d+\;/g, "");
                    }
                    tempArr.push(hdl);
                }
                state.assetTaxonomy = tempArr.join('/');

                var slug = $("meta[name=slug]").attr("content");
                if (slug && slug !== '') {
                    state.assetTaxonomy += ' (' + slug + ')';
                }

            }
        } else {
            state.assetTaxonomy = args.assetTaxonomy;
        }

        that.run();
    };

    this.run = function () {
        if (_debug) {
            console.log('run()');
        }
        that.loadBasicInfo();
    };

    this.WTsetup = function () {
        var WTelement;

        //Tell the browser to contact WT when we navigate away
        $(window).bind('beforeunload', function () {
            that.WTaction('tabSummary');
            that.WTaction('totalComments');
            NYTD.Webtrends.MultitrackQueue.register();
        });

        //Setup the meta tags
        that.WTobj = {
            'DCS.dcssip': window.location.hostname,
            'WT.ti': document.title,
            'WT.cg_n': $("meta[name=CG]").attr("content"),
            'WT.cg_s': $("meta[name=SCG]").attr("content"),
            'WT.z_gpt': $("meta[name=PT]").attr("content"),
            'WT.z_gpst': $("meta[name=PST]").attr("content"),
            'WT.z_gpsst': $("meta[name=PSST]").attr("content"),
            'WT.z_gpssst': $("meta[name=PSSST]").attr("content"),
            'WT.z_dcsm': 1,
            'WT.gcom': 'Com',
            'WT.z_stuf': '1'
        };

        for (WTelement in that.WTobj) {
            if (that.WTobj.hasOwnProperty(WTelement)) {
                if (that.WTobj[WTelement] === undefined) {
                    that.WTobj[WTelement] = '';
                }
            }
        }
    };

    this.immediateTrack = function (e) {
        var hKey,
            items = [],
            header = that.WTobj,
            additionalItems = (e.data) ? e.data : {};
        
        //default WT params
        for (hKey in header) {
            if (header.hasOwnProperty(hKey)) {
                if (typeof header[hKey] === "string") {
                    header[hKey] = header[hKey].replace(/\'/g, "%27");
                }
                items.push(hKey, header[hKey]);
            }
        }

        //additional params
        for (hKey in additionalItems) {
            if (additionalItems.hasOwnProperty(hKey)) {
                items.push(hKey, additionalItems[hKey]);
            }
        }

        window.dcsMultiTrack.apply(window, items);
    };

    this.WTactionPassthru = function (e) {
        if (e.data && e.data.action) {
            if (_debug) {
                console.log('WTactionPassthru', e.data.action);
            }
            that.WTaction(e.data.action);
        }
    };

    this.WTaction = function (action) {
        if (_debug) {
            console.log('WTaction', action);
        }
        var localWTobj = {};
        var doSomething = true;
        var tab;
        switch (action) {
        case 'login':
            localWTobj['WT.z_ract'] = 'CommentLogin';
            localWTobj['WT.z_rprod'] = $("meta[name=PT]").attr("content") + '-' + $("meta[name=PST]").attr("content");
            break;
        case 'register':
            localWTobj['WT.z_ract'] = 'CommentRegi';
            localWTobj['WT.z_rprod'] = $("meta[name=PT]").attr("content") + '-' + $("meta[name=PST]").attr("content");
            break;
        case 'readMoreComments':
            localWTobj['WT.z_aca'] = 'More-coms';
            break;
        case 'postCommentProfileNo':
            localWTobj['WT.z_aca'] = 'Post';
            localWTobj['WT.z_acp'] = 0;
            break;
        case 'postCommentProfileYes':
            localWTobj['WT.z_aca'] = 'Post';
            localWTobj['WT.z_acp'] = 1;
            break;
        case 'postReplyProfileNo':
            localWTobj['WT.z_aca'] = 'Reply';
            localWTobj['WT.z_acp'] = 0;
            break;
        case 'postReplyProfileYes':
            localWTobj['WT.z_aca'] = 'Reply';
            localWTobj['WT.z_acp'] = 1;
            break;
        case 'showAllReplies':
            localWTobj['WT.z_aca'] = 'All-replies';
            break;
        case 'viewUserProfile':
            localWTobj['WT.z_aca'] = 'Profile';
            break;
        case 'recommend':
            localWTobj['WT.z_aca'] = 'Rec';
            break;
        case 'unrecommend':
            localWTobj['WT.z_aca'] = 'Un-Rec';
            break;
        case 'shareFB':
            localWTobj['WT.z_acs'] = 'FB';
            break;
        case 'shareTwitter':
            localWTobj['WT.z_acs'] = 'Twitter';
            break;
        case 'totalComments':
            localWTobj['WT.z_acv'] = that.countProperties(state.WTstats.comments);
            localWTobj['WT.z_acrv'] = that.countProperties(state.WTstats.replies);
            break;
        case 'tabSummary':
            localWTobj['WT.z_aca'] = '';
            for (tab in state.WTstats.tablist) {
                if (state.WTstats.tablist.hasOwnProperty(tab)) {
                    if (localWTobj['WT.z_aca'] !== '') {
                        localWTobj['WT.z_aca'] += '-';
                    }
                    localWTobj['WT.z_aca'] += tab;
                }
            }
            if (localWTobj['WT.z_aca'] === '') {
                doSomething = false;
            }
            break;
        default:
            doSomething = false;
        }
        if (doSomething === true) {
            NYTD.Webtrends.MultitrackQueue.track(localWTobj, that.WTobj);
        }
    };

    this.countProperties = function (obj) {
        var count = 0;
        var prop;
        for (prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                ++count;
            }
        }
        return count;
    };

    this.setupLoadEvent = function () {
        if (_debug) {
            console.log('setupLoadEvent', state.isScrollEventLoaded);
        }
        
        var shouldWeLoad;
        var loadCommentsAfterScroll = function () {
            if (state.commentState === 'notLoaded') {
                shouldWeLoad = that.checkToLoadDiv();
                if (shouldWeLoad) {
                    that.WTsetup();
                    $(window).off('scroll', loadCommentsAfterScroll);
                    that.showComments(config.defaultTab, false);
                    $(document).trigger('NYTD:EmbeddedCommentsStarted');
                }
            }
        };

        if (state.isScrollEventLoaded === false) {
            state.isScrollEventLoaded = true;
            shouldWeLoad = that.checkToLoadDiv();
            
            if (shouldWeLoad) {
                $(document).on('NYTD:CommentSetupComplete', function () {
                    that.WTsetup();
                    that.showComments(config.defaultTab, false);
                    $(document).trigger('NYTD:EmbeddedCommentsStarted');
                });
            } else {
                $(window).on('scroll', loadCommentsAfterScroll);
            }
        }
    };

    this.showCommentsViaEvent = function (e) {
        that.removePeek();
        if (_debug) {
            console.log('showCommentsViaEvent()', e);
        }
        if (e.hasOwnProperty('preventDefault')) {
            e.preventDefault();
        }
        var displayType = e.data.tabName;
        state.WTstats.tablist[displayType] = 1;

        if (displayType === 'permalink') {
            state.currentTab = 'permalink';
            state.displayStyle = 'normal';
            window.location.hash = '#comments';
            that.drawNavBar();
            displayType = 'all';
        }

        $('#toggleFormButton').unbind('click');
        $('#toggleFormButton').click(that.showCommentForm);
        that.showComments(displayType, false);
        $('#commentFormTop').html('');
        that.hideMe($('#commentFormBottom').html(''));
        state.commentFormLocation = "bottom";
        that.drawCommentForm();
    };

    this.showComments = function (displayType, sortToggle) {
        if (_debug) {
            console.log('showComments -> ' + displayType + ' , ' + state.currentTab, sortToggle);
        }

        if (!displayType || displayType !== state.currentTab || sortToggle === true) {
            state.loaded = false;
            if (!state.currentTab) {
                state.currentTab = config.defaultTab;
            } else {
                state.currentTab = displayType;
            }
            state.currentTabCount = state.commentCounts[state.currentTab];

            //Switch Tabs Here
            var tabWeAreLookingFor = '#commentsNav';
            switch (displayType) {
            case 'readerpicks':
                tabWeAreLookingFor = tabWeAreLookingFor + 'ReaderPicks';
                break;
            case 'nytpicks':
                tabWeAreLookingFor = tabWeAreLookingFor + 'NYTPicks';
                break;
            case 'nytreplies':
                tabWeAreLookingFor = tabWeAreLookingFor + 'NYTReplies';
                break;
            case 'all':
                tabWeAreLookingFor = tabWeAreLookingFor + 'All';
                break;
            default:
                tabWeAreLookingFor = tabWeAreLookingFor + 'All';
                break;
            }
            var tabList = ['#commentsNavAll', '#commentsNavReaderPicks', '#commentsNavNYTPicks', '#commentsNavNYTReplies'];
            if (_debug) {
                console.log('tabWeAreLookingFor=' + tabWeAreLookingFor);
            }
            var tab;
            for (tab = 0; tab < tabList.length; tab++) {
                var tabId = tabList[tab];
                if (tabId == tabWeAreLookingFor) {
                    $(tabId).addClass('selected');
                    $(tabList[tab - 1]).addClass('precedesSelected');
                } else {
                    if ($(tabId).hasClass('selected')) {
                        $(tabId).removeClass('selected');
                    }
                    if ($(tabId).hasClass('precedesSelected')) {
                        $(tabId).removeClass('precedesSelected');
                    }
                }
            }

            $('#sortToggle').unbind('click');
            if (displayType === 'all') {
                $('#sortToggle').show();
                $('#sortToggle').click(that.toggleSort);
                if (sortToggle === false) {
                    state.currentSort = config.defaultSort;
                }
            } else {
                $('#sortToggle').hide();
            }

            state.offset = 0;
            that.loadComments(displayType);
        }
    };

    this.flagComment = function (evt) {
        var reasons = '';
        var i;
        for (i = 0; i < evt.data.checkboxes.length; i++) {
            if (evt.data.checkboxes[i].checked) {
                reasons += evt.data.checkboxes[i].value + ',';
            }
        }
        reasons = reasons.substr(0, reasons.length - 1);

        var postdata = {
            url: that.pageUrl,
            commentID: evt.data.commentID,
            userID: state.userID,
            commentLabels: reasons
        };

        that.loadContent({
            postdata: postdata,
            method: 'post',
            cmd: 'FlagComment'
        }, 'processFlagComment');
    };

    this.toggleFlag = function (commentID) {
        that.accessDOM('#comment' + commentID + ' .commentFlagContainer').html(config.commentFlagged());
    };

    this.processFlagComment = function (cmt) {
        if (cmt.results) {
            that.toggleFlag(cmt.results.commentID);
        }
    };

    this.accessDOM = function (DOMObjectName) {
        //HACK BUT LETS SEE IF THIS HELPS!
        return $(DOMObjectName);
    };

    this.toggleSort = function () {
        if (_debug) {
            console.log(state.currentSort);
        }

        state.currentSort = (state.currentSort + 1) % 2;
        if (state.currentSort === 1) {
            $('#sortToggle').html('Newest');
        } else {
            $('#sortToggle').html('Oldest');
        }
        state.loaded = false;
        
        that.showComments(state.currentTab, true);

        //If the write comment module hasn't displayed yet, we need to show it.
        if ($("#commentFormControl").length === 0) {
            that.drawCommentForm();
            state.commentFormLocation = "bottom";
        }
    };

    this.loadBasicInfo = function () {
        that.loadContent({
            'cmd': 'GetBasicInfo'
        }, 'setBasicInfo');
    };

    this.setBasicInfo = function (responseData) {
        if (_debug) {
            console.log('BASICINFO:', responseData);
        }
        if (responseData) {
            state.userID = (responseData.userID !== '') ? responseData.userID : 0;
            state.userEmail = responseData.userEmail;
            state.myaccounturl = responseData.myaccounturl;
            state.timespeople = responseData.tphost;
            state.commentNotify = responseData.comment_notify;
            state.www = responseData.wwwhost;
            var jshost = NYTD.Hosts.jsHost || state.www;
            that.loadJSFile(jshost + '/js/common/sharetools/1.0/multishare.js');
            that.loadJSFile(jshost + '/js/app/analytics/multitrackQueueV2.js');
            if (!window.JSON) {
                that.loadJSFile(jshost + '/js/app/lib/json/json2-min.js');
            }

            that.loadCommentHeader();
        }
    };

    this.loadCommentHeader = function () {

        that.loadContent({
            cmd: 'GetCommentSummary',
            getdata: {
                url: that.pageUrl
            }
        }, 'drawCommentHeader');
    };

    this.checkToLoadDiv = function () {

        var hashref = window.location.hash;
        var re4 = /^#postcomment$/;
        if (re4.test(hashref)) {
            if (_debug) {
                console.log('postcomment');
            }
            state.gotoCommentFormNow = true;
            window.scrollTo(0, state.containDiv.offset().top - 15);
            return true;
        }
        if (state.gotoCommentFormNow === true) {
            return true;
        }
        if (state.displayStyle === 'permalink') {
            return true;
        }
        var commentsTop = state.containDiv.offset().top;
        if (commentsTop < ($(window).height() + $(window).scrollTop())) {
            return true;
        }
        return false;
    };

    this.loadContent = function (params, callbackName) {

        var method = params.method || 'get';
        var args = {
            method: method,
            cmd: params.cmd
        };
        var element;

        if (params.getdata) {
            for (element in params.getdata) {
                if (params.getdata.hasOwnProperty(element)) {
                    args[element] = params.getdata[element];
                }
            }
        }

        if (params.postdata) {
            args.postdata = JSON.stringify(params.postdata);
        }
        callbackName = callbackPrefix + callbackName;

        $.ajax({
            url: wrapper,
            data: args,
            dataType: "jsonp",
            jsonp: "callback",
            jsonpCallback: callbackName
        });
    };

    this.drawCommentHeader = function (cmt) {

        if (_debug) {
            console.log('drawCommentHeader', cmt);
        }

        if (cmt.results && cmt.results.api_timestamp > 0) {
            state.currentTime = parseInt(cmt.results.api_timestamp, 10);
        }
        state.userData = cmt.results.userData || {};
        state.userData.hasProfile = 0;
        if ((state.userData) && (state.userData.displayName) && (state.userData.location) && (state.userData.displayName !== "null") && (state.userData.location !== "null")) {
            state.userData.hasProfile = 1;
        }
        if (!state.userData.sharing) {
            state.userData.sharing = 0;
        }

        if (cmt.results && cmt.results.sortBy && state.displayStyle !== 'permalink') {
            switch (cmt.results.sortBy) {
            case 'comment-list-sort-approvedate':
                config.defaultTab = 'all';
                config.defaultSort = 0;
                state.currentSort = 0;
                break;
            case 'comment-list-sort-approvedate-desc':
                config.defaultTab = 'all';
                config.defaultSort = 1;
                state.currentSort = 1;
                break;
            case 'comment-list-sort-recommended':
                config.defaultTab = 'readerpicks';
                break;
            case 'comment-list-sort-editors':
                config.defaultTab = 'nytpicks';
                break;
            case 'comment-list-sort-replies':
                config.defaultTab = 'nytreplies';
                break;
            }
        }
        that.drawCommentsModule();

        state.canSubmit = cmt.results.canSubmit;
        state.commentCounts = {
            all: cmt.results.totalParentCommentsFound,
            nytpicks: cmt.results.totalEditorsSelectionFound,
            readerpicks: cmt.results.totalRecommendationsFound,
            nytreplies: cmt.results.totalReporterReplyCommentsFound
        };

        var data = {
            cCount: cmt.results.totalCommentsFound,
            commentQuestion: cmt.results.commentQuestion
        };

        $(config.commentsHeaderData(data)).appendTo(that.accessDOM('#commentsHeaderData'));
        
        //Byline comment tag with click tracking
        var $articleDateline = $('#article .dateline');
        if ($articleDateline.length > 0) {
            $articleDateline
                .append(config.bylineCommentMarker(data))
                .on('click', '.commentCountLink', {'WT.z_aca': 'Coms-Byline'}, that.immediateTrack);
        }

        if ($.browser.msie && $.browser.version < 7) {
            $('#commentsHeaderData').append(config.ie6Message());
        } else {
            that.drawNavBar();
            that.drawCommentDisplay();
            if (state.canSubmit === true && cmt.results.totalCommentsFound > 0) {
                that.accessDOM('#toggleFormButton').click(that.showCommentForm);
            }
        }
        $(document).trigger('NYTD:CommentSetupComplete');
    };

    this.drawCommentsModule = function () {
        if (_debug) {
            console.log('drawCommentsModule()');
        }
        state.containDiv.append(config.commentsModuleDiv());
    };

    this.drawNavBar = function () {
        if (_debug) {
            console.log('drawNavBar()');
        }

        var data = {
            style: state.displayStyle,
            readerpicksct: state.commentCounts.readerpicks,
            nytpicksct: state.commentCounts.nytpicks,
            nytrepliesct: state.commentCounts.nytreplies,
            canSubmit: state.canSubmit,
            sortText: 'Newest'
        };

        if (state.currentSort === 0) {
            data.sortText = 'Oldest';
        }
        $('#commentsNavBar').replaceWith(config.navbar(data));
        $('#commentsNavBar li:last-child').addClass('lastItem');

        if (state.displayStyle === 'normal') {
            $('#commentsNavAll').unbind('click');
            $('#commentsNavReaderPicks').unbind('click');
            $('#commentsNavNYTPicks').unbind('click');
            $('#commentsNavNYTReplies').unbind('click');

            $('#commentsNavAll').click({
                tabName: 'all'
            }, that.showCommentsViaEvent);
            if (state.commentCounts.readerpicks > 0) {
                $('#commentsNavReaderPicks').click({
                    tabName: 'readerpicks'
                }, that.showCommentsViaEvent);
            }
            if (state.commentCounts.nytpicks > 0) {
                $('#commentsNavNYTPicks').click({
                    tabName: 'nytpicks'
                }, that.showCommentsViaEvent);
            }
            if (state.commentCounts.nytreplies > 0) {
                $('#commentsNavNYTReplies').click({
                    tabName: 'nytreplies'
                }, that.showCommentsViaEvent);
            }
        } else if (state.displayStyle === 'permalink') {
            $('#commentsRefer').unbind('click');
            $('#commentsRefer').click({
                tabName: 'permalink'
            }, that.showCommentsViaEvent);
        }
    };

    this.drawCommentDisplay = function () {
        if (state.loaded === false) {
            if (_debug) {
                console.log('drawCommentDisplay()');
            }
            $("#commentsDisplayContainer").html(config.commentDisplay());

            that.setupLoadEvent();
        }
    };

    this.showCommentForm = function () {
        if (_debug) {
            console.log('showCommentForm()');
        }
        that.removePeek();

        if (state.replyFormLocation) {
            $(state.replyFormLocation).remove();
            state.replyFormLocation = undefined;
        }
        if (state.commentFormLocation !== 'top') {
            that.showMe($('#commentFormTop').prepend($('#commentFormControl')), true);
            that.hideMe($('#commentFormBottom').html(''));
            state.commentFormLocation = 'top';
            $('#commentFormControl').removeClass('hidden');
            if ($('#commentFormControl').next().hasClass('commentConfirmation')) {
                $('#commentFormControl .doubleRuleDivider').addClass('hidden');
            }
        }
    };

    this.hideCommentForm = function () {
        if (_debug) {
            console.log('hideCommentForm()');
        }
        that.removePeek();
        $('#commentFormControl').addClass('hidden');
        state.commentFormLocation = 'hidden';
    };

    this.clearCommentForm = function () {
        if (_debug) {
            console.log("clearCommentForm()");
        }
        $('#commentTextarea, #commenterFullNameInput, #commenterLocationInput').val('');
        that.hideMe('#submitLoader'); // Hide Loader
    };

    this.removePeek = function () {
        if (state.commentState === 'peek') {
            state.commentState = 'loaded';
            that.accessDOM('#commentsList').removeClass('commentsListPeek').attr('style', '');
            that.accessDOM('#commentsFooter').removeClass('commentsFooterPeek').attr('style', '');
            that.drawCommentForm();
            if (state.offset >= state.currentTabCount) {
                $('#commentsFooter').removeClass('singleRule');
                $('#commentsFooter').html('');
                $('#commentsReadMoreToggle').unbind('click');
            }
        }
    };

    this.drawCommentForm = function (commentID) {
        if (_debug) {
            console.log('drawCommentForm()', commentID, state.replyFormLocation);
        }

        //If commentID === undefined then this is the form to add a new Comment
        //If commentID !== undefined then this is a reply to a comment.
        if (state.canSubmit === true) {

            var data = {
                hasProfile: state.userData.hasProfile,
                displayName: that.removeHTML("<a href='#top'>" + state.userData.displayName + "</a>"),
                location: that.removeHTML(state.userData.location),
                title: state.userData.title,
                email: state.userEmail,
                trusted: state.userData.trusted,
                charCount: config.maxCommentSize,
                commentID: commentID,
                picURL: state.userData.picURL,
                myaccountfeedbackurl: state.myaccounturl + '/membercenter/feedback.html',
                register: state.myaccounturl + '/register?URI=' + that.pageUrl,
                myaccount: state.myaccounturl,
                membercenter: state.myaccounturl + '/membercenter',
                faq: state.www + '/content/help/site/usercontent/usercontent.html',
                forgot: state.www + '/forgot',
                commentNotify: state.commentNotify,
                becomeTrusted: false,
                getStartedURL: state.timespeople + '/view/user/' + state.userID + '/settings.html',
                userIsNotTrusted: true,
                showYou: false
            };

            var commentForm;

            if (!commentID) {
                data.formType = 'comment';
                data.commentID = '';
            } else {
                data.formType = 'reply';
                if (state.replyFormLocation) {
                    that.accessDOM(state.replyFormLocation).remove();
                }
                state.replyFormLocation = '#replyForm' + commentID;
            }

            if (data.formType === 'comment') {
                if (state.userID === 0 || state.userID === "0") {
                    commentForm = config.loginToComment;
                } else {
                    if ((state.userData.trusted === 0) && (state.userData.invitation) && (state.userData.invitation.length > 0) && (state.userData.invitation[0].userID) && (state.userData.invitation[0].userID > 0) && (state.userData.invitation[0].status) && (state.userData.invitation[0].status === "sent") && (Math.floor(Math.random() * 4) === 0)) {
                        data.becomeTrusted = true;
                    }

                    data.userURL = data.getStartedURL;
                    commentForm = config.commentForm;
                }
                $(commentForm(data)).appendTo($('#commentFormBottom'));
                that.showMe($('#commentFormBottom'), true);
                that.hideMe('#commentFormError');
                $('#commentTextarea').focus(function () {
                    $(this).removeClass('placeholder');
                });
                $('#commentTextarea').change('', that.eventCommentTextarea);
                $('#commentTextarea').keyup('', that.eventCommentTextarea);
            } else {
                that.accessDOM('#replylist_' + data.commentID).prepend(config.commentForm(data)).addClass('hidden');
                that.showMe($('#replylist_' + data.commentID), true);
                that.hideMe('#commentFormError' + data.commentID);
                that.accessDOM('#commentTextarea' + data.commentID).focus(function () {
                    $(this).removeClass('placeholder');
                });
                that.accessDOM('#commentTextarea' + data.commentID).change(data.commentID, that.eventCommentTextarea);
                that.accessDOM('#commentTextarea' + data.commentID).keyup(data.commentID, that.eventCommentTextarea);

                that.accessDOM('#replyForm' + commentID).hover(function () {
                    that.accessDOM('#comment' + commentID).removeClass('commentActive').addClass('commentReplyActive');
                    $(this).addClass('commentReplyActive');
                }, function () {
                    that.accessDOM('#comment' + commentID).addClass('commentActive').removeClass('commentReplyActive');
                    $(this).removeClass('commentReplyActive');
                });
            }

            if (data.commentNotify === 1) {
                that.accessDOM('#commentNotify' + data.commentID).attr('checked', 'checked');
            }

            var logInDialogBox;
            var logInIcon;
            if (state.userID === 0 || state.userID === "0") {
                $(config.dialogBoxLogIn(data)).insertBefore($('#dialogBoxLoginLink'));
                logInDialogBox = that.accessDOM('#commentFormControl .dialogBoxLogin');
                logInIcon = logInDialogBox.next('#dialogBoxLoginLink');
            } else {
                $(config.dialogBoxLogIn(data)).insertBefore($('#commentForm' + data.commentID + ' .formHint'));
                logInDialogBox = $('#commentForm' + data.commentID + ' .dialogBoxLogin');
                logInIcon = logInDialogBox.next('.formHint');
            }
            $('#commentsLoginForm').submit(function () {
                that.WTaction('login');
                return true;
            });

            var logInCloseButtons = logInDialogBox.find('.dialogBoxClose, .cancelButton');
            that.addDialogBoxFunctions(logInDialogBox, logInIcon, logInCloseButtons, false, true);

            if (state.userData.trusted === 1) {
                data.userIsNotTrusted = false;
                data.showYou = true;
                $(config.dialogBoxTrusted(data)).insertBefore($('#commentForm' + data.commentID + ' .commenterTrustedIcon'));
                var trustedDialogBox = that.accessDOM('#commentForm' + data.commentID + ' .commenterMetaList').find('.dialogBoxTrusted');
                var trustedIcon = that.accessDOM('#commentForm' + data.commentID + ' .commenterMetaList').find('.commenterTrustedIcon');
                var trustedCloseButtons = trustedDialogBox.find('.dialogBoxClose');
                that.addDialogBoxFunctions(trustedDialogBox, trustedIcon, trustedCloseButtons);
            }

            if ($('#registerLink')) {
                $('#registerLink').unbind('click');
                $('#registerLink').click(function () {
                    that.WTaction('register');
                    window.location = data.register;
                });
            }
        }
    };

    this.addDialogBoxFunctions = function (dialogBox, icon, closeButtons, persistentIcon, clickRequired) {
        var hideTimeout;
        var showTimeout;
        dialogBox.hide();

        var dialogTimedHide = function () {
                // only do this if the dialog is currently on
                if (dialogBox.css('display') !== 'none') {
                    if (persistentIcon) {
                        icon.css('display', 'block');
                    }
                    hideTimeout = setTimeout(function () {
                        dialogBox.hide(10, function () {
                            if (persistentIcon) {
                                icon.attr('style', '');
                            }
                        });
                    }, 1000);
                }
            };
        var killTimer = function (timerToKill) {
                clearTimeout(timerToKill);
            };

        var showDialogBox = function () {
                if (state.commentState !== 'peek') {
                    if (dialogBox.hasClass('dialogBoxTrusted')) {
                        dialogBox.find('.dialogBoxPointerUp').removeClass('dialogBoxPointerUp').addClass('dialogBoxPointer');
                    }
                    if (dialogBox.hasClass('dialogBoxLogin')) {
                        that.loadToken();
                    }
                }
                dialogBox.show();
            };

        closeButtons.click(function (e) {
            e.preventDefault();
            dialogBox.hide(10, function () {
                if (persistentIcon) {
                    icon.attr('style', '');
                }
            });
        });
        if (clickRequired) {
            icon.click(function (e) {
                e.preventDefault();
                showDialogBox();
                killTimer(hideTimeout);
            });
        } else {
            icon.hover(function () {
                showTimeout = setTimeout(function () {
                    showDialogBox();
                    killTimer(hideTimeout);
                }, 500);
            }, function () {
                killTimer(showTimeout);
            });
        }

        icon.mouseleave(function () {
            dialogTimedHide();
        });

        dialogBox.hover(function () {
            killTimer(hideTimeout);
        }, function () {
            dialogTimedHide();
        });
    };

    this.loadToken = function () {
        if (_debug) {
            console.log('loadToken');
        }
        var callbackName = String(String.fromCharCode(97 + Math.round(Math.random() * 25)) + (new Date()).getTime()),
            script = document.createElement('script');
        script.src = "http://www.nytimes.com/svc/profile/token.jsonp?callback=" + callbackName;
        window[callbackName] = that.processToken;
        document.getElementsByTagName('head')[0].appendChild(script);
    };

    this.processToken = function (responseData) {
        if (_debug) {
            console.log('processToken ', responseData);
        }
        if (responseData.data.token) {
            var action = $('#commentsLoginForm').attr('action');
            if (action.indexOf('URI=') < 0) {
                $('#commentsLoginForm').attr('action', action + '?URI=' + that.getURI());
            }
            $('#commentsLoginToken').val(responseData.data.token);
            $('#commentsLoginExpires').val(new Date().getTime() + 930000);
        }
    };

    this.getURI = function () {
        var anchor = '#comments';
        var uri = window.location.href.replace(/[\?&]+gwh=[^&]+/, '').split("#")[0],
            parts = uri.split("?"),
            base = parts[0],
            search = parts[1];
        if (search) {
            search = encodeURIComponent(search + anchor);
            uri = base + "&OQ=" + search;
        } else {
            uri = base + encodeURIComponent(anchor);
        }
        if (_debug) {
            console.log(uri);
        }
        return uri;
    };

    this.eventCommentTextarea = function (e) {

        var commentID = e.data;

        var commentText = that.accessDOM('#commentTextarea' + commentID).val();
        var charCount = commentText.length;

        //Resize <textarea>
        $('#commentTextareaHidden' + commentID).width($('#commentTextarea' + commentID).width());
        that.accessDOM('#commentTextareaHidden' + commentID).html(commentText.replace(/\n/g, '<br/>'));
        var divHeight = $('#commentTextareaHidden' + commentID).height();
        var newHeight = Math.ceil(divHeight / 115) * 115 + 15;
        if (newHeight > 130) {
            that.accessDOM('#commentTextarea' + commentID).height(newHeight);
        }

        var leftOverCharCount = config.maxCommentSize - charCount;

        that.accessDOM('#commentCharCount' + commentID).html(leftOverCharCount);
        that.accessDOM('#submitComment' + commentID).unbind();
        that.accessDOM('#submitComment' + commentID).attr('disabled', 'disabled');


        if (leftOverCharCount < 0) {
            that.accessDOM('#commentCharCount' + commentID).addClass('error').html(leftOverCharCount + ' ' + config.charCountError());
            that.accessDOM('#submitComment' + commentID).addClass('applicationButtonInactive');
            that.showMe('#commentFormError' + commentID);
        } else if (leftOverCharCount === config.maxCommentSize) {
            that.accessDOM('#commentTextarea').addClass('placeholder');
            that.accessDOM('#submitComment' + commentID).addClass('applicationButtonInactive').unbind();
        } else {
            that.accessDOM('#commentTextarea' + commentID).removeClass('placeholder');
            that.hideMe('#commentFormError' + commentID);
            that.accessDOM('#commentCharCount' + commentID).removeClass('error');
            that.accessDOM('#submitComment' + commentID).removeClass('applicationButtonInactive');
            that.accessDOM('#submitComment' + commentID).removeAttr('disabled');
            that.accessDOM('#submitComment' + commentID).click(commentID, that.postComment);
        }
    };

    this.postComment = function (e) {

        e.preventDefault();
        var commentID = e.data;
        if (_debug) {
            console.log('postComment()', commentID);
        }

        that.showMe('#submitLoader' + commentID); // Show Loader
        that.hideMe('#commentFormAPIError' + commentID);

        var cmtText = that.accessDOM('#commentTextarea' + commentID).val();

        var postData = {
            userID: state.userID,
            userEmail: 'REPLACEMEWITHREALDATA',
            userDisplayName: that.removeHTML(state.userData.displayName),
            userLocation: that.removeHTML(state.userData.location),
            url: that.pageUrl,
            commentBody: cmtText,
            commentTitle: 'n/a',
            assetTaxonomy: encodeURIComponent(state.assetTaxonomy),
            commentType: 'comment',
            parentID: 0,
            timespeoplegetstart: state.timespeople + '/view/user/' + state.userID + '/settings.html'
        };

        var ok = true;
        if (state.userData.hasProfile === 0) {
            var userDisplayName = $.trim($('#commenterFullNameInput').val());
            var userLocation = $.trim($('#commenterLocationInput').val());
            if (_debug) {
                console.log(userLocation);
            }
            
            //the regex checks for html tags and email address.
            if (!userDisplayName || userDisplayName.length === 0 || userDisplayName.match(/^([a-zA-Z0-9])+([a-zA-Z0-9\._-])*@([a-zA-Z0-9_-])+([a-zA-Z0-9\._-]+)+$/) || userDisplayName.match(/<[^>]+>/i) || !userLocation || userLocation.length === 0 || userLocation.match(/<[^>]+>/ig) || userLocation.match(/^([a-zA-Z0-9])+([a-zA-Z0-9\._-])*@([a-zA-Z0-9_-])+([a-zA-Z0-9\._-]+)+$/)) {
                that.accessDOM('#commentFormAPIError' + commentID).html(config.invalidUserInfo());
                that.showMe('#commentFormAPIError' + commentID);
                ok = false;
                that.hideMe('#submitLoader' + commentID); // Hide Loader
            } else {
                postData.userDisplayName = userDisplayName;
                postData.userLocation = userLocation;
            }
        }

        if (commentID !== '') {
            postData.parentID = commentID;
            postData.commentType = 'userReply';
        }

        if (ok === true && cmtText.length > 0 && cmtText.length <= config.maxCommentSize) {

            //Store this for later use
            state.lastPostedInfo = $.extend({}, postData, state.userData);
            state.lastPostedInfo.sendEmailOnApproval = $('#commentNotify').is(':checked');
            state.lastPostedInfo.email = state.userEmail;
            postData.commentBody = postData.commentBody.replace(/\+/g, '%2B');

            that.loadContent({
                cmd: 'PostComment',
                postdata: postData,
                method: 'post'
            }, 'processPostComment');

            that.loadContent({
                cmd: 'CommentNotify',
                method: (that.accessDOM('#commentNotify' + commentID).is(':checked')) ? 'post' : 'delete'
            }, 'processCommentNotify');
        }
    };

    this.processCommentNotify = function (cmt) {
        if (_debug) {
            console.log('processCommentNotify', cmt);
        }
    };

    this.processPostComment = function (cmt) {
        if (_debug) {
            console.log('processPostComment()', cmt);
        }

        if (cmt.results && cmt.results.commentID) {
            if (_debug) {
                console.log('posted');
            }
            if (state.commentFormLocation === 'notyet') {
                state.commentFormLocation = 'bottom';
            }

            if (state.lastPostedInfo.parentID === 0) {
                if (state.userData.hasProfile === 0) {
                    that.WTaction('postCommentProfileNo');
                } else {
                    that.WTaction('postCommentProfileYes');
                }
            } else {
                if (state.userData.hasProfile === 0) {
                    that.WTaction('postReplyProfileNo');
                } else {
                    that.WTaction('postReplyProfileYes');
                }
            }

            state.lastPostedInfo.commentBody = state.lastPostedInfo.commentBody.replace(/\n/ig, '<br/>');

            if (state.lastPostedInfo.parentID !== 0) {

                if ($('#commentConfirmation' + state.lastPostedInfo.parentID).length) {
                    $('#commentConfirmation' + state.lastPostedInfo.parentID).append(config.commentConfirmationComment(state.lastPostedInfo));
                } else {
                    that.accessDOM('#replylist_' + state.lastPostedInfo.parentID).before(config.commentConfirmation(state.lastPostedInfo));
                }
                that.accessDOM('#replyForm' + state.lastPostedInfo.parentID).remove();
                state.replyFormLocation = undefined;
                that.accessDOM('#replylist_' + state.lastPostedInfo.parentID).parents('.comment').removeClass('commentReplyActive');
                that.accessDOM('#replylist_' + state.lastPostedInfo.parentID).removeClass('commentReplyActive');

            } else if (state.commentFormLocation === 'top' || state.commentFormLocation === 'bottom') {

                if ($('#commentConfirmation').length) {
                    $('#commentConfirmation .commentsList').append(config.commentConfirmationComment(state.lastPostedInfo));
                } else {
                    if (state.commentFormLocation === 'top') {
                        that.accessDOM('#commentFormTop').append(config.commentConfirmation(state.lastPostedInfo));
                    } else {
                        that.accessDOM('#commentFormBottom').prepend(config.commentConfirmation(state.lastPostedInfo));
                        that.accessDOM('#commentFormBottom').removeClass('doubleRule');
                    }
                }

                if (state.commentFormLocation === 'top') {
                    that.hideCommentForm();
                }
            }

            if (state.lastPostedInfo.trusted) {
                var data = state.lastPostedInfo;
                if (data.parentID === 0) {
                    data.parentID = '';
                }

                $(config.dialogBoxTrusted(data)).insertBefore($('#commentConfirmation' + data.parentID + ' .commenterTrustedIcon'));
                var trustedDialogBox = $('#commentConfirmation' + data.parentID + ' .commenterMetaList').find('.dialogBoxTrusted');
                var trustedIcon = $('#commentConfirmation' + data.parentID + ' .commenterMetaList').find('.commenterTrustedIcon');
                var trustedCloseButtons = trustedDialogBox.find('.dialogBoxClose');
                that.addDialogBoxFunctions(trustedDialogBox, trustedIcon, trustedCloseButtons);
            }

            state.lastPostedInfo = {};
            that.clearCommentForm();

        } else {
            if (_debug) {
                console.log(state.lastPostedInfo);
            }
            var tempCommentID = '';
            if (state.lastPostedInfo.parentID) {
                tempCommentID = state.lastPostedInfo.parentID;
            }
            var errormsg = '<p class="error">An error has occurred, please try again later.</p>';
            if (cmt.errors && cmt.errors[0] === 'Not allowed' && cmt.errors[1] === 'Bad Request') {
                errormsg = '<p class="error">We see you\'ve just posted a comment. Please try again in a minute.</p>';
            }
            that.accessDOM('#commentFormAPIError' + tempCommentID).removeClass('hidden').html(errormsg);
            that.hideMe('#submitLoader' + tempCommentID); // Hide Loader
        }
    };

    this.generateReadMoreStr = function (str) {

        str = str.replace(/<br\s*\/?>\s*/ig, '<br/> ');
        str = str.replace(/\s*<\/p>\s*<p>\s*/ig, '<br/> <br/> ');
        str = str.replace(/^\s*<p>\s*/i, '');
        str = str.replace(/\s*<\/p>\s*$/i, '');

        var links = [];
        var re = /<a.+?<\/a>/i;
        var needle = re.exec(str);
        while (needle && needle.length > 0) {
            str = str.replace(needle[0], '##PLACEHOLDER' + links.length + '##');
            links.push(needle[0]);
            needle = re.exec(str);
        }

        var strParts = str.split(' ');
        var wordCount = strParts.length;
        var displayText = [];
        if (wordCount <= config.readMoreThreshold) {
            displayText[0] = str;
        } else {
            displayText[0] = strParts.slice(0, config.readMoreToShow).join(' ');
            displayText[1] = strParts.slice(config.readMoreToShow).join(' ');
        }
        var i, j;
        for (i = 0; i < links.length; i++) {
            for (j = 0; j < displayText.length; j++) {
                displayText[j] = displayText[j].replace('##PLACEHOLDER' + i + '##', links[i]);
            }
        }
        return displayText;
    };

    this.loadComments = function (displayType) {
        if (_debug) {
            console.log('loadComments(' + displayType + ')');
        }
        that.drawCommentDisplay();
        that.showMe('#commentsLoader');
        state.loaded = true;

        var cmd;
        var getData = {
            url: that.pageUrl,
            offset: state.offset
        };

        if (displayType === 'all') {
            if (state.currentSort === 1) {
                getData.sort = 'newest';
            } else {
                getData.sort = 'oldest';
            }
        }

        switch (displayType) {

        case 'all':
            cmd = 'GetCommentsAll';
            break;
        case 'readerpicks':
            cmd = 'GetCommentsReadersPicks';
            break;
        case 'nytpicks':
            cmd = 'GetCommentsNYTPicks';
            break;
        case 'nytreplies':
            cmd = 'GetCommentsNYTReplies';
            break;
        case 'permalink':
            cmd = 'GetCommentByPermid';
            delete getData.offset;
            getData.permID = state.permid.split(':', 1)[0];
            break;
        default:
            cmd = undefined;
        }

        if (cmd) {
            state.offset += config.commentsToGet;
            if (state.displayStyle !== 'permalink' && (state.offset < state.currentTabCount || state.commentState === 'notLoaded')) {
                $('#commentsFooter').addClass('singleRule');
                $("#commentsFooter").html(config.readMoreComments());
                if (state.canSubmit === false && $('#commentsClosedModule').length === 0) {
                    $('#commentsFooter').after(config.closedComments());
                }
                $('#commentsReadMoreToggle').click(that.readMoreCommentsAction);
            } else {
                $('#commentsFooter').html('');
                if (state.canSubmit === false && $('#commentsClosedModule').length === 0) {
                    $('#commentsFooter').addClass('singleRule');
                    $('#commentsFooter').after(config.closedComments());
                }
            }

            that.loadContent({
                cmd: cmd,
                getdata: getData
            }, 'drawComments');
        }
    };

    this.drawComments = function (cmt) {
        if (_debug) {
            console.log('drawComments()', cmt, state.commentState, state.displayStyle);
        }

        // if ((cmt.results.errors) && (cmt.results.errors.length) && (cmt.results.errors.length > 0)) {
        //     if (_debug) { console.log("AN API ERROR:" + cmt.results.errors); }
        // }
        var numberOfComments = cmt.results.comments.length;

        if (numberOfComments === 0) {
            that.accessDOM('#commentsModule').find('#commentDisplay').html(config.noComments());
            that.accessDOM('#toggleFormButton').unbind('click');
            that.accessDOM('#commentsList').removeClass('commentsListPeek');
            if (state.commentState === 'notLoaded') {
                state.commentState = 'loaded';
                that.drawCommentForm();
            }
        } else if (state.commentState === 'notLoaded' && config.showPeek === true && state.displayStyle !== 'permalink') {
            state.commentState = 'peek';
            that.accessDOM('#commentsList').addClass('commentsListPeek');
            that.accessDOM('#commentsFooter').addClass('commentsFooterPeek singleRule');
        } else {
            state.commentState = 'loaded';
        }

        if (state.displayStyle === 'permalink') {
            $('#toggleFormButton').unbind('click');
            $('#toggleFormButton').click(that.showCommentForm);
            $('#commentsList').removeClass('commentsListPeek');
            $('#commentFormTop').html('');
            that.hideMe($('#commentFormBottom').html(''));
            state.commentFormLocation = "bottom";
            that.drawCommentForm();
        }

        var displayHeight = 0;
        var comment;

        for (comment = 0; comment < numberOfComments; comment++) {
            var cmtData = cmt.results.comments[comment];
            var commentID = cmtData.commentID;
            var numReplies = cmtData.replies.length;
            var cmtSeq = cmtData.commentSequence;
            var data = {};

            that.drawCommentElement(cmtData, "#commentsList", state.canSubmit, true, undefined, false);

            if (numReplies > 0 && (state.currentTab === 'all' || state.currentTab === 'nytreplies' || state.displayStyle === 'permalink')) {

                if ((state.currentTab === 'all' || state.currentTab === 'nytreplies') && cmtData.replyCount > config.repliesToShowMax) {
                    data = {
                        replyCount: cmtData.replyCount,
                        commentID: commentID
                    };
                    $(config.commentActions(data)).appendTo("#commentElement2_" + commentID);
                    $('#showReplies_' + commentID).unbind('click');
                    $('#showReplies_' + commentID).click({
                        commentSequence: cmtSeq,
                        commentID: commentID
                    }, that.loadReplies);
                }
            }

            data = {commentID: commentID};
            $(config.commentReplyList(data)).appendTo('#commentElement2_' + commentID);

            if (numReplies > 0 && (state.currentTab === 'all' || state.currentTab === 'nytreplies' || state.displayStyle === 'permalink')) {
                var replyStart = 0;
                var replyEnd = numReplies;
                if ((state.currentTab === 'all' || state.currentTab === 'nytreplies') && numReplies > config.repliesToShowMax) {
                    replyStart = 1;
                    replyEnd = config.repliesToShowMax;
                }
                var i;
                
                for (i = replyStart; i < replyEnd; i++) {
                    that.drawCommentElement(cmtData.replies[i], '#replylist_' + commentID, false, true, cmtSeq);
                }
            }
            if (state.commentState === 'peek') {
                displayHeight += $('#comment' + commentID).outerHeight(true);
            }
        }

        $('#commentsList .comment.lastComment').removeClass('lastComment');
        $('#commentsList .comment:first-child, #commentsList .replyList .comment:first-child').addClass('firstComment');
        $('#commentsList .comment:last-child, #commentsList .replyList .comment:last-child').addClass('lastComment');

        that.addCommentHoverInteractions();

        that.accessDOM('#commentsLoader').hide();
        if (state.commentState === 'peek' && (displayHeight <= config.peekCommentThreshold)) {
            that.removePeek();
        }

        if (state.displayStyle === 'permalink') {
            var safePermid = '#permid' + state.permid.replace(/[:]/g, '_');
            if ($(safePermid).length !== 0) {
                window.scrollTo(0, $(safePermid).offset().top - 30);
            } else {
                // Invalid Permid so show all instead
                that.showCommentsViaEvent({
                    data: {
                        tabName: 'permalink'
                    }
                });
            }
        } else if (state.gotoCommentFormNow === true) {
            if (state.canSubmit === true) {
                that.showCommentForm();
            }
            state.gotoCommentFormNow = false;
        }
    };

    this.addCommentHoverInteractions = function (e) {

        that.accessDOM('#commentsList').bind('click', function (e) {
            that.removePeek();
            $(this).unbind(e);
        });

        $('.commentActions').hover(function () {
            var parentComment = $(this).parents('.comment');
            parentComment.removeClass('commentActive');
            $(this).addClass('actionsActive');
        }, function () {
            var parentComment = $(this).parents('.comment');
            parentComment.addClass('commentActive');
            $(this).removeClass('actionsActive');
        });

        $('.comment').hover(function () {
            // do this when you hover in
            var replyComments = $(this).find('.commentsListNested .comment');
            var originalComment = $(this).parents('#commentsList .comment');
            var i;
            if (replyComments.length) {
                for (i = 0; i < replyComments.length; i++) {
                    if (replyComments.hasClass('commentActive') || replyComments.hasClass('commentReplyActive')) {
                        $(this).removeClass('commentActive');
                    } else {
                        $(this).addClass('commentActive');
                    }
                }
                var commentActions = $(this).find('.commentActions');
                if (commentActions.hasClass('actionsActive')) {
                    $(this).removeClass('commentActive');
                }

            } else {
                if (originalComment.length) {
                    $(this).addClass('commentActive');
                    if (originalComment.hasClass('commentActive')) {
                        originalComment.removeClass('commentActive');
                    }
                } else {
                    $(this).addClass('commentActive');
                }
            }
        }, function () {
            // do this when you hover out
            var originalComment = $(this).parents('#commentsList .comment');
            if (originalComment.length) {
                originalComment.addClass('commentActive');
                $(this).removeClass('commentActive');
            } else {
                $(this).removeClass('commentActive');
            }
        });
    };

    this.loadReplies = function (e) {
        that.removePeek();
        that.WTaction('showAllReplies');
        if (_debug) {
            console.log('loadReplies', e);
        }
        var commentSequence = e.data.commentSequence;
        var commentID = e.data.commentID;
        $('#commentActionsBox_' + commentID).hide();

        that.loadContent({
            cmd: 'GetRepliesBySequence',
            getdata: {
                url: that.pageUrl,
                commentSequence: commentSequence
            }
        }, 'drawReplies');
    };

    this.drawReplies = function (cmt) {
        if (_debug) {
            console.log('drawReplies', cmt);
        }
        var j;
        for (j = 0; j < cmt.results.comments.length; j++) {
            var cmtData = cmt.results.comments[j];
            var commentID = cmtData.commentID;
            var numReplies = cmtData.replies.length - config.repliesToShowInitially;
            if (_debug) {
                console.log('replyData::', commentID, numReplies, cmtData);
            }

            while (numReplies > 0) {
                numReplies--;
                if (_debug) {
                    console.log(cmtData.replies[numReplies], '#replylist_' + commentID, false, false, cmtData.commentSequence);
                }
                that.drawCommentElement(cmtData.replies[numReplies], '#replylist_' + commentID, false, false, cmtData.commentSequence, false);
            }
        }
    };

    this.drawCommentElement = function (cmtData, where2add, showReplyLink, append, parentSeqNum, replyToAReply) {
        var i;
        //Collapse Replies to comments.
        if (!append && cmtData.commentType !== 'comment' && cmtData.replyCount > 0) {
            for (i = cmtData.replies.length; i > 0; i--) {
                that.drawCommentElement(cmtData.replies[i - 1], where2add, showReplyLink, append, parentSeqNum, true);
            }
        }

        var commentID = cmtData.commentID;
        if (_debug) {
            console.log('drawCommentElement for ' + commentID, cmtData);
        }

        //WebTrends Stats
        if (cmtData.commentType === 'comment') {
            state.WTstats.comments[commentID] = 1;
        } else {
            state.WTstats.replies[commentID] = 1;
        }

        var data = {
            commentID: commentID,
            picURL: cmtData.picURL
        };
        if (cmtData.commentType === 'reporterReply') {
            data.picURL = state.www + '/images/icons/t_icon_gray_50x50.png';
        }

        //Sometimes we get the same comment id twice. Do not show it.
        if ($('#comment' + commentID).length > 0) {
            return;
        }
        if (append) {
            $(config.commentElement(data)).appendTo(where2add);
        } else {
            $(where2add).prepend(config.commentElement(data));
        }

        var permid = cmtData.permID;
        if (!permid) {
            permid = (parentSeqNum) ? parentSeqNum + ':' : '';
            permid += cmtData.commentSequence;
        }
        var parentPermid = that.generateParentPermID(permid);
        var safePermid = permid.replace(/:/g, '_');
        var safeParentPermid = parentPermid.replace(/:/g, '_');

        data = {
            userDisplayName: that.removeHTML(cmtData.userDisplayName),
            location: that.removeHTML(cmtData.userLocation),
            trusted: cmtData.trusted,
            commentType: cmtData.commentType,
            showFlagLink: (state.userID !== 0 && cmtData.commentType !== 'reporterReply'),
            userTitle: cmtData.userTitle,
            nytPick: cmtData.editorsSelection,
            safePermid: safePermid,
            userURL: false,
            userIsNotTrusted: true,
            showYou: false
        };

        if (cmtData.commentType === 'reporterReply' && cmtData.userURL) {
            data.userURL = cmtData.userURL;
        } else if (state.userID > 0 && cmtData.userID === state.userID) {
            data.userURL = state.timespeople + '/view/user/' + state.userID + '/settings.html';
        }
        $(config.commentHeader(data)).appendTo("#commentElement2_" + commentID);

        if (data.trusted) {
            if (state.userData.trusted === 1) {
                data.userIsNotTrusted = false;
            }
            $(config.dialogBoxTrusted(data)).insertBefore($('#comment' + commentID + ' .commenterTrustedIcon'));
            var trustedDialogBox = $('#comment' + commentID + ' .commenterMetaList').find('.dialogBoxTrusted');
            var trustedIcon = $('#comment' + commentID + ' .commenterMetaList').find('.commenterTrustedIcon');
            var trustedCloseButtons = trustedDialogBox.find('.dialogBoxClose');
            that.addDialogBoxFunctions(trustedDialogBox, trustedIcon, trustedCloseButtons);
        }

        //So that we don't break things too much just comment out the next line
        var commentBodyParts = [];
        if (config.readMoreFlag) {
            commentBodyParts = that.generateReadMoreStr(cmtData.commentBody);
        } else {
            commentBodyParts = [cmtData.commentBody];
        }

        data = {
            commentID: commentID,
            commentBody: commentBodyParts[0],
            readMoreText: commentBodyParts[1]
        };
        $(config.commentBody(data)).appendTo("#commentElement2_" + commentID);

        if (commentBodyParts.length === 2 && commentBodyParts[1].length > 0) {
            $("#readMoreText_" + commentID).hide();
            $("#readMoreTextButton_" + commentID).click({
                'commentID': commentID
            }, that.readMoreTextAction);
        }

        var url2share = state.permidURL + '%23permid=' + permid;
        data = {
            permalink: permid,
            safePermid: safePermid,
            recommendations: cmtData.recommendations,
            commentAge: that.convertTimeStamp(cmtData.approveDate),
            showReplyLink: showReplyLink,
            showRecommendLink: true,
            commentID: commentID,
            shareUrl: url2share,
            shareTitle: '',
            commentSequence: cmtData.commentSequence,
            parentID: cmtData.parentID,
            showInReplyTo: (replyToAReply || (cmtData.commentType !== 'comment' && state.currentTab !== 'all' && state.displayStyle !== 'permalink')),
            parentUserDisplayName: cmtData.parentUserDisplayName,
            safeParentPermid: safeParentPermid,
            parentpermalink: parentPermid,
            permidURL: state.permidURL
        };

        //Format Twitter share title
        data.shareTitle = that.removeHTML(cmtData.userDisplayName) + "'s comment on " + state.sharetitle + ' via @nytimes';
        var shareTitleFB = 'Comment by ' + that.removeHTML(cmtData.userDisplayName) + " on '" + state.sharetitle + "'";

        if (state.userID === 0 || state.userID === "0") {
            data.showReplyLink = false;
            data.showRecommendLink = false;
        }

        if (cmtData.commentType === 'reporterReply') {
            data.showRecommendLink = false;
        }
        if (cmtData.commentType !== 'comment') {
            data.showReplyLink = false;
        }

        $(config.commentFooter(data)).appendTo("#commentElement2_" + commentID);

        if (showReplyLink && state.userID !== 0 && state.userID !== "0") {
            $("#commentReplyLink_" + commentID).click({
                commentID: commentID
            }, that.drawReplyForm);
        }

        if (cmtData.reportAbuseFlag === 1) {
            that.toggleFlag(commentID);
        } else {
            var flagDialogBox = $('#comment' + commentID + ' .dialogBoxFlag');
            var flagIcon = $('#comment' + commentID + ' .commentFlag');
            var flagCloseButtons = flagDialogBox.find('.dialogBoxClose, .cancelButton');
            that.addDialogBoxFunctions(flagDialogBox, flagIcon, flagCloseButtons, true, true);
            var flagSubmit = that.accessDOM('#comment' + commentID + ' .flagCommentSubmit');
            var checkboxes = that.accessDOM('#comment' + commentID + ' .checkbox');
            flagSubmit.click({
                commentID: commentID,
                checkboxes: checkboxes
            }, that.flagComment);
        }

        if (cmtData.recommendedFlag === 1) {
            that.togglePriorRecommendation(commentID, cmtData.recommendations, true);
        } else if (data.showRecommendLink) {
            $("#commentRecommendLink_" + commentID).click({
                commentSequence: cmtData.commentSequence,
                parentID: cmtData.parentID,
                action: 1
            }, that.recommendCommentAction);
        }

        //setup WTactions for Sharing Links
        $("#shareFB" + safePermid).unbind('click');
        $("#shareTwitter" + safePermid).unbind('click');
        $("#shareFB" + safePermid).click({
            'shareUrl': data.shareUrl,
            'shareTitle': shareTitleFB,
            'shareDescription': that.generateFBText(cmtData.commentBody)
        }, that.shareFBAction);
        $("#shareTwitter" + safePermid).click({
            'action': 'shareTwitter'
        }, that.WTactionPassthru);

        $("#permalink" + safePermid).unbind('click');
        $("#permalink" + safePermid).click({
            permid: permid
        }, that.showPermalinkView);
        if ($('#parentpermalink' + safeParentPermid).length > 0) {
            $('#parentpermalink' + safeParentPermid).unbind('click');
            $('#parentpermalink' + safeParentPermid).click({
                permid: parentPermid
            }, that.showPermalinkView);
        }

        //Collapse Replies to comments.
        var j;
        if (append && (cmtData.commentType !== 'comment' && !(cmtData.commentType === 'userReply' && state.currentTab == 'nytreplies') && cmtData.commentType !== 'reporterReply') && cmtData.replyCount > 0) {
            for (j = 0; j < cmtData.replies.length; j++) {
                that.drawCommentElement(cmtData.replies[j], where2add, showReplyLink, append, parentSeqNum, true);
            }
        }
    };

    this.generateFBText = function (str) {
        str = str.replace(/<.+>/, '');
        var strParts = str.split(' ');
        var wordCount = strParts.length;
        var output = '';
        if (wordCount <= config.readMoreToShow) {
            output = str;
        } else {
            output = strParts.slice(0, config.readMoreToShow).join(' ') + '&#8617;';
        }
        return output;
    };

    this.shareFBAction = function (evt) {

        var mt = $('meta[property="og:url"]');
        mt = (mt.length) ? mt : $('<meta property="og:url" />').appendTo('head');
        mt.attr('content', evt.data.shareUrl);

        mt = $('meta[property="og:title"]');
        mt = (mt.length) ? mt : $('<meta property="og:title" />').appendTo('head');
        mt.attr('content', evt.data.shareTitle);

        mt = $('meta[property="og:description"]');
        mt = (mt.length) ? mt : $('<meta property="og:description" />').appendTo('head');
        mt.attr('content', evt.data.shareDescription);
        that.WTaction('shareFB');
    };

    this.showPermalinkView = function (evt) {
        if (_debug) {
            console.log('showPermalinkView');
        }
        state.displayStyle = "permalink";
        state.permid = evt.data.permid;
        that.drawNavBar();
        that.showComments(state.displayStyle, false);
        $('#commentFormTop').html('');
        that.hideMe($('#commentFormBottom').html(''));
        state.commentFormLocation = "bottom";
        that.drawCommentForm();
    };

    this.drawReplyForm = function (e) {

        var commentID = e.data.commentID;
        that.removePeek();
        if (state.replyFormLocation !== '#replyForm' + commentID) {
            that.drawCommentForm(commentID);
        }
    };

    this.recommendCommentAction = function (e) {
        e.preventDefault();

        if (_debug) {
            console.log('Recommending comment', e.data);
        }
        if (e.data.parentID === null || e.data.parentID === '') {
            e.data.parentID = 0;
        }

        var postData = {
            userID: state.userID,
            userEmail: 'REPLACEMEWITHREALDATA',
            url: that.pageUrl,
            commentSequence: e.data.commentSequence,
            parentID: e.data.parentID,
            recommend: e.data.action
        };
        if (_debug) {
            console.log('recommendCommentAction', postData);
        }

        var recommendCallback = 'processRecommendComment';
        if (e.data.action === 0) {
            recommendCallback = 'processUnRecommendComment';
            that.WTaction('unrecommend');
        } else {
            that.WTaction('recommend');
        }

        //Store this for later use
        state.lastPostedInfo = $.extend({}, postData, state.userData);
        that.loadContent({
            cmd: 'PostRecommend',
            postdata: postData,
            method: 'post'
        }, recommendCallback);
    };

    this.processRecommendComment = function (responseData) {

        if (_debug) {
            console.log('processRecommendComment', responseData);
        }
        if (responseData.results && responseData.results.commentID > 0 && responseData.results.recommendations > 0) {
            that.togglePriorRecommendation(responseData.results.commentID, responseData.results.recommendations, true);
        }
    };

    this.processUnRecommendComment = function (responseData) {

        if (_debug) {
            console.log('processUnRecommendComment', responseData);
        }
        if (responseData.results && responseData.results.commentID > 0) {
            that.togglePriorRecommendation(responseData.results.commentID, responseData.results.recommendations, false);
        }
    };

    this.togglePriorRecommendation = function (commentID, recommendCount, showRecommend) {

        var recommendDOM, otherRecommendDOM, action, recItemHTML;

        if (showRecommend) {
            recommendDOM = '#commentRecommendLink_' + commentID;
            otherRecommendDOM = '#commentUnRecommendLink_' + commentID;
            recItemHTML = config.commentRecommendedItem;
            action = 0;
        } else {
            recommendDOM = '#commentUnRecommendLink_' + commentID;
            otherRecommendDOM = '#commentRecommendLink_' + commentID;
            recItemHTML = config.commentRecommendedItemReset;
            action = 1;
        }

        // GO GET commentSequence and parentID from $('#commentRecommendLink_' + commentID)
        var commentSequence = $(recommendDOM).attr('data-commentSequence');
        var parentID = $(recommendDOM).attr('data-parent');
        var data = {
            recommendations: recommendCount,
            commentID: commentID,
            parentID: parentID,
            commentSequence: commentSequence
        };
        $(recommendDOM).unbind('click');
        $(recommendDOM).parent().replaceWith(recItemHTML(data));

        $(otherRecommendDOM).click({
            commentSequence: commentSequence,
            parentID: parentID,
            action: action
        }, that.recommendCommentAction);
    };

    this.readMoreCommentsAction = function () {
        that.WTaction('readMoreComments');
        if (state.commentState === 'peek') {
            that.removePeek();
        } else {
            that.loadComments(state.currentTab);
        }
    };

    this.readMoreTextAction = function (e) {
        that.removePeek();
        if (_debug) {
            console.log("readmore", e);
        }
        var commentID = e.data.commentID;
        $('#readMoreText_' + commentID).show();
        $('#readMoreTextButton_' + commentID).remove();
        $('#ellipsis_' + commentID).remove();
    };

    this.hideMe = function (DOMObj) {
        if ($(DOMObj).hasClass('hidden') === false) {
            $(DOMObj).addClass('hidden');
        }
    };

    this.showMe = function (DOMObj, transition) {
        if ($(DOMObj).hasClass('hidden') === true) {
            if (transition) {
                $(DOMObj).hide().removeClass('hidden');
                $(DOMObj).fadeIn('fast', function () {});
            } else {
                $(DOMObj).removeClass('hidden');
            }
        }
    };

    this.convertTimeStamp = function (cmtTime) {
        cmtTime = parseInt(cmtTime, 10);
        var nowTime = parseInt(state.currentTime, 10);

        //Convert difference into seconds;
        var difference = Math.floor(nowTime - cmtTime);

        if (difference < 2) {
            return 'just now';
        }
        if (difference < 60) {
            return difference + ' seconds ago';
        }

        //Convert Difference Into Minutes
        difference = Math.floor(difference / 60);

        if (difference < 2) {
            return 'about a minute ago';
        }
        if (difference < 60) {
            return difference + ' minutes ago';
        }

        //Convert Difference Into Hours
        difference = Math.floor(difference / 60);

        if (difference < 2) {
            return 'about an hour ago';
        }
        if (difference < 24) {
            return difference + ' hours ago';
        }

        //Now we need cmtDate into an actual Date object
        var d = new Date(cmtTime * 1000);
        var hour = d.getHours();
        var min = d.getMinutes();
        var ampm = ' a.m.';
        if (hour === 0) {
            hour = 12;
        } else if (hour === 12) {
            ampm = ' p.m.';
        } else if (hour > 12) {
            hour = hour - 12;
            ampm = ' p.m.';
        }
        if (min < 10) {
            min = '0' + min;
        }

        //Convert Difference Into Days
        difference = Math.floor(difference / 24);
        if (difference < 2) {
            return 'Yesterday at ' + hour + ':' + min + ampm;
        }

        var dotw = d.getDay();
        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        if (difference < 4) {
            return days[dotw] + ' at ' + hour + ':' + min + ampm;
        }

        var months = ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];

        var now = new Date(nowTime * 1000);
        if (now.getFullYear() === d.getFullYear()) {
            return months[d.getMonth()] + ' ' + d.getDay() + ' at ' + hour + ':' + min + ampm;
        }

        return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + ' at ' + hour + ':' + min + ampm;
    };

    this.generateParentPermID = function (permid) {
        var lastColon = permid.lastIndexOf(':');
        if (lastColon > -1) {
            return permid.slice(0, lastColon);
        }
        return "0";
    };

    this.loadJSFile = function (filename) {
        var fileRef = document.createElement('script');
        fileRef.setAttribute("type", "text/javascript");
        fileRef.setAttribute("src", filename);
        document.getElementsByTagName("head")[0].appendChild(fileRef);
    };

    this.removeHTML = function (str) {
        if(typeof str === "string") {
            str = str.replace(/<[^>]+>/ig,"");
        }
        return str;
    };

    //******************************************************************
    // Comment Config
    //******************************************************************
    
    this.commentsConfig = {
        'default': {
            showPeek: true,
            defaultTab: 'all',
            defaultSort: 1, //1 is newest first, 0 is oldest first
            readMoreFlag : false,
            readMoreThreshold: 50,
            readMoreToShow: 35,
            repliesToShowInitially: 2,
            repliesToShowMax: 3,
            peekCommentThreshold: 500,
            commentsToGet: 25,
            //THIS VALUE SHOULD NOT CHANGE.  IT WILL BREAK THE API
            maxCommentSize: 1500,

            setupDivs: function () { 
                return '<div id="commentDiv">COMMENTS DIV</div>';
            },//I don't think this is used...

            commentsModuleDiv: function () {
                return [
                    '<!-- START COMMENT MODULE -->',
                    '<div id="commentsHeader" class="commentsHeader opposingFloatControl wrap">',
                        '<div id="commentsHeaderData" class="element1"></div>',
                        '<div class="element2" id="commentTileAd"></div>',
                    '</div><!-- close commentsHeader -->',
                    '<div id="commentsModule" class="commentsModule doubleRule"><!-- close commentsModule -->',
                        '<div id="commentsModuleHeader" class="commentsModuleHeader">',
                            '<div id="commentsNavBar"></div>',
                        '</div><!-- close commentsModuleHeader -->',
                        '<div id="commentsDisplayContainer"></div><!-- close commentsDisplayContainer -->',
                        '<div id="commentFormBottom" class="commentFormBottom doubleRule"></div><!-- close commentFormBottom -->',
                    '</div><!-- END COMMENT MODULE -->'
                ].join("");
            },

            navbar: function (data) {
                var navBarStyle, writeComment;

                //Build tabbed navigation
                if (data.style === "normal") {
                    navBarStyle = [
                    '<ul class="tabs wrap">',
                        '<li id="commentsNavAll" class="commentsNavAll firstItem"><a href="javascript:;">All</a></li>'
                    ];

                    if (data.readerpicksct > 0) {
                        navBarStyle.push('<li id="commentsNavReaderPicks" class="commentsNavReaderPicks"><a href="javascript:;">Reader Picks</a></li>');
                    }

                    if (data.nytpicksct > 0) {
                        navBarStyle.push('<li id="commentsNavNYTPicks" class="commentsNavNYTPicks"><a href="javascript:;">NYT Picks</a></li>');
                    }

                    if (data.nytrepliesct > 0) {
                        navBarStyle.push('<li id="commentsNavNYTReplies" class="commentsNavNYTReplies lastItem"><a href="javascript:;">NYT Replies</a></li>');
                    }
                    navBarStyle.push('</ul>');
                } else if (data.style === "permalink") {
                    navBarStyle = ['<p id="commentsRefer" class="commentsRefer refer"><a href="javascript:;">&laquo; READ ALL COMMENTS</a></p>'];
                }
                navBarStyle = navBarStyle.join("");

                //Comments Closed or Write a comment
                if (data.canSubmit) {
                    writeComment = [
                    '<div id="commentWrite" class="commentWrite element2 moduleBackgroundColorAlt">',
                        '<a href="javascript:;" id="toggleFormButton">Write a Comment</a>',
                    '</div><!-- close commentWrite -->'
                    ];
                } else {
                    writeComment = [
                    '<div id="commentsClosed" class="commentWrite element2">',
                        '<p>Comments Closed</p>',
                    '</div>'
                    ];
                }
                writeComment = writeComment.join("");

                return [
                    '<div id="commentsNavBar">',
                        '<div class="opposingFloatControl wrap">',
                            '<div class="tabsContainer element1">',
                                navBarStyle,
                            '</div><!-- close tabsContainer -->',
                            '<div class="commentActions element2">',
                                '<div id="commentSort" class="commentSort element1">',
                                    '<a id="sortToggle" class="toggleControl" href="javascript:;">', data.sortText, '</a>',
                                '</div><!-- close commentSort -->',
                                writeComment,
                            '</div><!-- close element2 -->',
                        '</div><!-- close opposingFloatControl -->',
                    '</div>'
                ].join("");
            },

            commentDisplay: function () {
                return [
                    '<div id="commentDisplay" class="commentsDisplay tabContent active">',
                        '<div id="commentsLoader" class="commentsLoader">',
                            '<img src="http://i1.nyt.com/images/loaders/loading-grey-lines-circle-18.gif" alt="Loading">',
                        '</div><!-- close commentsLoader -->',
                        '<div id="commentFormTop" class="commentFormTop hidden"></div><!-- close commentFormTop -->',
                        '<ol class="commentsList" id="commentsList"></ol>',
                        '<div id="commentsFooter" class="commentsFooter"></div>',
                    '</div>'
                ].join("");
            },

            commentDisplayEmpty: function () {
                return '<div id="commentDisplay" class="commentsDisplay tabContent active"></div>';
            },//I don't think this is used...

            noComments: function () {
                return [
                    '<div id="commentFormTop" class="commentFormTop hidden"></div>',
                        '<div class="commentsZero">',
                         '<div class="inset">',
                             '<p>No Comments</p>',
                         '</div>',
                    '</div><!-- close commentsZero -->'
                ].join("");
            },

            commentElement: function (data) {
                return [
                    '<li id="comment', data.commentID, '" class="comment">',
                        '<div class="opposingFloatControl wrap">',
                            '<div class="commentThumb element1"><img src="', data.picURL, '"></div>',
                            '<div id="commentElement2_', data.commentID, '" class="commentContainer element2"></div>',
                        '</div>',
                    '</li>'
                ].join("");
            },

            commentHeader: function (data) {

                //Current user's username
                var userNameString = (data.userURL) ? [
                    '<a href="', data.userURL, '">', data.userDisplayName, '</a>'
                ].join("") : data.userDisplayName;

                //Verified user
                var verifiedUser = (data.trusted) ? [
                    '<li class="commenterCredentials">',
                        '<div class="containingBlock">',
                            '<span class="commenterTrustedIcon">Verified</span>',
                        '</div>',
                    '</li>'
                ].join("") : "";

                //NYT reporter username
                var nytReporterName = (data.commentType === "reporterReply") ? [
                    '<li class="commenterNYT">', data.userTitle, '</li>'
                ].join("") : "";

                //Flag abusive comment module
                var flagCommentModule = (data.showFlagLink) ? [
                    '<div class="commentFlagContainer containingBlock">',
                        '<div id="dialogBoxFlag" class="dialogBoxFlag dialogBox">',
                            '<div class="inset">',
                                '<div class="header">',
                                    '<div class="opposingFloatControl wrap">',
                                        '<div class="element1">',
                                            '<h5 class="moduleHeaderBd">Report Inappropriate Comment</h5>',
                                        '</div>',
                                        '<div class="element2"><a href="javascript:;" class="dialogBoxClose"></a></div>',
                                    '</div><!-- close opposingFloatControl -->',
                                '</div><!-- close header -->',
                                '<div class="singleRule">',
                                    '<div class="module">',
                                        '<div class="subColumn-2 wrap">',
                                            '<div class="column">',
                                                '<div class="insetH">',
                                                    '<ul class="checkboxList flush">',
                                                        '<li class="control checkboxControl">',
                                                            '<div class="fieldContainer">',
                                                                '<input type="checkbox" value="Vulgar" name="checkboxVulgar" id="checkboxVulgar" class="checkbox">',
                                                            '</div>',
                                                            '<div class="labelContainer">',
                                                                '<label for="checkboxVulgar" class="checkboxLabel">Vulgar</label>',
                                                            '</div>',
                                                        '</li>',
                                                        '<li class="control checkboxControl">',
                                                            '<div class="fieldContainer">',
                                                                '<input type="checkbox" value="Inflammatory" name="checkboxInflammatory" id="checkboxInflammatory" class="checkbox">',
                                                            '</div>',
                                                            '<div class="labelContainer">',
                                                                '<label for="checkboxInflammatory" class="checkboxLabel">Inflammatory</label>',
                                                            '</div>',
                                                        '</li>',
                                                        '<li class="control checkboxControl">',
                                                            '<div class="fieldContainer">',
                                                                '<input type="checkbox" value="Personal Attack" name="checkboxPersonalAttack" id="checkboxPersonalAttack" class="checkbox">',
                                                            '</div>',
                                                            '<div class="labelContainer">',
                                                                '<label for="checkboxPersonalAttack" class="checkboxLabel">Personal Attack</label>',
                                                            '</div>',
                                                        '</li>',
                                                    '</ul>',
                                                '</div>',
                                            '</div><!-- close column -->',
                                            '<div class="column lastColumn">',
                                                '<div class="insetH">',
                                                    '<ul class="checkboxList flush">',
                                                        '<li class="control checkboxControl">',
                                                            '<div class="fieldContainer">',
                                                                '<input type="checkbox" value="Spam" name="checkboxSpam" id="checkboxSpam" class="checkbox">',
                                                            '</div>',
                                                            '<div class="labelContainer">',
                                                                '<label for="checkboxSpam" class="checkboxLabel">Spam</label>',
                                                            '</div>',
                                                        '</li>',
                                                        '<li class="control checkboxControl">',
                                                            '<div class="fieldContainer">',
                                                                '<input type="checkbox" value="Off Topic" name="checkboxOffTopic" id="checkboxOffTopic" class="checkbox">',
                                                            '</div>',
                                                            '<div class="labelContainer">',
                                                                '<label for="checkboxOffTopic" class="checkboxLabel">Off-topic</label>',
                                                            '</div>',
                                                        '</li>',
                                                    '</ul>',
                                                '</div>',
                                            '</div><!-- close column -->',
                                        '</div><!-- close subColumn-2 -->',
                                        '<div class="horizontalControl">',
                                            '<div class="insetV flushBottom">',
                                                '<button type="button" class="applicationButton flagCommentSubmit">Submit</button> <button type="button" class="textButton cancelButton">Cancel</button>',
                                            '</div>',
                                        '</div>',
                                    '</div><!-- close module -->',
                                '</div><!-- close singleRule -->',
                            '</div><!-- close inset -->',
                            '<div class="dialogBoxPointer"></div>',
                        '</div><!-- close dialogBoxFlag -->',
                        '<p class="commentFlag element2"><a href="javascript:;">Flag</a></p>',
                    '</div><!-- close commentFlagContainer -->'
                ].join("") : "";

                return [
                    '<div class="commentHeader wrap" id="permid', data.safePermid, '">',
                        '<ul class="commenterMetaList element1">',
                            '<li class="commenter">', userNameString, '</li>',
                            '<li class="commenterLocation">', data.location, '</li>',
                            verifiedUser,
                            nytReporterName,
                        '</ul>',
                        '<div class="commentBannerContainer element2">',
                            '<div class="commentBanner wrap">',
                                (data.nytPick) ? '<span class="bannerNYTPick element2">NYT Pick</span>' : '',
                                flagCommentModule,
                            '</div><!-- close commentBanner -->',
                        '</div><!-- close commentBannerContainer -->',
                    '</div><!-- close commentHeader -->'
                ].join("");
            },

            commentFlagged: function () {
                return '<span class="flagged"> Reported </span>';
            },

            dialogBoxTrusted: function (data) {
                var trustedCommenter = "";

                //Build string for: You/name are/is Verified.
                if (data.showYou) {
                    trustedCommenter = "You are";
                } else if (data.userDisplayName) {
                    trustedCommenter = data.userDisplayName + " is";
                } else if (data.displayName) {
                    trustedCommenter = data.displayName + " is";
                }

                return [
                    '<div class="dialogBox dialogBoxTrusted" id="dialogBoxTrusted">',
                        '<div class="inset">',
                            '<div class="header">',
                                '<div class="opposingFloatControl wrap">',
                                    '<div class="element1">',
                                        '<h5 class="moduleHeaderBd"><span class="commenterTrusted"><span class="commenterTrustedIcon"></span> ', trustedCommenter, ' Verified</span></h5>',
                                    '</div>',
                                    '<div class="element2">',
                                        '<a class="dialogBoxClose" href="javascript:;"></a>',
                                    '</div>',
                                '</div><!-- close opposingFloatControl -->',
                            '</div><!-- close header -->',
                            '<div class="singleRule">',
                                '<div class="module">',
                                    '<p>Verified Commenters enjoy the privilege of commenting on articles and blog posts without moderation.</p>',
                                    '<p><a href="http://www.nytimes.com/content/help/site/usercontent/verified/verified-commenters.html">Verified Commenter FAQ</a></p>',
                                '</div><!-- close module -->',
                            '</div><!-- close singleRule -->',
                        '</div><!-- close inset -->',
                        '<div class="dialogBoxPointerUp"></div>',
                    '</div><!-- close dialogBox -->'
                ].join("");
            },

            commentBody: function (data) {
                var readMoreModule = (data.readMoreText) ? [
                    '<span id="ellipsis_', data.commentID, '">&#8230;</span>',
                    '<a id="readMoreTextButton_', data.commentID, '" class="commentReadMore toggleControl" href="javascript:;">Read More</a>',
                    '<span id="readMoreText_', data.commentID, '">', data.readMoreText, '</span>'
                ].join("") : "";

                return [
                    '<div class="commentBody">',
                        '<p>', data.commentBody , readMoreModule, '</p>',
                    '</div><!-- close commentBody -->'
                ].join("");
            },

            commentFooter: function (data) {
                var inReplyTo = (data.showInReplyTo && data.parentUserDisplayName) ? [
                    '<li class="commentInReplyTo">',
                        '<a id="parentpermalink', data.safeParentPermid, '" href="', data.permidURL, '#permid=', data.parentpermalink, '">In reply to ', data.parentUserDisplayName, '</a>',
                    '</li>'
                ].join("") : "";

                var commentReplyLink = (data.showReplyLink) ? [
                    '<li class="commentReply"><a href="javascript:;" id="commentReplyLink_', data.commentID, '">Reply</a></li>'
                ].join("") : "";

                var recommendations = (data.recommendations) ? [
                    '<span class="commentRecommendedIcon"></span>',
                    '<span class="commentRecommendedCount">', data.recommendations, '</span>'
                ].join("") : "";

                //Recommendation comment module
                var commentRecModule = (data.showRecommendLink) ? [
                    '<li class="commentRecommend">',
                        '<a id="commentRecommendLink_', data.commentID, '" data-commentSequence="', data.commentSequence, '" data-parent="', data.parentID, '" href="javascript:;">',
                            '<span class="commentRecommendLinkText">Recommend</span>',
                            recommendations,
                        '</a>',
                    '</li>'
                ].join("") : (data.recommendations) ? [
                    '<li class="commentRecommend">',
                        '<span class="commentRecommendLinkText">Recommended</span>',
                        '<span class="commentRecommendedIcon"></span>',
                        '<span class="commentRecommendedCount">', data.recommendations, '</span>',
                    '</li>'
                ].join("") : "";

                return [
                    '<div class="commentFooter wrap">',
                        '<ul class="commentActionsList element1">',
                            inReplyTo,
                            '<li class="commentTime"><a id="permalink', data.safePermid, '" href="', data.permidURL, '#permid=', data.permalink, '">', data.commentAge, '</a></li>',
                            commentReplyLink,
                            commentRecModule,
                            '<li class="commentShareTools js_share_data" data-sharetitle="', data.shareTitle, '" data-shareurl="', data.shareUrl, '">',
                                 '<ul class="wrap">',
                                     '<li class="commentShareFacebook"><a id="shareFB', data.safePermid, '" href="javascript:;" class="js_share_facebook" title="Share this on Facebook">Share this on Facebook</a></li>',
                                     '<li class="commentShareTwitter"><a id="shareTwitter', data.safePermid, '" href="javascript:;" class="js_share_twitter" title="Share this on Twitter">Share this on Twitter</a></li>',
                                 '</ul>',
                            '</li>',
                          '</ul>',
                    '</div><!-- close commentFooter -->'
                ].join("");
            },

            commentRecommendedItem: function (data) {
                return [
                    '<li class="commentRecommend commentRecommendedByUser">',
                        '<a data-commentSequence="', data.commentSequence, '" data-parent="', data.parentID, '" id="commentUnRecommendLink_', data.commentID, '" href="javascript:;" title="Undo">',
                            '<span class="commentRecommendLinkText">You recommended this</span>',
                            '<span class="commentRecommendedIcon"></span><span class="commentRecommendedCount">', data.recommendations, '</span>',
                        '</a>',
                    '</li>'
                ].join("");
            },

            commentRecommendedItemReset: function (data) {
                var recommendations = (data.recommendations) ? [
                    '<span class="commentRecommendedIcon"></span>',
                    '<span class="commentRecommendedCount">', data.recommendations, '</span>'
                ].join("") : "";

                return [
                    '<li class="commentRecommend">',
                        '<a id="commentRecommendLink_', data.commentID, '" data-commentSequence="', data.commentSequence, '" data-parent="', data.parentID, '" href="javascript:;">',
                            '<span class="commentRecommendLinkText">Recommend</span>',
                            recommendations,
                        '</a>',
                    '</li>'
                ].join("");
            },

            commentActions: function (data) {
                return [
                    '<div class="commentActions box" id="commentActionsBox_', data.commentID, '">',
                        '<div class="insetPadded moduleBackgroundColor">',
                            '<p class="commentReadAllReplies">',
                                '<a class="toggleControlBlock" id="showReplies_', data.commentID, '" href="javascript:;">',
                                    '<span>Read All ', data.replyCount, ' Replies</span>',
                                    '<span class="toggleDownIcon"></span>',
                                '</a>',
                            '</p>',
                        '</div><!-- close inset -->',
                    '</div><!-- close commentActions -->'
                ].join("");
            },

            commentReplyList: function (data) {
                return [
                    '<ol id="replylist_', data.commentID, '" class="commentsListNested"></ol>'
                ].join("");
            },

            readMoreComments: function () {
                return [
                    '<div id="commentsReadMore" class="commentsReadMore commentActions moduleBackgroundColor">',
                        '<p>',
                            '<a id="commentsReadMoreToggle" class="toggleControlBlock" href="javascript:;">',
                                '<span>Read More Comments</span>',
                                '<span class="toggleDownIcon"></span>',
                            '</a>',
                        '</p>',
                    '</div><!-- close commentsReadMore -->'
                ].join("");
            },

            closedComments: function () {
                return [
                    '<div class="commentsClosedModule" id="commentsClosedModule">',
                        '<div class="inset">',
                            '<p>Comments are no longer being accepted. Please submit a <a href="http://www.nytimes.com/content/help/site/editorial/letters/letters.html">letter to the editor</a> for print consideration.</p>',
                        '</div>',
                    '</div>'
                ].join("");
            },

            commentsHeaderData: function (data) {
                var numOfComments = (data.cCount > 1) ? data.cCount + " Comments" : (data.cCount === 1) ? "1 Comment" : "No Comments";

                return [
                    '<h3 class="sectionHeader">',
                        '<a name="comments"></a>',
                        '<a name="postcomment"></a>',
                        numOfComments,
                    '</h3>',
                    '<p class="commentsIntro">', data.commentQuestion, '</p>'
                ].join("");
            },

            loginToComment: function (data) {
                return [
                    '<div id="commentFormControl" class="commentLoginModule">',
                        '<div class="inset">',
                            '<p class="commenterLoggedOut">To comment, reply or recommend please <span class="containingBlock"><a id="dialogBoxLoginLink" href="javascript:;">Log In</a></span> or <a href="', data.register, '">Create An Account. &raquo;</a></p>',
                        '</div>',
                        '<div class="doubleRuleDivider"></div>',
                    '</div>'
                ].join("");
            },

            commentForm: function (data) {
                var replyFormStart = (data.formType === "reply") ? [
                    '<li class="comment" id="replyForm', data.commentID, '">'
                ].join("") : "";

                var commentFormModule = (data.formType === "comment") ? [
                    '<div class="element1">',
                        '<h3 class="sectionHeader">Write a Comment</h3>',
                     '</div>',
                     '<div class="element2">',
                        '<p class="commentCorrection">',
                            '<a name="writeComment" href="', data.myaccountfeedbackurl, '">Suggest a Correction?</a>',
                        '</p>',
                     '</div>'
                ].join("") : "";

                var trustedModule = (data.becomeTrusted) ? [
                    '<div class="commentConfirmation box statusBackgroundColor">',
                        '<div class="inset">',
                            '<p>',
                                '<span class="commenterTrusted">',
                                    '<span class="commenterTrustedIcon"></span>',
                                    'You\'re eligible to become Verified!',
                                '</span>',
                                ' – Comment and reply, without moderation delays. ',
                                '<a class="inlineReferBd" href="', data.getStartedURL, '">Get Started »</a></p>',
                         '</div>',
                    '</div>'
                ].join("") : "";

                var commenter = (data.userURL) ? [
                    '<a href="', data.userURL, '">', data.displayName, '</a>'
                ].join("") : data.displayName;

                var location = (data.location) ? [
                    '<li class="commenterLocation">', data.location, '</li>'
                ].join("") : "";

                var showVerified = (data.trusted === 1) ? [
                    '<li class="commenterCredentials">',
                        '<div class="containingBlock">',
                            '<span class="commenterTrustedIcon">Verified</span>',
                        '</div>',
                    '</li>'
                ].join("") : "";

                var commentProfileModule = (data.hasProfile === 1) ? [
                    '<ul class="commenterMetaList element1">',
                        '<li class="commenter">', commenter, '</li>',
                        location,
                        showVerified,
                        '<li class="commenterIdentity">',
                            '<div class="formHintContainer containingBlock element1">',
                                '<span class="formHint"><a href="javascript:;">Not You?</a></span>',
                            '</div><!-- close formHintContainer -->',
                        '</li>',
                    '</ul>'
                ].join("") : [
                    '<div class="control commentHeaderControl horizontalControl">',
                        '<div class="control commenterControl">',
                            '<div class="labelContainer">',
                                '<label class="labelBd" for="commenterFullNameInput">Display Name</label>',
                            '</div><!-- close labelContainer -->',
                            '<div class="fieldContainer">',
                                '<input id="commenterFullNameInput" name="commenterFullNameInput" type="text" class="commenterFullNameInput text">',
                            '</div><!-- close fieldContainer -->',
                        '</div><!-- close control -->',
                        '<div class="control commenterLocationControl">',
                            '<div class="labelContainer">',
                                '<label class="labelBd" for="commenterLocationInput">Location</label>',
                            '</div><!-- close labelContainer -->',
                            '<div class="fieldContainer wrap">',
                                '<input id="commenterLocationInput" name="commenterLocationInput" type="text" class="commenterLocationInput text element1">',
                                '<div class="formHintContainer containingBlock element1">',
                                    '<span class="formHint"><a href="javascript:;">Not You?</a></span>',
                                '</div><!-- close formHintContainer -->',
                            '</div><!-- close fieldContainer -->',
                        '</div><!-- close control -->',
                    '</div>'
                ].join("");

                return [
                    replyFormStart,
                        '<div id="commentFormControl" class="commentFormControl">',
                            '<div class="opposingFloatControl wrap">',
                                '<div class="commentFormHeader wrap">',
                                    commentFormModule,
                                '</div><!-- close commentFormHeader -->',
                                '<form id="commentForm', data.commentID, '" class="commentForm singleRule">',
                                    trustedModule,
                                    '<fieldset>',
                                        '<div class="commentThumb element1">',
                                            '<img src="', data.picURL, '">',
                                        '</div><!-- close commentThumb -->',
                                        '<div class="commentFieldContainer element2">',
                                            '<div class="commentHeader wrap">',
                                            commentProfileModule,
                                            '</div><!-- close commentHeader -->',
                                            '<div class="control commentTextareaControl">',
                                                '<div class="fieldContainer containingBlock">',
                                                    '<p id="commentCharCount', data.commentID, '" class="commentCharCount">', data.charCount, '</p>',
                                                    '<textarea id="commentTextarea', data.commentID, '" class="textarea placeholder" placeholder="Type your comment here."></textarea>',
                                                    '<div id="commentTextareaHidden', data.commentID, '" class="textarea" style="display:none;min-height:0px"></div>',
                                                    '<div class="errorContainer">',
                                                        '<div id="commentFormError', data.commentID, '" class="inset">',
                                                            '<p class="error">Please ensure that your comment is under 1500 characters, and then click Submit.</p>',
                                                        '</div>',
                                                        '<div id="commentFormAPIError', data.commentID, '" class="inset hidden">',
                                                            '<p class="error">An error has occurred, please try again later.</p>',
                                                        '</div>',
                                                    '</div><!-- close errorContainer -->',
                                                '</div><!-- close fieldContainer -->',
                                            '</div><!-- close control -->',
                                            '<div class="control commentSubmitControl horizontalControl">',
                                                '<div class="control checkboxControl">',
                                                    '<div class="fieldContainer">',
                                                        '<input type="checkbox" id="commentNotify', data.commentID, '" name="commentNotify" class="checkbox">',
                                                    '</div><!-- close fieldContainer -->',
                                                    '<div class="labelContainer">',
                                                        '<label class="checkboxLabelSm" for="commentNotify', data.commentID, '">',
                                                            'E-mail me at <strong>', data.email, '</strong> (<a href="', data.membercenter, '">change?</a>) when my comment is published.',
                                                        '</label>',
                                                        '<p class="formDescription">Comments are moderated and generally will be posted if they are on-topic and not abusive. <a href="', data.faq, '">Comments FAQ &raquo;</a></p>',
                                                    '</div>',
                                                '</div><!-- close control -->',
                                                '<div class="control buttonControl">',
                                                    '<span id="submitLoader', data.commentID, '" class="submitLoader hidden"><img src="http://i1.nyt.com/images/loaders/loading-grey-lines-circle-18.gif" /></span>',
                                                    '<button id="submitComment', data.commentID, '" class="applicationButton applicationButtonInactive" disabled="disabled">Submit</button>',
                                                '</div><!-- close control -->',
                                            '</div><!-- close control -->',
                                        '</div><!-- close commentFieldContainer -->',
                                    '</fieldset>',
                                '</form><!-- close commentForm -->',
                            '</div><!-- close opposingFloatControl -->',
                            (data.formType === "comment") ? '<div class="doubleRuleDivider"></div>' : '',
                         '</div><!-- close commentFormControl -->',
                    (data.formType === "reply") ? '</li>' : "",
                ].join("");
            },

            dialogBoxLogIn: function (data) {
                var loginWrapperStart = (data.formType === 'reply') ? [
                    '<div id="dialogBoxLogin', data.commentID, '" class="dialogBox dialogBoxLogin">'
                ].join("") : '<div id="dialogBoxLogin" class="dialogBox dialogBoxLogin">';

                return [
                    loginWrapperStart,
                         '<div class="inset">',
                             '<div class="header">',
                                 '<div class="opposingFloatControl wrap">',
                                     '<div class="element1">',
                                         '<h5 class="moduleHeaderBd">Login to NYTimes.com</h5>',
                                     '</div>',
                                     '<div class="element2">',
                                         '<a href="javascript:;" class="dialogBoxClose"></a>',
                                     '</div>',
                                 '</div><!-- close opposingFloatControl -->',
                             '</div><!-- close header -->',
                             '<div class="singleRule">',
                                 '<div class="module">',
                                     '<div class="horizontalFormControl">',
                                         '<form id="commentsLoginForm" class="commentsLoginForm" method="post" action="', data.myaccount, '/auth/login">',
                                             '<input type="hidden" name="is_continue" value="false">',
                                             '<input id="commentsLoginToken" type="hidden" name="token" value="">',
                                             '<input id="commentsLoginExpires" type="hidden" name="expires" value="">',
                                             '<div class="errorContainer"></div>',
                                             '<div class="control">',
                                                 '<div class="labelContainer">',
                                                     '<div class="insetV">',
                                                         '<label for="user">User name or e-mail:</label>',
                                                     '</div>',
                                                 '</div>',
                                                 '<div class="fieldContainer">',
                                                     '<input type="text" class="text" value="" id="user" name="userid">',
                                                 '</div>',
                                             '</div><!-- close control -->',
                                             '<div class="control passwordControl">',
                                                 '<div class="labelContainer containingBlock">',
                                                     '<div class="insetV">',
                                                         '<label for="password">Password:</label>',
                                                         '<span class="labelDescription"><a href="', data.forgot, '">Don’t know your password?</a></span>',
                                                     '</div>',
                                                 '</div>',
                                                 '<div class="fieldContainer">',
                                                     '<input type="password" class="text" value="" id="password" name="password">',
                                                 '</div>',
                                             '</div><!-- close control -->',
                                             '<div class="control horizontalControl loginSubmitControl flushBottom">',
                                                 '<div class="insetContainer wrap">',
                                                     '<div class="control buttonControl">',
                                                         '<button type="submit" class="loginButton applicationButton">Login</button>',
                                                     '</div>',
                                                     '<div class="control checkboxControl">',
                                                         '<div class="fieldContainer">',
                                                             '<input type="checkbox" id="rememberMe" name="rememberMe" class="checkbox">',
                                                         '</div>',
                                                         '<div class="labelContainer">',
                                                             '<label class="checkboxLabel" for="rememberMe">Remember me</label>',
                                                         '</div>',
                                                     '</div><!-- close control -->',
                                                 '</div><!--close insetContainer -->',
                                             '</div><!-- close control -->',
                                         '</form>',
                                     '</div><!-- close horizontalFormControl -->',
                                 '</div><!-- close module -->',
                             '</div><!-- close singleRule -->',
                         '</div><!-- close inset -->',
                         '<div class="dialogBoxPointer"></div>',
                     '</div><!-- close dialogBox -->'
                ].join("");
            },

            invalidUserInfo: function () {
                return '<p class="error">Invalid or missing Full Name or Location. Please try again.</p>';
            },

            charCountError: function () {
                return '<span>Too Long</span>';
            },

            commentConfirmation: function (data) {

                var commentNotification = (data.sendEmailOnApproval) ? [
                    '<p>Thank you for your submission. We\'ll notify you at <strong>', data.email, '</strong> when your comment ',
                    (data.trusted) ? 'appears.' : 'has been approved.'
                ].join("") : [
                    '<p>Thank you for your submission. Your comment will appear ',
                    (data.trusted) ? 'shortly.' : 'once it has been approved.'
                ].join("");

                var shareActivity = (data.sharing  !== 1) ? [
                    '<div class="subheader">',
                        '<div class="insetPadded">',
                            '<h5><a href="', data.timespeoplegetstart, '">Edit Your Profile</a></h5>',
                            '<p>Change your personal information, add a photo, share your activity with other readers, and view all of your comments in one place. <a class="inlineRefer" href="', data.timespeoplegetstart, '">Get Started »</a></p>',
                        '</div><!-- close insetPadded -->',
                    '</div><!-- close subheader -->'
                ].join("") : "";

                var trustedUser = (data.trusted) ? [
                    '<li class="commenterCredentials">',
                        '<div class="containingBlock">',
                            '<span class="commenterTrustedIcon">Verified</span>',
                        '</div>',
                    '</li>'
                ].join("") : "";

                return [
                    '<div class="commentConfirmation" id="commentConfirmation', data.parentID || '', '">',
                        '<div class="header">',
                            '<div class="insetPadded">',
                                commentNotification,
                            '</div><!-- close insetPadded -->',
                        '</div><!-- close header -->',
                        shareActivity,
                        '<ol class="commentsList', (data.parentID) ? 'Nested' : '', '">',
                            '<li class="comment">',
                                '<div class="opposingFloatControl wrap">',
                                    '<div class="commentThumb element1"><img src="', data.picURL, '"></div>',
                                    '<div class="commentContainer element2">',
                                        '<div class="commentHeader wrap">',
                                            '<ul class="commenterMetaList element1">',
                                                '<li class="commenter"><a href="javascript:;">', data.userDisplayName, '</a></li>',
                                                '<li class="commenterLocation">', data.userLocation, '</li>',
                                                trustedUser,
                                            '</ul>',
                                        '</div><!-- close commentHeader -->',
                                        '<div class="commentBody">',
                                            '<p>', data.commentBody, '</p>',
                                        '</div><!-- close commentBody -->',
                                        '<div class="commentFooter wrap"></div><!-- close commentFooter -->',
                                    '</div><!-- close commentContainer -->',
                                '</div><!-- close opposingFloatControl -->',
                            '</li><!-- close comment -->',
                        '</ol>',
                        (data.commentType !== 'userReply') ? '<div class="doubleRuleDivider"></div>' : '',
                    '</div>'
                ].join("");
            },

            commentConfirmationComment: function (data) {
                var trustedUser = (data.trusted) ? [
                    '<li class="commenterCredentials">',
                        '<div class="containingBlock">',
                            '<span class="commenterTrustedIcon">Verified</span>',
                        '</div>',
                    '</li>'
                ].join("") : "";

                return [
                    '<li class="comment">',
                        '<div class="opposingFloatControl wrap">',
                            '<div class="commentThumb element1"><img src="', data.picURL, '"></div>',
                            '<div class="commentContainer element2">',
                                '<div class="commentHeader wrap">',
                                    '<ul class="commenterMetaList element1">',
                                        '<li class="commenter"><a href="javascript:;">', data.userDisplayName, '</a></li>',
                                        '<li class="commenterLocation">', data.userLocation, '</li>',
                                        trustedUser,
                                    '</ul>',
                                '</div><!-- close commentHeader -->',
                                '<div class="commentBody">',
                                    '<p>', data.commentBody, '</p>',
                                '</div><!-- close commentBody -->',
                                '<div class="commentFooter wrap"></div><!-- close commentFooter -->',
                            '</div><!-- close commentContainer -->',
                        '</div><!-- close opposingFloatControl -->',
                    '</li><!-- close comment -->'
                ].join("");
            },

            bylineCommentMarker: function (data) {
                var numOfComments = (data.cCount > 1) ? data.cCount + " Comments" : (data.cCount === 1) ? "1 Comment" : "Comment";
                var link = (data.cCount > 0) ? "#commentsContainer" : "#postcomment";
                
                return [
                    '<span id="datelineCommentCount" class="commentCount">',
                        '<a class="commentCountLink icon commentIcon" href="', link, '">', numOfComments, '</a>',
                    '</span>'
                ].join("");
            },

            ie6Message: function () {
                return [
                    '<div class="commentsZero commentsUpgradeBrowser">',
                        '<div class="inset">',
                            '<p>Comments are no longer supported on Internet Explorer 6. Please upgrade your browser with one of the following options:',
                                '<a href="http://www.mozilla.org/firefox">Mozilla Firefox</a>,',
                                '<a href="http://www.google.com/chrome">Google Chrome</a> or',
                                '<a href="http://www.microsoft.com/IE9">Microsoft Internet Explorer 9</a>.',
                            '</p>',
                        '</div>',
                    '</div><!-- close commentsZero -->'
                ].join("");
            }
        }
    };
}
