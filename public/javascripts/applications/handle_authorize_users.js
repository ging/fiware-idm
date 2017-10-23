
// Handle authorize users to the application

$(document).ready(function(){

	// Pop up with a form to authorize new users to the application
	$('#auth_users_action_manage_application_users').click(function () {
		$('#backdrop').show();
        $('#authorize_user').show('open');
        
		for (var i = 0; i < users_authorized.length; i++) {
			if (!$("#authorize_user").find(".members").find("#"+users_authorized[i].user_id).length) {
				var assign_role_user_row = $('#table_row_assign_role_user_template').html();
		        assign_role_user_row = assign_role_user_row.replace(/username/g, String(users_authorized[i].username));
		        assign_role_user_row = assign_role_user_row.replace(/user_id/g, String(users_authorized[i].user_id));
		        assign_role_user_row = assign_role_user_row.replace(/application_name/g, String(application.name));
		        if (user_role_count[users_authorized[i].user_id]) {
		        	assign_role_user_row = assign_role_user_row.replace(/roles_count/g, String(user_role_count[users_authorized[i].user_id] + " roles"));
		        }     
		        $("#authorize_user").find(".members").append(assign_role_user_row);
		        for (j in roles) {
		        	var role = "<li id="+roles[j].id+" class='role_dropdown_role'><i class='fa fa-check'></i>"+roles[j].name+"</li>"
		        	$("#authorize_user").find(".members").find("#"+users_authorized[i].user_id).find("ol").append(role)
		        }
			}
			$("#authorize_user").find(".members").find("#"+users_authorized[i].user_id).find("#"+users_authorized[i].role_id).addClass("active")
        }
	});

	// Exit from form to authorize users to the application
    $("#authorize_user").find('.cancel, .close').click(function () {
    	input_change_authorize = null
    	users_authorized = users_authorized_original
    	user_role_count = user_role_count_original
        $('#backdrop').hide();
        $("#alert_error_search_available").hide("close")
        $(".alert-warning").hide("close")
        $("#authorize_user").find(".modal-footer").find("#submit_button").val("Save")
        $("#authorize_user").find('#no_available_update_owners_users').hide('close');
        $("#authorize_user").find('#perform_filter_available_update_owners_users').show('open');
        $('#authorize_user').hide('close');
        $("#authorize_user").find('#available_update_owners_users').val('');
        $("#authorize_user").find(".available_members").empty()
        $("#authorize_user").find(".members").empty()
    });

    var timer;
    var input_change_authorize = null
    // Send requests to server to obtain usernames and show in available members column
    $("#authorize_user").find('#available_update_owners_users').bind("keyup input",function(e) {

    	if($(this).val().indexOf('%') > -1 || $(this).val().indexOf('_') > -1) {

    		$("#authorize_user").find("#alert_error_search_available").show("open")
    		$("#authorize_user").find(".available_members").empty()
    		$("#authorize_user").find("#spinner_update_owners_users").hide('close')

    		input_change_authorize = $(this).val();

	    } else {
      
	    	$("#alert_error_search_available").hide("close")
	    	clearTimeout(timer);
	    	$("#authorize_user").find("#spinner_update_owners_users").show('open')
        	var input = $(this).val();
        	timer = setTimeout(function(){
        		input_change_authorize = available_users(input, input_change_authorize)
        	}, 300);
	    }    
    });


    // Filter authorized members
    $("#authorize_user").find('#update_owners_users_members').bind("keyup input",function(e) {
    	input = $(this);
	    filter = $(this).val().toUpperCase();
	    ul = $("#authorize_user").find(".members");
	    li = ul.children();

	    for (i = 0; i < li.length; i++) {
	        span = li[i].querySelectorAll("span.name")[0];
	        if (span.innerHTML.toUpperCase().indexOf(filter) > -1) {
	            li[i].style.display = "";
	        } else {
	            li[i].style.display = "none";
	        }
	    }
  
    	$("#alert_error_search_authorized").hide("close") 
    	
    });

    // Change available member to members column
    $("#available_members").on("click",".active", function(event) { 

    	// Stop linking        
        event.preventDefault();

        // item of list
        row = $(this).parent()

        // Id and name of user
        var user_id = row.parent().attr("id")
        var username = row.find(".name").html()

        if (users_authorized.some(member => member.user_id === user_id)) {
        	info_added_user = "<span id='info_added_user' style='display: none; text-align: center;' class='help-block alert alert-warning'>User "+user_id+" has been already added</span>"
        	$("#authorize_user").find("#info_added_user").replaceWith(info_added_user);
        	$("#authorize_user").find("#info_added_user").fadeIn(800).delay(300).fadeOut(800);
	    } else {
	    	var assign_role_user_row = $('#table_row_assign_role_user_template').html();
	        assign_role_user_row = assign_role_user_row.replace(/username/g, String(username));
	        assign_role_user_row = assign_role_user_row.replace(/user_id/g, String(user_id));
	        assign_role_user_row = assign_role_user_row.replace(/application_name/g, String(application.name))
	        assign_role_user_row = assign_role_user_row.replace(/roles_count/g, String("No roles"));
	        $("#authorize_user").find(".members").append(assign_role_user_row);
	        for (j in roles) {
	        	var role = "<li id="+roles[j].id+" class='role_dropdown_role'><i class='fa fa-check'></i>"+roles[j].name+"</li>"
	        	$("#authorize_user").find(".members").find("#"+user_id).find("ol").append(role)
	        }

	        info_added_user = "<span id='info_added_user' style='display: none; text-align: center;' class='help-block alert alert-success'>User "+user_id+" added</span>"
        	$("#authorize_user").find("#info_added_user").replaceWith(info_added_user);
        	$("#authorize_user").find("#info_added_user").fadeIn(800).delay(300).fadeOut(800);
        	if (!user_role_count[user_id]) {
      			user_role_count[user_id] = 0;
      			users_authorized.push({user_id: user_id, role_id: "", username: username});
    		}

	    }
    });

    // Remove authorized member
    $(".members").on("click",".remove", function(event) { 

    	// Stop linking    
        event.preventDefault();

        // item of list
        row = $(this).parent()

        // Id and name of user
        var user_id = row.parent().attr("id")
        var username = row.find(".name").html()  
        var index = users_authorized.findIndex(member => member.user_id === user_id); 
        if (index > -1) {
        	users_authorized.splice(index, 1);
        	delete user_role_count[user_id]
        }
        var info_added_user = "<span id='info_added_user' style='display: none; text-align: center;' class='help-block alert alert-success'>User "+user_id+" removed from application</span>"
    	$("#authorize_user").find("#info_added_user").replaceWith(info_added_user);
    	$("#authorize_user").find("#info_added_user").fadeIn(800).delay(300).fadeOut(800);
    	row.parent().fadeOut(500, function(){ row.parent().remove(); });
    });

    // Assign roles to users
    $(".members").on("click",".role_dropdown_role", function(event) { 

    	// Stop linking        
        event.stopPropagation();

        var role_id = String($(this).attr("id"))
        var user_id = $(this).closest(".list-group-item").attr("id")
        var username = $(this).closest(".list-group-item").find(".name").html()

        var roles_display = $(this).closest(".list-group-item").find(".roles_display")

        if ($(this).hasClass("active")) {

        	$(this).removeClass("active")
        	user_role_count[user_id]--        	
        	if (user_role_count[user_id] <= 0) {
        		roles_display.html("No roles")
        	} else {
        		roles_display.html(String(user_role_count[user_id])+" roles")	
        	}

        	users_authorized = users_authorized.filter(function(obj) {
			    return (obj.user_id !== user_id || obj.role_id !== role_id);
			});

        } else {

        	$(this).addClass("active")
        	user_role_count[user_id]++
        	roles_display.html(String(user_role_count[user_id]+" roles"))
        	users_authorized.push({user_id: user_id, role_id: role_id, username: username});
        }
    });

    // Handle the submit button from to submit assignment
	$("#submit_authorized_users_form").bind("keypress submit", function(event) {

		// stop form from submitting normally
		if (event.which == 13) {
	    	event.preventDefault();
		} else if (event.type == "submit") {

			// stop form from submitting normally
			event.preventDefault();

			for (var key in user_role_count) {
					if (user_role_count[key] == 0) {
						$(".alert-warning").show("open")
						$("#authorize_user").find(".members").find("#"+key).find(".role_options").addClass("dropdown-empty")
					}
				}

			if ($("#authorize_user").find(".members").find(".dropdown-empty").length === 0 || $("#authorize_user").find(".modal-footer").find("#submit_button").val() == "Confirm") {
				// get the action attribute from the <form action=""> element 
		        var $form = $(this),
		            url = $form.attr('action');

		        users_authorized = users_authorized.filter(function(elem) {
		        	return (elem.role_id !== "")
		        });
		      
		        // Send the data using post with element id name and name2
		        var posting = $.post(url, { submit_authorize: users_authorized });

		        // Alerts the results 
		        posting.done(function(result) {
		        	if (result.type == "success") {
		        		input_change_authorize = null
				        $('#backdrop').hide();
				        $("#alert_error_search_available").hide("close")
				        $("#authorize_user").find('#no_available_update_owners_users').hide('close');
				        $("#authorize_user").find('#perform_filter_available_update_owners_users').show('open');
				        $('#authorize_user').hide('close');
				        $("#authorize_user").find('#available_update_owners_users').val('');
				        $("#authorize_user").find(".available_members").empty()
				        $("#authorize_user").find(".members").empty()	
		        	} else {

		        	}

	        		var message = $('#message_template').html();
	                message = message.replace(/type/g, result.type);
	                message = message.replace(/data/g, result.text);
	                $(".messages").replaceWith(message);

		        });
			} else {
				$("#authorize_user").find(".modal-footer").find("#submit_button").val("Confirm")	
			}
		}
  	});

  	// To remove message
    $("#container.container-fluid").on("click","#close_message",function () {
    	alert("ja")
        $(".messages").empty();
    });

});


// Function to search available members
function available_users(input, input_change_authorize) {

	if (input.length > 1 && input_change_authorize !== input) {

		$("#authorize_user").find('#perform_filter_available_update_owners_users').hide('close');

		var url = "/idm/applications/"+ application.id +"/available/users"
    	var key = { username: input }

    	$.post(url, key, function(data) {
			if(data.constructor === Array){
				$("#authorize_user").find(".available_members").empty()
				for(available_user in data) {
					var authorize_user_row = $('#table_row_authorize_user_template').html();
		            authorize_user_row = authorize_user_row.replace(/username/g, String(data[available_user].username));
		            authorize_user_row = authorize_user_row.replace(/user_id/g, String(data[available_user].id));
		            $("#authorize_user").find(".available_members").append(authorize_user_row);
		            $("#authorize_user").find("#spinner_update_owners_users").hide('close')
		            $("#authorize_user").find('#no_available_update_owners_users').hide('close');
				}
			} else {
				$("#authorize_user").find("#spinner_update_owners_users").hide('close')
				$("#authorize_user").find(".available_members").empty()
				$("#authorize_user").find('#no_available_update_owners_users').show('open');
			}
		});
	} else if (input_change_authorize !== input && input.length < 1){
		$("#authorize_user").find(".available_members").empty()
		$("#authorize_user").find('#no_available_update_owners_users').hide('close');
        $("#authorize_user").find('#perform_filter_available_update_owners_users').show('open');
        $("#authorize_user").find("#spinner_update_owners_users").hide('close')
	} else {
		$("#authorize_user").find("#spinner_update_owners_users").hide('close')
	}

	input_change_authorize = input;
	return input_change_authorize
}