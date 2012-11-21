/**
 * Learndot Google Analytics: Custom code for tracking data in Google Analytics
 *
 * Copyright: ©2012 Matygo Educational Incorporated operating as Learndot
 *
 * @author Paul Roland Lambert <pr@learndot.com>
 */


$(document).bind('gform_confirmation_loaded', function(event, form_id){
    var idsToFormName = {
        1: "request newsletter",
        3: "request pricing",
        4: "request pricing questions",
        5: "request trial",
        6: "request trial questions"
    };

    _gaq.push(['_trackEvent', 'Form', idsToFormName[form_id]]);
});
