
// Handle button clicks and asynchronous request to the server in order to create roles

$(document).ready(function(){

    // Show permissions of a role
    $("#update_owners_roles").on("click",".btn", function(){
        var role = $(this).attr('id');
        var permission = null;
        for (var i = 0; i < application.permissions.length; i++) {
            permission = application.permissions[i].id
            if(application.role_permission_assign[role].includes(permission)) {
                $("[data-permission-id="+permission+"]").addClass("active")    
            } else {
                $("[data-permission-id="+permission+"]").removeClass("active")
            }
        }
        $("#update_owners_permissions").show();
        $("#update_owners_info_message").hide();
    });

    // Pop up with a form to create a new role
    $('#roleButton').click(function () {
      	$('#backdrop').show('open');
        $('#create_role').show('open');
        return false;
	});

    // Exit from form to create new role
	$('#esc_role_creation').click(function () {
    	$('#backdrop').hide('close');
        $('#create_role').hide('close');
        $(".help-block.alert.alert-danger").hide('close');
        return false;
	});

	// Handle the submit button from the create role form
	$("#create_role_form").submit(function(event) {

    // stop form from submitting normally
    event.preventDefault();

    // get the action attribute from the <form action=""> element 
    var $form = $(this),
        url = $form.attr('action');

    // Send the data using post with element id name and name2
    var posting = $.post(url, { name: $("#create_role_form").find('#id_name').val() });

    // Alerts the results 
    posting.done(function(data) {

    	// See if the result of post data has been an error
    	if (data.constructor === Array) {
    		if(data[0].message == "nameRole") {
                $(".help-block.alert.alert-danger").show('open');
                return false;
    		}
        // If is not an error, add the role to the list	
    	} else {
    		// Create new row in role column
    		var role = $('#table_row_role_template').html();
            role = role.replace("nameRole", data.name)
            $("#update_owners_roles").append(role)

            // Empty input from role creation form
            $("#create_role_form").find("#id_name").val('');

            // Hide error if exist
            $(".help-block.alert.alert-danger").hide('close');

            // Return to normal view
            $('#backdrop').hide('close');
          	$('#create_role').hide('close');
    	}	   
    });

  });
});