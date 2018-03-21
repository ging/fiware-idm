
// CSRF functions for AJAX POST requests
var beforeSend = function(csrftoken) {

	$.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': csrftoken
        }
    });
};