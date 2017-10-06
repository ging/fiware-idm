
// Handle button clicks and asynchronous request to the server in order to create permissions

$(document).ready(function(){

    // Select permission item from list
    $("#update_owners_permissions").on("click",".list-group-item", function(){
        var permission = $(this).attr('data-permission-id');
        var role = $("#update_owners_roles").find('div.active').attr('id');
        if ($("[data-permission-id="+permission+"]").hasClass("active")) {
            application.role_permission_assign[role].push(permission);
        } else {
            index = application.role_permission_assign[role].indexOf(permission);
            if (index > -1) {
                application.role_permission_assign[role].splice(index, 1);
            }
        }
        alert(application.role_permission_assign)
        $("[data-permission-id="+permission+"]").toggleClass("active")
    });


	// Pop up with a form to create a new permission
	$('#permButton').click(function () {
		$('#backdrop').show('open');
        $('#create_permission').show('open');
        return false;
	});

	// Exit from form to create new permission
	$('#esc_perm_creation').click(function () {
		$('#backdrop').hide('close');
        $('#create_permission').hide('close');
        return false;
	});

	// Handle the submit button from the create role form
	$("#create_permission_form").submit(function(event) {

    // stop form from submitting normally
    event.preventDefault();

    // get the action attribute from the <form action=""> element 
    var $form = $(this),
        url = $form.attr('action');

    // Send the data using post with element id name and name2
    var posting = $.post(url, { name: $("#create_permission_form").find('#id_name').val(), 
                                description: $('#id_description').val(), 
                                action: $('#id_action').val(), 
                                resource: $('#id_resource').val(), 
                                xml: $('#id_xml').val() });

    // Alerts the results 
    posting.done(function(data) {

    	// See if the result of post data has been an error
    	if (data.constructor === Array) {
    		if(data[0].message == "nameRole") {
    			$(".help-block.alert.alert-danger").show('open');
        	return false;
    		}
        // If is not an error, add the permission to the list	
    	} else {
    		// Create new row in permission column
    		var permission = $('#table_row_permission_template').html();
        permission = permission.replace("namePerm", data.name)
        permission = permission.replace("idPerm", String(data.id))
        $("#list_permissions").append(permission)

        // Empty input from role creation form
        $("#create_permission_form").find("#id_name").val('');
        $('#id_description').val(''); 
        $('#id_action').val(''); 
        $('#id_resource').val(''); 
        $('#id_xml').val('');

        // Hide error if exist
        $(".help-block.alert.alert-danger").hide('close');

        // Return to normal view
        $('#backdrop').hide('close');
      	$('#create_permission').hide('close');
    	}	   
    });

  });
});