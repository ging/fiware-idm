// Parse values obtained from server on view manage roles
$(document).ready(function(){

	// Parse rows in roles column
	for (var i = 0; i < application.roles.length; i++) {

		var role_row = $('#table_row_role_template').html();
	    role_row = role_row.replace(/role_name/g, htmlEntities(application.roles[i].name));
	    role_row = role_row.replace(/role_id/g, application.roles[i].id);
	    role_row = role_row.replace(/app_id/g, application.id);

        if (['provider', 'purchaser'].includes(application.roles[i].id)) {                                         
        	$('#update_owners_roles').prepend(role_row);
        	$('#update_owners_roles').find('#'+application.roles[i].id).children('a').remove()
        } else {
        	$('#update_owners_roles').append(role_row);
        }
	}

	// Parse rows in permissions column
	for (var i = 0; i < application.permissions.length; i++) {

		var permission_row = $('#table_row_permission_template').html();
	    permission_row = permission_row.replace(/perm_id/g, application.permissions[i].id);
	    permission_row = permission_row.replace(/app_id/g, application.id);
	    permission_row = permission_row.replace(/perm_name/g, htmlEntities(application.permissions[i].name));
        if (['1', '2', '3' ,'4' ,'5' ,'6'].includes(application.permissions[i].id)) {                            
        	$('#list_permissions').prepend(permission_row);
        	$('#list_permissions').find('[data-permission-id='+application.permissions[i].id+']').children('span').remove();
        	$('#list_permissions').find('[data-permission-id='+application.permissions[i].id+']').children('.edit_permission').remove();
        	$('#list_permissions').find('[data-permission-id='+application.permissions[i].id+']').children('.fa-trash-o').remove();
        } else {
        	$('#list_permissions').append(permission_row);
        }
	}

	function htmlEntities(str) {
	    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

});

