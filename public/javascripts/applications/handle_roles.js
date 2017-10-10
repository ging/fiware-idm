
// Handle button clicks and asynchronous request to the server in order to create roles

$(document).ready(function(){

    // Show permissions of a role
    $("#update_owners_roles").on("click",".btn", function(){
        var role = $(this).attr('id');
        var permission = null;
        for (var i = 0; i < application.permissions.length; i++) {
            permission = application.permissions[i].id
            if (typeof application.role_permission_assign[role] === 'undefined') {
                $("[data-permission-id="+permission+"]").removeClass("active")
            } else {
                if(application.role_permission_assign[role].includes(permission)) {
                    $("[data-permission-id="+permission+"]").addClass("active")    
                } else {
                    $("[data-permission-id="+permission+"]").removeClass("active")
                }
            }
        }
        $("#update_owners_permissions").show();
        $("#update_owners_info_message").hide();
    });

    // To show a little form to edit a role
    $("#update_owners_roles").on("click",".ajax-inline-edit", function(event) { 
        
        // Stop linking        
        event.preventDefault();

        // Load template
        var edit_role = $('#edit_role').html();

        // Edit template with role and applications ids and role name
        var role_name = $(this).parent().find("label").html();
        var role_id = String($(this).attr("href").split("/")[6])
        var app_id = String(application.id)

        edit_role = edit_role.replace(/app_id/g, app_id);
        edit_role = edit_role.replace(/role_id/g, role_id);
        edit_role = edit_role.replace(/role_name/g, role_name);

        // Replace the row with the template edit_role edited
        $("#update_owners_roles").find("#"+role_id).replaceWith(edit_role);
    });

    // To delete a role
    $("#update_owners_roles").find(".ajax-modal").click(function () {
        alert("delete "+$(this).attr("href").split("/")[6])
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

    // Handle the submit button from the edit role form
    $("#update_owners_roles").on("click",".inline-edit-submit", function(event) { 
        
        // Stop linking        
        event.preventDefault();

        // Body parameters of request
        var role_id = String($(this).attr("href").split("/")[6])
        var role_name = $("#update_owners_roles").find("#"+role_id+".form-control").val()

        // Send put request
        $.ajax({
            url: $(this).attr('href'),
            type: 'PUT',
            data: { role_name: role_name, role_id: role_id },
            success: function(result) {
                if (result === "success") {
                    var role_row = $('#table_row_role_template').html();
                    role_row = role_row.replace(/role_name/g, role_name);
                    role_row = role_row.replace(/role_id/g, role_id);
                    role_row = role_row.replace(/app_id/g, String(application.id));
                    $("#update_owners_roles").find("#"+role_id).replaceWith(role_row);
                    $("#assign_role_permission_form").find("#alert_error").hide('close');
                } else {
                    $("#assign_role_permission_form").find("#alert_error").show('open');
                }
            }
        });

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

        	// See if the result of post is an error
        	if (data.constructor === Array) {
        		if(data[0].message == "nameRole") {
                    $(".help-block.alert.alert-danger").show('open');
                    return false;
        		}
            // If is not an error, add the role to the list	
        	} else {
                
        		// Create new row in role column
        		var role_row = $('#table_row_role_template').html();
                role_row = role_row.replace(/role_name/g, data.name);
                role_row = role_row.replace(/role_id/g, String(data.id));
                role_row = role_row.replace(/app_id/g, String(application.id));
                $("#update_owners_roles").append(role_row);

                // Add to roles array
                application.roles.push(data);

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