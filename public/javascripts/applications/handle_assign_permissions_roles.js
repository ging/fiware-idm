
// Handle button clicks and asynchronous request to the server in order to create permissions

$(document).ready(function(){

	// Handle the submit button from the create role form
	$("#assign_role_permission_form").submit(function(event) {
		// stop form from submitting normally
	    event.preventDefault();

	    // get the action attribute from the <form action=""> element 
	    var $form = $(this),
	        url = $form.attr('action');

	    // Send the data using post with element id name and name2
	    var posting = $.post(url, application.role_permission_assign);

	    // Alerts the results 
	    posting.done(function(data) {
	    	if (data == "success") {
    			window.location.href = "/idm/applications/"+application.id
	    	} else {
    			window.location.href = "/idm/applications/"+application.id+"/edit/roles"
	    	}
	    });
  });
});