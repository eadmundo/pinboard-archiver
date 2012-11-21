(function (jQuery) {
    jQuery(document).ready(function() {
        // initializes comment app
        NYTD.commentsInstance = new EmbeddedComments(jQuery, 'NYTD.commentsInstance');
        NYTD.commentsInstance.init({configName: 'default'});
    });
    jQuery(document).bind('NYTD:EmbeddedCommentsStarted', function() {
        // adds a nice fade in effect to Embedded Comments ads
        window.setTimeout(NYTD.fadeEmbeddedCommentAds, 3000);
    });
    NYTD.fadeEmbeddedCommentAds = function() { 
        var tileAd = jQuery('#embeddedCommentsTileAd');
        var bigAd = jQuery('#embeddedCommentsBigAd');
        var bigAd3 = jQuery('#BigAd3');
        var spon2 = jQuery('#Spon2');
        var comments = jQuery('#commentsColumnGroup');
        var cColumn = jQuery('#cColumn');
        var abColumn = jQuery('#abColumn');

        if (tileAd[0]) {
            tileAd.appendTo(jQuery('#commentTileAd'));
            tileAd.removeClass("hidden");
        }
    
        if (bigAd[0] && comments[0] && cColumn[0] && abColumn[0] && spon2[0] && bigAd3[0]) {
            bigAd3.hide().fadeIn(1000);
            spon2.hide().fadeIn(1000);
            bigAd.css({
                position: 'relative',
                top: Math.max(comments.offset().top-bigAd.offset().top, 0)
            }).removeClass('hidden');
        }
    };
}(NYTD.jQuery));