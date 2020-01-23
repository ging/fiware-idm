$(document).ready(function() {
  // Init timepicker for time lapse when creating a policy
  $('input.timepicker').timepicker({
    timeFormat: 'HH:mm',
  });

  let assign_role_permission_form = $('form#assign_role_permission_form');
  let usage_policies_list = $('ul#application_policies');
  let create_usage_policy_modal = $('div#create_usage_policy_modal');
  let create_usage_policy_form = $('form#create_usage_policy_form');

  let policies = [];

  let application_id = assign_role_permission_form.attr('action').split('/')[3];

  // Obtain policies and render them
  $.ajax({
    url: '/idm/applications/' + application_id + '/edit/usage_policies',
    type: 'GET',
    beforeSend: before_send(
      assign_role_permission_form.find('input:hidden[name=_csrf]').val()
    ),
    success: function(result) {
      if (result.type === 'danger') {
        // Add message
        create_message(result.type, result.text);
      } else {
        policies = result.usage_policies;
        application.role_policy_assign = result.role_usage_policy_assign;

        if (policies.length > 0) {
          for (let i = 0; i < policies.length; i++) {
            render_policy(policies[i]);
          }
        }
      }
    },
  });

  // Render policies
  function render_policy(policy) {
    var policy_row = $('#table_row_usage_policy_template').html();
    policy_row = policy_row.replace(/policy_name/g, htmlEntities(policy.name));
    policy_row = policy_row.replace(/policy_id/g, policy.id);
    policy_row = policy_row.replace(/app_id/g, application_id);
    usage_policies_list.append(policy_row);
  }

  // Show policies of a role
  $('#update_owners_roles').on('click', '.btn', function() {
    $('div#update_owners_policies').show();
    if (policies.length > 0) {
      $('div#update_owners_policies_alert').hide();
    }

    var role = $(this).attr('id');
    var policy = null;
    for (var i = 0; i < policies.length; i++) {
      policy = policies[i].id;
      $('[data-policy-id=' + policy + ']').show();
      if (typeof application.role_policy_assign[role] === 'undefined') {
        $('[data-policy-id=' + policy + ']').removeClass('active');
      } else {
        if (application.role_policy_assign[role].includes(policy)) {
          $('[data-policy-id=' + policy + ']').addClass('active');
        } else {
          $('[data-policy-id=' + policy + ']').removeClass('active');
        }
      }
    }
    console.log(application.role_policy_assign);
  });

  // Select policy item from list
  $('#update_owners_policies').on('click', '.list-group-item', function(e) {
    var role = $('#update_owners_roles')
      .find('div.active')
      .attr('id');

    var policy = $(this).attr('data-policy-id');
    if (typeof application.role_policy_assign[role] === 'undefined') {
      application.role_policy_assign[role] = [];
    }

    if ($('[data-policy-id=' + policy + ']').hasClass('active')) {
      index = application.role_policy_assign[role].indexOf(policy);
      if (index > -1) {
        application.role_policy_assign[role].splice(index, 1);
      }
    } else {
      application.role_policy_assign[role].push(policy);
    }
    $('[data-policy-id=' + policy + ']').toggleClass('active');
  });

  ///// CREATE POLICY

  $('select#type').change(function() {
    let type = $(this)
      .find('option:selected')
      .val();

    create_usage_policy_form.find('span.alert').hide('close');

    if (type === 'COUNT_POLICY' || type === 'AGGREGATION_POLICY') {
      $('#parameters').show();
      $('#punishment').show();
      $('#time_lapse').show();
      $('#custom').hide();
      if (type === 'COUNT_POLICY') {
        $('#max_number').show();
        $('#event_window').show();
        $('#aggregate_time').hide();
      }
      if (type === 'AGGREGATION_POLICY') {
        $('#max_number').hide();
        $('#event_window').hide();
        $('#aggregate_time').show();
      }
    }

    if (type === 'CUSTOM_POLICY') {
      $('#parameters').hide();
      $('#punishment').hide();
      $('#time_lapse').hide();
      $('#max_number').hide();
      $('#event_window').hide();
      $('#aggregate_time').hide();
      $('#custom').show();
    }

    $('.parameter').each(function(i, obj) {
      $(this)
        .find('input.form-control')
        .val('');
      $(this)
        .find('textarea.form-control')
        .val('');
      $(this)
        .find('select.selectpicker')
        .selectpicker('val', 'SECONDS');
      $(this)
        .find('input.timepicker')
        .timepicker({
          timeFormat: 'HH:mm',
        });
    });
  });

  create_usage_policy_form.submit(function(event) {
    // stop form from submitting normally
    event.preventDefault();

    // get the action attribute from the <form action=""> element
    let $form = $(this),
      url = $form.attr('action');

    let policy = $form.serializeJSON();

    const filterObject = (obj, filter, filterValue) =>
      Object.keys(obj).reduce(
        (acc, val) =>
          obj[val][filter] === filterValue
            ? acc
            : {
                ...acc,
                [val]: obj[val],
              },
        {}
      );

    policy.parameters = filterObject(policy.parameters, 'value', '');

    create_usage_policy_form.find('span.alert').hide('close');

    // Send the data using post with element id name
    var posting = $.post({
      url: url,
      data: policy,
      beforeSend: before_send($form.find('input:hidden[name=_csrf]').val()),
    });

    // Alerts the results
    posting.done(function(policy) {
      policies.push(policy);
      $('div#update_owners_policies_alert').hide();
      render_policy(policy);
      create_usage_policy_modal.modal('toggle');
      $('.form-group').each(function(i, obj) {
        $(this)
          .find('input.form-control')
          .val('');
        $(this)
          .find('textarea.form-control')
          .val('');
        $(this)
          .find('select#type')
          .selectpicker('val', '');
        $(this)
          .find('select#punishment')
          .selectpicker('val', '');
        $(this)
          .find('.time')
          .find('select.selectpicker')
          .selectpicker('val', 'SECONDS');
        $(this)
          .find('input.timepicker')
          .timepicker({
            timeFormat: 'HH:mm',
          });
      });
    });

    posting.fail(response => {
      let errors = response.responseJSON;
      for (let i = 0; i < errors.length; i++) {
        create_usage_policy_form.find('#' + errors[i]).show('open');
      }
    });
  });

  /////////////////

  function htmlEntities(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
});
