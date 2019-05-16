var roles = [];
var organizations_authorized = [];
var organization_role_count = {};
var application = {};

$(document).ready(function() {
  var authorized_column = $('#authorize_organization').find(
    '#authorized_organizations'
  );

  function htmlEntities(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Pop up with a form to authorize new organizations to the application
  $('#auth_organizations_action_manage_application_organizations').click(
    function() {
      var applicationId = $(this)
        .closest('#auth_organizations')
        .attr('data-application_id');

      var url = '/idm/applications/' + applicationId + '/edit/organizations';
      $.get(url, function(data) {
        if (data.type === 'error') {
          exit_authorize_organizations();
          $('#authorize_organization').modal('toggle');
        } else {
          organizations_authorized = data.organizations_authorized;
          roles = data.roles;

          // Relation between users and roles
          for (var i = 0; i < organizations_authorized.length; i++) {
            if (
              !organization_role_count[
                organizations_authorized[i].organization_id
              ]
            ) {
              organization_role_count[
                organizations_authorized[i].organization_id
              ] = 0;
            }
            if (organizations_authorized[i].role_id) {
              organization_role_count[
                organizations_authorized[i].organization_id
              ]++;
            }
          }

          if (organizations_authorized.length > 0) {
            for (var i = 0; i < organizations_authorized.length; i++) {
              var organization_row =
                organizations_authorized[i].organization_id;
              var organization_role =
                organizations_authorized[i].role_organization;
              var organization_role_in_app =
                organizations_authorized[i].role_id;

              if (!authorized_column.find('#' + organization_row).length) {
                var assign_role_user_row = $(
                  '#table_row_assign_role_organization_template'
                ).html();
                assign_role_user_row = assign_role_user_row.replace(
                  /organization_name/g,
                  htmlEntities(organizations_authorized[i].name)
                );
                assign_role_user_row = assign_role_user_row.replace(
                  /organization_id/g,
                  String(organizations_authorized[i].organization_id)
                );
                assign_role_user_row = assign_role_user_row.replace(
                  /organization_avatar/g,
                  String(organizations_authorized[i].image)
                );
                if (
                  organization_role_count[
                    organizations_authorized[i].organization_id
                  ] > 0
                ) {
                  assign_role_user_row = assign_role_user_row.replace(
                    /roles_count/g,
                    String(
                      organization_role_count[
                        organizations_authorized[i].organization_id
                      ] + ' roles'
                    )
                  );
                } else {
                  assign_role_user_row = assign_role_user_row.replace(
                    /roles_count/g,
                    'No roles'
                  );
                }
                authorized_column.append(assign_role_user_row);
                for (j in roles) {
                  var role =
                    '<li id=' +
                    roles[j].id +
                    " class='role_dropdown_role'><i class='fa fa-check'></i>" +
                    roles[j].name +
                    '</li>';
                  authorized_column
                    .find('#' + organization_row)
                    .find('#owner')
                    .find('ol')
                    .append(role);
                  authorized_column
                    .find('#' + organization_row)
                    .find('#member')
                    .find('ol')
                    .append(role);
                }
              }
              if (organizations_authorized[i].role_id) {
                authorized_column
                  .find('#' + organization_row)
                  .find('#' + organization_role)
                  .find('#' + organization_role_in_app)
                  .addClass('active');
              }
            }
          } else {
            $('#no_update_organizations').show();
          }
        }
      });
    }
  );

  // Exit from form to authorize users to the application
  $('#authorize_organization')
    .find('.cancel, .close')
    .click(function() {
      exit_authorize_organizations();
    });

  var typingTimerMembers;
  var doneTypingInterval = 500;

  // Send requests to server to obtain organization names and show in available members column
  $('#authorize_organization')
    .find('#available_update_organizations')
    .bind('keyup input', function(e) {
      var input = $(this).val();
      clearTimeout(typingTimerMembers);
      typingTimerMembers = setTimeout(function() {
        available_organizations(
          input,
          'table_row_available_organization_template',
          'available_organizations'
        );
      }, doneTypingInterval);
    });

  // Filter authorized members
  $('#authorize_organization')
    .find('#update_authorized_organizations')
    .bind('keyup input', function(e) {
      input = $(this);
      filter = $(this)
        .val()
        .toUpperCase();
      ul = authorized_column;
      li = ul.children();

      for (i = 0; i < li.length; i++) {
        span = li[i].querySelectorAll('span.name')[0];
        if (span.innerHTML.toUpperCase().indexOf(filter) > -1) {
          li[i].style.display = '';
        } else {
          li[i].style.display = 'none';
        }
      }

      if (authorized_column.children(':visible').length == 0) {
        $('#no_update_organizations').show();
      } else {
        $('#no_update_organizations').hide();
      }
    });

  // Change available member to members column
  $('#available_organizations').on('click', '.active', function(event) {
    // Stop linking
    event.preventDefault();

    $('#no_update_organizations').hide();

    // item of list
    row = $(this).parent();

    // Id and name of user
    var organization_id = row.parent().attr('id');
    var organization_name = row.find('.name').html();
    var organization_image = row
      .parent()
      .find('.avatar')
      .children('img')
      .first()
      .attr('src');

    if (
      $('#authorize_organization')
        .find('ul.update_owners_users_members')
        .find('#' + organization_id).length
    ) {
      info_added_organization =
        "<span id='info_added_organization' style='display: none; text-align: center;' class='help-block alert alert-warning'>Organization " +
        organization_name +
        ' has been already added</span>';
      $('#authorize_organization')
        .find('#info_added_organization')
        .replaceWith(info_added_organization);
      $('#authorize_organization')
        .find('#info_added_organization')
        .fadeIn(800)
        .delay(300)
        .fadeOut(800);
    } else {
      var assign_role_organization_row = $(
        '#table_row_assign_role_organization_template'
      ).html();
      assign_role_organization_row = assign_role_organization_row.replace(
        /organization_name/g,
        organization_name
      );
      assign_role_organization_row = assign_role_organization_row.replace(
        /organization_id/g,
        String(organization_id)
      );
      assign_role_organization_row = assign_role_organization_row.replace(
        /organization_avatar/g,
        String(organization_image)
      );
      assign_role_organization_row = assign_role_organization_row.replace(
        /roles_count/g,
        String('No roles')
      );
      authorized_column.append(assign_role_organization_row);

      for (j in roles) {
        var role =
          '<li id=' +
          roles[j].id +
          " class='role_dropdown_role'><i class='fa fa-check'></i>" +
          roles[j].name +
          '</li>';
        authorized_column
          .find('#' + organization_id)
          .find('#owner')
          .find('ol')
          .append(role);
        authorized_column
          .find('#' + organization_id)
          .find('#member')
          .find('ol')
          .append(role);
      }

      info_added_organization =
        "<span id='info_added_organization' style='display: none; text-align: center;' class='help-block alert alert-success'>Organization " +
        organization_name +
        ' added</span>';
      $('#authorize_organization')
        .find('#info_added_organization')
        .replaceWith(info_added_organization);
      $('#authorize_organization')
        .find('#info_added_organization')
        .fadeIn(800)
        .delay(300)
        .fadeOut(800);
      if (!organization_role_count[organization_id]) {
        organization_role_count[organization_id] = 0;
      }
    }
  });

  // Move scroll
  $('#authorized_organizations').on('click', '.dropdown', function(event) {
    var offset = $(this).offset();
    offset.left -= 20;
    offset.top -= 20;
    $('#update_owners_users_members_scroll').animate({
      scrollTop: offset.top,
      scrollLeft: offset.left,
    });
  });

  // Remove authorized member
  $('#authorized_organizations').on('click', '.remove', function(event) {
    // Stop linking
    event.preventDefault();

    // item of list
    row = $(this).parent();

    // Id and name of organization
    var organization_id = row.parent().attr('id');
    var organization_name = row.find('.name').html();

    organizations_authorized = organizations_authorized.filter(function(elem) {
      return elem.organization_id != organization_id;
    });

    delete organization_role_count[organization_id];
    var info_added_organization =
      "<span id='info_added_organization' style='display: none; text-align: center;' class='help-block alert alert-success'>Organization " +
      organization_name +
      ' removed from application</span>';
    $('#authorize_organization')
      .find('#info_added_organization')
      .replaceWith(info_added_organization);
    $('#authorize_organization')
      .find('#info_added_organization')
      .fadeIn(800)
      .delay(300)
      .fadeOut(800);
    row.parent().fadeOut(500, function() {
      row.parent().remove();
    });

    if (authorized_column.children().length <= 1) {
      $('#no_update_organizations').show('open');
    }
  });

  // Assign roles to users
  $('#authorized_organizations').on('click', '.role_dropdown_role', function(
    event
  ) {
    // Stop linking
    event.stopPropagation();

    var role_id = String($(this).attr('id'));
    var role_organization = String(
      $(this)
        .closest('.app-roles-list')
        .attr('id')
    );
    var organization_id = $(this)
      .closest('.list-group-item')
      .attr('id');
    var organization_name = $(this)
      .closest('.list-group-item')
      .find('.name')
      .html();

    var roles_display = $(this)
      .closest('.list-group-item')
      .find('.roles_display');

    // Remove role from organization
    if ($(this).hasClass('active')) {
      $(this).removeClass('active');
      organization_role_count[organization_id]--;
      if (organization_role_count[organization_id] <= 0) {
        roles_display.html('No roles');
      } else {
        roles_display.html(
          String(organization_role_count[organization_id]) + ' roles'
        );
      }

      organizations_authorized = organizations_authorized.filter(function(
        elem
      ) {
        return !(
          elem.organization_id == organization_id &&
          elem.role_id == role_id &&
          elem.role_organization == role_organization
        );
      });

      // Add role to organization
    } else {
      $(this).addClass('active');
      organization_role_count[organization_id]++;
      roles_display.html(
        String(organization_role_count[organization_id] + ' roles')
      );

      organizations_authorized.push({
        organization_id: organization_id,
        role_id: role_id,
        role_organization: role_organization,
      });
    }
  });

  $('#authorized_organizations').on('click', '.dropdown', function(event) {
    var offset = $(this).offset();
    offset.left -= 20;
    offset.top -= 20;
    $('#update_organizations_scroll').animate({
      scrollTop: offset.top,
      scrollLeft: offset.left,
    });
  });

  // Handle the submit button form to submit assignment
  $('#submit_authorized_organizations_form').bind('keypress submit', function(
    event
  ) {
    // stop form from submitting by pressing enter
    if (event.which == 13) {
      event.preventDefault();
    } else if (event.type == 'submit') {
      // stop form from submitting normally
      event.preventDefault();

      for (var key in organization_role_count) {
        if (organization_role_count[key] == 0) {
          $('.alert-warning').show('open');
          authorized_column
            .find('#' + key)
            .find('.role_options')
            .addClass('dropdown-empty');
        }
      }

      if (
        authorized_column.find('.dropdown-empty').length === 0 ||
        $('#authorize_organization')
          .find('.modal-footer')
          .find('#submit_button')
          .val() == 'Confirm'
      ) {
        // get the action attribute from the <form action=""> element
        var $form = $(this),
          url = $form.attr('action');

        // Change value of hidden input
        $('#authorize_organization')
          .find('#submit_authorize')
          .val(JSON.stringify(organizations_authorized));

        // Continue with the submit request
        $('#submit_authorized_organizations_form')[0].submit();
      } else {
        $('#authorize_organization')
          .find('.modal-footer')
          .find('#submit_button')
          .val('Confirm');
      }
    }
  });

  // To remove message
  $('#container.container-fluid').on('click', '#close_message', function() {
    $('.messages').empty();
  });

  // Function to exit from dialog
  function exit_authorize_organizations() {
    organization_role_count = {};

    $('#authorize_organization')
      .find('#alert_error_search_available')
      .hide('close');
    $('#authorize_organization')
      .find('.alert-warning')
      .hide('close');
    $('#authorize_organization')
      .find('#no_update_organizations')
      .hide();
    $('#authorize_organization')
      .find('.modal-footer')
      .find('#submit_button')
      .val('Save');
    $('#authorize_organization')
      .find('#no_available_update_organizations')
      .hide('close');
    $('#authorize_organization')
      .find('#perform_filter_available_update_organizations')
      .show('open');
    $('#authorize_organization')
      .find('#available_update_organizations')
      .val('');
    $('#authorize_organization')
      .find('.available_organizations')
      .empty();
    $('#authorize_organization')
      .find('#authorized_organizations')
      .empty();
    $('#authorize_organization')
      .find('.alert-warning')
      .hide('close');
    $('#authorize_organization')
      .find('#update_authorized_organizations')
      .val('');
  }
});
