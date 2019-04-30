$(document).ready(function() {
  // Init timepicker for time lapse when creating a policy
  $('input.timepicker').timepicker({});

  let usage_policies_form = $('form#activate_usage_policies_form');
  let usage_policies_list = $('div#application_policies');
  let create_usage_policy_form = $('form#create_usage_policy_form');

  let policies = [];

  let application_id = usage_policies_form.attr('action').split('/')[3];

  // Obtain policies and render them
  $.ajax({
    url: '/idm/applications/' + application_id + '/edit/usage_policies',
    type: 'GET',
    beforeSend: before_send(
      usage_policies_form.find('input:hidden[name=_csrf]').val()
    ),
    success: function(result) {
      if (result.type === 'danger') {
        // Add message
        create_message(result.type, result.text);
      } else {
        policies = result.policies;
        for (let i = 0; i < policies.length; i++) {
          render_policy(policies[i]);
        }
      }
    },
  });

  // Render policies
  function render_policy(policy) {
    var policy_row = $('#table_row_usage_policy_template').html();
    policy_row = policy_row.replace(
      /policy_name/g,
      htmlEntities(policy.rule.name)
    );
    policy_row = policy_row.replace(/policy_id/g, policy.rule.id);
    policy_row = policy_row.replace(/app_id/g, application_id);
    usage_policies_list.append(policy_row);
  }

  // Handle activate policies
  usage_policies_list.on('click', '.policy', function() {
    let tick = $(this)
      .children('label')
      .children('i');
    $(this).toggleClass('policy_active');
    tick.toggle();
  });

  ///// CREATE POLICY

  $('select#policy_type').change(function() {
    let type = $(this)
      .find('option:selected')
      .val();
    $('#parameters').show();
    if (type === 'COUNT_POLICY') {
      $('#max_number').show();
      $('#event_window').show();
      $('#aggregation_time').hide();
    }
    if (type === 'AGGREGATION_POLICY') {
      $('#max_number').hide();
      $('#event_window').hide();
      $('#aggregation_time').show();
    }

    $('.parameter').each(function(i, obj) {
      $(this)
        .find('input.form-control')
        .val('');
      $(this)
        .find('.selectpicker')
        .selectpicker('val', 'SECONDS');
    });
  });

  create_usage_policy_form.submit(function(event) {
    // stop form from submitting normally
    event.preventDefault();

    // get the action attribute from the <form action=""> element
    let $form = $(this),
      url = $form.attr('action');

    let policy = $form.serializeJSON();
    console.log(policy);

    // Send the data using post with element id name
    var posting = $.post({
      url: url,
      data: policy,
      beforeSend: before_send($form.find('input:hidden[name=_csrf]').val()),
    });

    // Alerts the results
    posting.done(function(result) {
      console.log(result);
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
