$(document).ready(function() {
  $('.form-control-feedback').css('cursor', 'default');

  $('.form-control-feedback').click(function() {
    if ($(this).hasClass('fa-eye')) {
      $(this)
        .siblings()
        .attr('type', 'text');
    } else {
      $(this)
        .siblings()
        .attr('type', 'password');
    }

    $(this).toggleClass('fa-eye fa-eye-slash');
  });
});
