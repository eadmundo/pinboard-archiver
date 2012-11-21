/*
 * $Id: previousNext.js 113781 2012-10-16 21:46:02Z joseph.williams $
 */

(function ($) {
    var wto = NYTD.wto;
    wto.flyInModuleVisibility = 'hidden';
    wto.testAlias = 'ta_nyt5_previousNext';

    wto.templates = {
        previousNext : [
            '<div class="postNavigation nocontent">',
                '<ul class="opposingFloatControl wrap">',
                    '<li class="element1">',
                        '<span class="previous">Previous Article</span>',
                        '<a title="%%prevArticleTitle%%" href="%%prevArticleLink%%" class="postTitle">%%prevArticleTitle%%</a>',
                    '</li>',
                    '<li class="element2"> ',
                        '<span class="next">Next Article</span>',
                        '<a title="%%nextArticleTitle%%" href="%%nextArticleLink%%" class="postTitle">%%nextArticleTitle%%</a>',
                    '</li>',
                '</ul>',
            '</div>'
        ].join('\n')
    };

    var setPreviousNextMarkup = function(prevArticle, nextArticle) {
        var previousNextMarkup = replaceArticleMacros(prevArticle, nextArticle);
        NYTD.wto.runWhenReady(isFacebookModuleReady, cleanupFacebookModule, 10, 100);
        $('#cColumn').prepend(previousNextMarkup);
        setCSS();
    };

    var replaceArticleMacros = function (prevArticle, nextArticle) {
        var tmplt = wto.templates.previousNext;

        if (prevArticle !== undefined) {
            tmplt = tmplt.replace(/%%prevArticleTitle%%/g, prevArticle.title);
            tmplt = tmplt.replace(/%%prevArticleLink%%/, prevArticle.link);
        } else {
            tmplt = tmplt.replace(/Previous Article/, '');
            tmplt = tmplt.replace(/href=\"%%prevArticleLink%%\" class=\"postTitle\"/, 'style=\"display:none\"');
        }

        if (nextArticle !== undefined) {
            tmplt = tmplt.replace(/%%nextArticleTitle%%/g, nextArticle.title);
            tmplt = tmplt.replace(/%%nextArticleLink%%/, nextArticle.link);
        } else {
            tmplt = tmplt.replace(/Next Article/, '');
            tmplt = tmplt.replace(/href=\"%%nextArticleLink%%\" class=\"postTitle\"/, 'style=\"display:none\"');
        }

        return tmplt;
    };

    var setCSS = function () {
        $('.postNavigation').css({
            'padding': '0'
        });

        $('.postNavigation ul').css({
            'background': 'url(/images/blogs_v3/nyt_universal/blognav.gif) repeat-y scroll 50% 0 transparent'
        });

        $('.postNavigation li').css({
            'background': 'none repeat scroll 0 0 transparent',
            'font-family': 'arial,helvetica,sans-serif',
            'padding': '0',
            'width': '49%'
        });

        $('.postNavigation .next, .postNavigation .previous, .postNavigation .postTitle').css({
            'display': 'block',
            'padding': '0 30px'
        });

        $('.postNavigation .next, .postNavigation .previous').css({
            'color': '#999999',
            'font-size': '0.85em',
            'font-weight': 'bold',
            'margin-bottom': '2px',
            'padding': '0 30px',
            'text-transform': 'uppercase'
        });

        $('.postNavigation .element1 a').css({
            'background': 'url(/gfx/blogs/common/shell/postnav_arrow_left.gif) no-repeat scroll left top transparent',
            'margin-left': '10px',
            'padding': '0 5px 0 20px'
        });

        $('.postNavigation .element2 a').css({
            'background': 'url(/gfx/blogs/common/shell/postnav_arrow_right.gif) no-repeat scroll right top transparent',
            'margin-right': '10px',
            'padding': '0 20px 0 5px'
        });

        $('.postNavigation .postTitle').css({
            'font-size': '1em',
            'font-weight': 'bold'
        });

        $('.postNavigation .next, .postNavigation .previous, .postNavigation .postTitle').css({
            'display': 'block'
        });

        $('.postNavigation .element2').css({
            'text-align': 'right'
        });

        $('.opposingFloatControl .element2').css({
            'float': 'right'
        });
    };

    var isFacebookModuleReady = function () {
        var exists = false;

        if ($('#facebookContainer') !== null) {
            exists = true;
        }

        return exists;
    };

    var cleanupFacebookModule = function () {
        $('#facebookContainer').remove();
    };

    var findPreviousNextArticles = function(results) {
        var currentArticleIndex,
            previousArticleIndex,
            nextArticleIndex,
            $articleMetaURL = $("meta[property='og:url']")[0].content,
            comparisonURL1,
            comparisonURL2,
            numberOfArticles = results.items.length;

        $(results.items).each(function(i, article) {
            comparisonURL1 = $articleMetaURL.split('?')[0];
            comparisonURL2 = article.link.split('?')[0];

            if (comparisonURL1 === comparisonURL2) {
                currentArticleIndex = i;
            }
        });

        if (currentArticleIndex < (numberOfArticles - 1) && currentArticleIndex > 0) {
            previousArticleIndex = currentArticleIndex - 1;
            nextArticleIndex = currentArticleIndex + 1;
        } else if (currentArticleIndex === 0) {
            previousArticleIndex = numberOfArticles - 1;
            nextArticleIndex = currentArticleIndex + 1;
        } else if (currentArticleIndex === (numberOfArticles - 1)) {
            previousArticleIndex = currentArticleIndex - 1;
            nextArticleIndex = 0;
        }

        setPreviousNextMarkup(results.items[previousArticleIndex], results.items[nextArticleIndex]);
    };

    var handleFacebookConversions = function (e, $elementClicked) {
        var conversionName,
            $linkURL;

        if ($elementClicked.is('a')) {
            $linkURL = $elementClicked.attr('href');

            if ($elementClicked.hasClass('fb_button')) {
                conversionName = 'facebook_login_button';
            } else if ($linkURL === 'http://www.nytimes.com/privacy') {
                conversionName = 'facebook_privacy_link';
            } else if ($linkURL === 'http://www.nytimes.com/packages/html/timespeople/faq/social/') {
                conversionName = 'facebook_social_faq_link';
            } else if ($elementClicked.parent('p').hasClass('popular')) {
                conversionName = 'facebook_popular_article_link';
            }

            NYTD.wto.linkConversion({
                e: e,
                convName: conversionName
            });
        }

        if ($elementClicked.is('span')) {
            if ($elementClicked.hasClass('fb_button_text')) {
                conversionName = 'facebook_login_button';

                NYTD.wto.nonLinkEventConversion({
                    e: e,
                    convName: conversionName
                });
            }
        }
    };

    var handleNavigationConversions = function (e, $elementClicked) {
        var conversionName,
            $elementParent;

        if ($elementClicked.is('a')) {
            $elementParent = $elementClicked.parent('li');
            
            if ($elementParent.hasClass('element1')) {
                conversionName = 'previous_article_link';
            } else if ($elementParent.hasClass('element2')) {
                conversionName = 'next_article_link';
            }
            NYTD.wto.linkConversion({
                e: e,
                convName: conversionName
            });
        }
    };

    var handleFlyInConversions = function (e, $elementClicked) {
        var conversionName,
            $elementParent;

        if ($elementClicked.is('a')) {
            $elementParent = $elementClicked.parent();

            if ($elementParent.is('h3')) {
                conversionName = 'flyin_article_link';
            } else if ($elementParent.is('p') && $elementParent.hasClass('refer')) {
                conversionName = 'flyin_readMore_link';
            }

            NYTD.wto.linkConversion({
                e: e,
                convName: conversionName
            });
        }

        if ($elementClicked.is('button')) {
            conversionName = 'flyin_close_button';

            NYTD.wto.nonLinkEventConversion({
                e: e,
                convName: conversionName
            });
        }

        if ($elementClicked.is('img.toggleControl')) {
            conversionName = 'flyin_toggle_openAndClose';

            NYTD.wto.nonLinkEventConversion({
                e: e,
                convName: conversionName
            });
        }
    };

    var routeConversions = function () {
        var conversionName,
            $elementClicked,
            $documentHeight,
            $windowHeight,
            $windowScrollTop,
            $documentContainer = $('body').eq(0),
            $navContainer;

        $(window).on('scroll', function (e) {
            $documentHeight = $(document).height();
            $windowHeight = $(window).height();
            $windowScrollTop = $(window).scrollTop();

            if (($documentHeight - $windowHeight) - $windowScrollTop < 230 &&
                wto.flyInModuleVisibility === 'hidden') {
                if ($('#upNextWrapper').css('visibility') === 'visible') {
                    conversionName = 'flyInModule_isVisibleOnPage';
                    wto.flyInModuleVisibility = 'visible';

                    NYTD.wto.nonLinkEventConversion({
                        e: e,
                        convName: conversionName
                    });
                }
            }
        });

        $documentContainer.on('mouseup', function (e) {
            if (e.target) { // All browsers except for IE
                $elementClicked = $(e.target);
            } else if (e.srcElement) { // IE
                $elementClicked = $(e.srcElement);
            }

            $navContainer = $('div.postNavigation').eq(0).attr('id', 'previousNextNYT5Module_75983');

            /*
                Only send conversions for clicks that originate outside of the
                previous/next, Facebook and flyIn modules
            */
            if ($elementClicked.is('#previousNextNYT5Module_75983 *, #previousNextNYT5Module_75983')) {
                handleNavigationConversions(e, $elementClicked);
            } else if ($elementClicked.is('#facebookContainer *, #facebookContainer')) {
                handleFacebookConversions(e, $elementClicked);
            } else if ($elementClicked.is('#upNextWrapper *, #upNextWrapper')) {
                handleFlyInConversions(e, $elementClicked);
            } else {

                conversionName = 'clickOutsideOfTestedModules';

                if ($elementClicked.is('a')) {
                    NYTD.wto.linkConversion({
                        e: e,
                        convName: conversionName
                    });
                } else {
                    NYTD.wto.nonLinkEventConversion({
                        e: e,
                        convName: conversionName
                    });
                }
            }
        });
    };

    var showModules = function () {
        // Show Facebook and Fly-In modules
        $('#facebookContainer, #upNextWrapper').css({
            'visibility': 'visible'
        });
    };

    var initVariation1 = function () {
        var jsonpURL = $("meta[name='sectionfront_jsonp']")[0].content;

        window.jsonFeedCallback = findPreviousNextArticles;

        $.ajax({
            url: jsonpURL,
            dataType: 'jsonp',
            success: jsonFeedCallback
        });

        setTimeout(function () {showModules();}, 2000);
    };

    wto.runExperiment = function (experimentName) {
        routeConversions();

        if (experimentName === 'control') {
            showModules();
        } else if (experimentName === 'var1') {
            NYTD.wto.runWhenReady(isFacebookModuleReady, initVariation1, 10, 100);
        }
    };

}) (NYTD.jQuery);