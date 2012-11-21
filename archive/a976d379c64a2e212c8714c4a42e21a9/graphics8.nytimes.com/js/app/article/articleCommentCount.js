/* $Id: articleCommentCount.js 107838 2012-08-21 17:14:08Z surya.sanagavarapu $
/js/app/article/articleCommentCount.js
(c) 2009 The New York Times Company */
/*global window, document, NYTD, EmbeddedComments, dcsMultiTrack*/

(function (jQuery) {
    'use strict';

    var $ = jQuery;
    var $readerComment;
    var settings = {};

    function init() {
        $readerComment = $('#readerscomment');
        settings.assetUrl = 'http://' + window.location.hostname + window.location.pathname;
        settings.commentsVersion = NYTD.getCommentsVersion();

        $.ajax({
            url: '/svc/community/V3/requestHandler',
            type: 'GET',
            data: {
                cmd: 'GetUserContentSummary',
                path: encodeURIComponent(settings.assetUrl)
            },
            success: showBlueBox
        });
    }

    function buildTemplate(data) {
        var postCommentLink = (settings.commentsVersion === 1) ? '#postComment' : '#postcomment';
        var viewCommentLink = (settings.commentsVersion === 1) ? '' : '#comments';

        //build reader citation
        var citation = (data.cite !== false) ? '<cite>' + data.cite + '</cite>' : '';

        //Add post and read links based on the comments' status
        var listOfLinks = [];
        if (data.cite !== false) {
            listOfLinks.push('<li><a href="', data.url, '?permid=', data.commentId, '#comment', data.commentId, '" rel="2v">Read Full Comment &#187;</a></li>');
        }
        if (data.canSubmit === true) {
            listOfLinks.push('<li><a href="', data.url, postCommentLink, '" rel="2p">Post a Comment &#187;</a></li>');
        }
        if (data.count > 0 && !data.cite) {
            listOfLinks.push('<li><a href="', data.url, viewCommentLink, '" rel="3v">Read All Comments (', data.count, ') &#187;</a></li>');
        }
        listOfLinks = listOfLinks.join("");

        return [
            '<h3>Readers&rsquo; Comments</h3>',
            '<div class="content">',
                '<blockquote>', data.msg, '</blockquote>',
                citation,
                '<ul class="more">',
                    listOfLinks,
                '</ul>',
            '</div>'
        ].join("");
    }

    function getCommentsUrl(host) {
        host = host || '';
        var commentsUrl = settings.assetUrl.replace("http://" , "");
        return (settings.commentsVersion === 1) ? host + '/comments/' + commentsUrl : '';
    }

    function trackBlueBoxClicks() {
        var data;
        var rel = this.rel;

        switch (rel) {
        case '2v':
            data = {dcsuri: 'view-promo2.html', ti: 'View Promo2', aca: 'Promo2-View'};
            break;
        case '2p':
            data = {dcsuri: 'post-promo2.html', ti: 'Post Promo2', aca: 'Promo2-Post'};
            break;
        case '3v':
            data = {dcsuri: 'view-promo3.html', ti: 'View Promo3', aca: 'Promo3-View'};
            break;
        }
        dcsMultiTrack.apply(window, [
            'DCS.dcssip', 'www.nytimes.com', 
            'DCS.dcsuri', '/article comments/' + data.dcsuri + '.html', 
            'WT.ti', 'Article Comments ' + data.ti, 
            'WT.z_aca', data.aca, 
            'WT.gcom', 'Com'
        ]);
    }

    function showBlueBox(json) {
        var obj = json.results;
        var count = obj.totalCommentsFound || 0;
        var showBox = $readerComment.length > 0 && (obj.excerpts || obj.commentQuestion || obj.canSubmit);
        var $toolCounts = $('.articleTools .commentCount, #commentCount');

        // Articles prior to share tools 2.0 have counts that must be updated.
        if ($toolCounts.length > 0 && count > 0) {
            $toolCounts.html('(' + count + ')');
        }

        // Showing "blue box"
        if (showBox) {
            var excerpt = (obj.hasExcerpt) ? obj.excerpts[0] : false;
            var communityHost = obj.communityHost || 'http://community.nytimes.com';
            var values = {
                url: getCommentsUrl(communityHost),
                count: count,
                msg: '',
                canSubmit: obj.canSubmit,
                commentId: (excerpt) ? excerpt.commentSequence : 0,
                cite: false
            };

            if (excerpt) {
                values.msg = '"' + excerpt.commentExcerpt + '"';
                values.cite = (excerpt.display_name.length > 0 && excerpt.location.length > 0) ? excerpt.display_name + ', ' + excerpt.location : false;
            } else if (obj.commentQuestion) {
                values.msg = obj.commentQuestion;
            }

            //add template to dom with WT tracking on links
            $readerComment
                .html(buildTemplate(values))
                .on('click', 'a', trackBlueBoxClicks);
        }
    }

    // maintaining this reference so we can determine which pages have articleCommentCount.js in the future.
    NYTD.ArticleCommentCount = true;

    $(document).ready(init);

}(NYTD.jQuery));

NYTD.getCommentsVersion = function () {
    return (typeof EmbeddedComments === "function") ? 2 : 1;
};
