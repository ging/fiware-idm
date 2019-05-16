// Handle button clicks and asynchronous request to the server in order to assign permissions to roles

$(document).ready(function() {
  // Handle the submit button from the create role form
  $('#assign_role_permission_form').on('submit', function(event) {
    // stop form from submitting normally
    event.preventDefault();

    // Change value of hidden input
    $('#submit_access_control_assignment').val(
      JSON.stringify(application.role_permission_assign)
    );
    $('#submit_usage_control_assignment').val(
      JSON.stringify(application.role_policy_assign)
    );

    // Continue with the submit request
    $('#assign_role_permission_form')[0].submit();
  });
});
