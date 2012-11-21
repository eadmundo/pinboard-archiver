$(document).ready(function() {

  var wasSubmitted = false;

  function checkBeforeSubmit(){
    if(!wasSubmitted) {
      wasSubmitted = true;
      return wasSubmitted;
    }
    return false;
  }

  function invalidate_phone(phone) {
    phone_length = phone.replace(/[^0-9]/g, "");
    return phone_length.length < 7;
  }

  function invalidate_email(email) {
    atPos = email.indexOf("@");
    dotPos = email.lastIndexOf(".");
    return (atPos < 1 || dotPos - atPos < 2)
  }

  var invalid = function ($field) {
    if ($field[0].id == "email") {
      return invalidate_email($field.val());
    } else if ($field[0].id == "phone") {
      return invalidate_phone($field.val());
    } else {
      return $.trim($field.val()).length <= 0
    }
  };

  function wrapError($element) {
    $element.wrap('<div class="field_with_errors" />');
    var tooltipHtml = '<p class="alert_box tooltip">This field is required<span class="icon icon2-alert_tooltip"></span></p>';
    $element.after('<div class="error_wrapper"><div class="error_inner">' + tooltipHtml + '</div></div></div>');
  };

  function clearErrors($element) {
    if ($element.parent().hasClass('field_with_errors')) $element.unwrap();
    if ($element.next().hasClass('error_wrapper') && !($element.next().hasClass('no-hide'))) {
      $element.next().detach();
    }
  }

  $("form#job_application, form#contact_form, form#get-started-form, form#international-lead, form#newsletter, form#intl_form, form#eu-contact, form#canada-contact, form#uk-contact").submit(function (e) {
    var $form = $(this);

    $form.find("#accept-tos").each(function () {
      var $field = $(this);

      if ($field.attr('checked') == 'checked') {
        e.preventDefault();
      }
    });

    $form.find(".required").each(function () {
      var $field = $(this);
      var $label = $form.find("[for=" + $field[0].id + "]");
      clearErrors($field);
      clearErrors($label);

      if (invalid($field)) {
        wrapError($field);
        wrapError($label);
        e.preventDefault();
      }
    });
  });
});
