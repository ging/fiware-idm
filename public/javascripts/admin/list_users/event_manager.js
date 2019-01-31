class EventManager {
  constructor() {
    this.ui = {};

    this.typingTimer;
    this.doneTypingInterval = 500;

    this.id_user_selected;

    this.users_page = $('div#users-page');
    this.entries_select = $('select#select_entries.selectpicker');
    this.check_all_input = $('input#check_all');
    this.user_table = $('table#user_table > tbody');
    this.input_filter_user = $(
      'input.form-control#filter_user',
      this.users_page
    );

    // Create user modal
    this.modal_create_user = $('div#create_user_modal');
    this.form_create_user = $('form#create_user_form', this.modal_create_user);

    // Delete user modal
    this.modal_delete_user = $('div#delete_user_modal');
    this.button_delete_user = $('button#delete_user', this.users_page);
    this.list_users_to_delete = $('ul#list_users', this.modal_delete_user);
    this.form_delete_user = $('form#delete_user_form', this.modal_delete_user);

    // Edit user info modal
    this.modal_edit_user = $('div#edit_user_modal');
    this.form_edit_user = $('form#edit_user_form', this.modal_edit_user);
    this.edit_input_username = $('input#id_username', this.form_edit_user);
    this.edit_input_email = $('input#id_email', this.form_edit_user);
    this.edit_input_description = $(
      'textarea#id_description',
      this.form_edit_user
    );
    this.edit_input_website = $('input#id_website', this.form_edit_user);

    // Change password modal
    this.modal_change_password = $('div#change_password_modal');
    this.form_change_password = $(
      'form#change_password_form',
      this.modal_change_password
    );
    this.chg_pw_input_password1 = $(
      'input#id_password1',
      this.form_change_password
    );
    this.chg_pw_input_password2 = $(
      'input#id_password2',
      this.form_change_password
    );

    this.change_table_entries = this.change_table_entries.bind(this);
    this.change_check_all = this.change_check_all.bind(this);
    this.change_check_indiv = this.change_check_indiv.bind(this);
    this.select_user_action = this.select_user_action.bind(this);
    this.open_change_password = this.open_change_password.bind(this);
    this.submit_password = this.submit_password.bind(this);
    this.close_change_password = this.close_change_password.bind(this);
    this.open_edit_user = this.open_edit_user.bind(this);

    this.submit_edit_user = this.submit_edit_user.bind(this);
    this.close_edit_user = this.close_edit_user.bind(this);
    this.submit_delete_user = this.submit_delete_user.bind(this);
    this.open_delete_user = this.open_delete_user.bind(this);
    this.close_delete_user = this.close_delete_user.bind(this);
    this.submit_enable_user = this.submit_enable_user.bind(this);
    this.submit_create_user = this.submit_create_user.bind(this);
    this.close_create_user = this.close_create_user.bind(this);

    this.search_user_by_id = this.search_user_by_id.bind(this);
    this.filter_users = this.filter_users.bind(this);
  }

  add_ui_manager(uimanager) {
    this.ui = uimanager;
  }

  init_ui() {
    // Entries events
    this.entries_select.on('change', this.change_table_entries);

    // Check inputs events
    this.check_all_input.click(this.change_check_all);
    this.users_page.on(
      'click',
      'input.form-check-input:not(#check_all)',
      this.change_check_indiv
    );

    // Select user action event: change password or edit
    this.users_page.on(
      'changed.bs.select',
      '.selectpicker:not(#select_entries)',
      this.select_user_action
    );

    // Change password events
    this.form_change_password.submit(this.submit_password);
    this.modal_change_password.on(
      'hidden.bs.modal',
      this.close_change_password
    );

    // Edit users events
    this.form_edit_user.submit(this.submit_edit_user);
    this.modal_edit_user.on('hidden.bs.modal', this.close_edit_user);

    // Delete users events
    this.form_delete_user.submit(this.submit_delete_user);
    this.button_delete_user.click(this.open_delete_user);
    this.modal_delete_user.on('hidden.bs.modal', this.close_delete_user);

    // Enable users
    this.users_page.on('click', 'span.enable_user', this.submit_enable_user);

    // Create users
    this.form_create_user.submit(this.submit_create_user);
    this.modal_create_user.on('hidden.bs.modal', this.close_create_user);

    // Filter users by name
    this.input_filter_user.bind('keyup input', this.filter_users);
  }

  change_table_entries() {
    users_per_page = parseInt(this.entries_select.val());
    this.ui.render_user_rows(users.slice(0, users_per_page));
    this.ui.render_users_pagination(users.length, users_per_page);
  }

  change_check_indiv(event) {
    var user_id = $(event.target)
      .closest('tr')
      .attr('id');

    if ($(event.target).prop('checked')) {
      users_selected.push(user_id);
    } else {
      var index = users_selected.indexOf(user_id);
      if (index > -1) {
        users_selected.splice(index, 1);
      }
    }
  }

  change_check_all(event) {
    var checked = this.check_all_input.prop('checked');

    $('tr', this.user_table).each((index, row) => {
      var user_id = $(row).attr('id');
      var index = users_selected.indexOf(user_id);

      if (checked) {
        if (index < 0) {
          this.users_page.find('input.form-check-input').prop('checked', true);
          users_selected.push(user_id);
        }
      } else {
        if (index > -1) {
          this.users_page.find('input.form-check-input').prop('checked', false);
          users_selected.splice(index, 1);
        }
      }
    });
  }

  select_user_action(e, clickedIndex, newValue, oldValue) {
    var selected = $(e.target)
      .find('option')
      .eq(clickedIndex)
      .val();
    var user_id = $(e.target)
      .closest('tr')
      .attr('id');

    var user = this.search_user_by_id(user_id).user;

    if (selected === 'password') {
      this.open_change_password(user);
    } else if (selected === 'edit') {
      this.open_edit_user(user);
    }

    $('.selectpicker:not(#select_entries)').selectpicker('val', '');
  }

  open_change_password(user) {
    this.form_change_password.attr(
      'action',
      '/idm/admins/list_users/users/' + user.id + '/change_password'
    );

    this.id_user_selected = user.id;

    // Show modal
    this.modal_change_password.modal('show');
  }

  close_change_password() {
    this.form_change_password.find('input.form-control').val('');
    this.id_user_selected = '';
    $('span.alert', this.form_change_password).hide();
  }

  submit_password(event) {
    // stop form from submitting normally
    event.preventDefault();

    // Hide alerts
    $('span.alert', this.form_change_password).hide();

    // Payload to be send to the server
    var data = {
      password1: this.chg_pw_input_password1.val(),
      password2: this.chg_pw_input_password2.val(),
    };

    // Check values of inputs before send to the server
    if (data.password1 == '') {
      $('span.alert#password1').show('open');
    }
    if (data.password2 == '') {
      $('span.alert#password2').show('open');
    }
    if (data.password1 !== data.password2) {
      $('span.alert#passwordDifferent').show('open');
    }

    // If there is no alert send post request to the server
    if (!$('span.alert', this.form_change_password).is(':visible')) {
      // Get the action attribute from the <form action=""> element
      var $form = $(event.target),
        url = $form.attr('action');

      // Send put request
      var put_request = $.ajax({
        url: url,
        type: 'PUT',
        beforeSend: before_send(
          this.form_change_password.find('input:hidden[name=_csrf]').val()
        ),
        data: data,
      });

      put_request.done(response => {
        this.modal_change_password.modal('hide');
        this.ui.render_message({
          message: 'User password change',
          type: 'success',
        });
      });

      put_request.fail(response => {
        this.ui.render_message({
          message: 'Change user password fail',
          type: 'danger',
        });
        var errors = JSON.parse(response.responseText).errors;
        for (var i in errors) {
          $('span.alert#' + errors[i].message, this.form_change_password).show(
            'open'
          );
        }
      });
    }
  }

  open_edit_user(user) {
    this.form_edit_user.attr(
      'action',
      '/idm/admins/list_users/users/' + user.id + '/edit_info'
    );

    this.id_user_selected = user.id;

    this.edit_input_username.val(user.username);
    this.edit_input_email.val(user.email);
    this.edit_input_description.val(user.description);
    this.edit_input_website.val(user.website);

    // Show modal
    this.modal_edit_user.modal('show');
  }

  close_edit_user() {
    this.form_edit_user.find('input.form-control').val('');
    this.id_user_selected = '';
    $('span.alert', this.form_edit_user).hide();
  }

  submit_edit_user(event) {
    // stop form from submitting normally
    event.preventDefault();

    // Hide alerts
    $('span.alert', this.form_edit_user).hide();

    // Payload to be send to the server
    var data = {
      username: this.edit_input_username.val(),
      email: this.edit_input_email.val(),
      description: this.edit_input_description.val(),
      website: this.edit_input_website.val(),
    };

    // Check values of inputs before send to the server
    if (data.username == '') {
      $('span.alert#username', this.form_edit_user).show('open');
    }
    if (data.email == '') {
      $('span.alert#email', this.form_edit_user).show('open');
    }

    // If there is no alert send post request to the server
    if (!$('span.alert', this.form_edit_user).is(':visible')) {
      // Get the action attribute from the <form action=""> element
      var $form = $(event.target),
        url = $form.attr('action');

      // Send put request
      var put_request = $.ajax({
        url: url,
        type: 'PUT',
        beforeSend: before_send(
          this.form_edit_user.find('input:hidden[name=_csrf]').val()
        ),
        data: data,
      });

      put_request.done(response => {
        var user_index = this.search_user_by_id(this.id_user_selected).index;
        users[user_index].username = response.user.username;
        users[user_index].email = response.user.email;
        users[user_index].description = response.user.description;
        users[user_index].website = response.user.website;

        var row = this.user_table.find('tr#' + response.user.id);

        row
          .find('td')
          .eq(3)
          .html(response.user.username);
        row
          .find('td')
          .eq(4)
          .html(response.user.email);

        this.ui.render_message({ message: 'user edited', type: 'success' });

        this.modal_edit_user.modal('hide');
      });

      put_request.fail(response => {
        this.ui.render_message({ message: 'Edit user fail', type: 'danger' });
        var errors = JSON.parse(response.responseText).errors;
        for (var i in errors) {
          $('span.alert#' + errors[i].message, this.form_edit_user).show(
            'open'
          );
        }
      });
    }
  }

  submit_delete_user(event) {
    // stop form from submitting normally
    event.preventDefault();

    // Get the action attribute from the <form action=""> element
    var $form = $(event.target),
      url = $form.attr('action');

    var data = {
      delete_users: users_selected,
    };
    // Send put request
    var delete_request = $.ajax({
      url: url,
      type: 'DELETE',
      beforeSend: before_send(
        this.form_delete_user.find('input:hidden[name=_csrf]').val()
      ),
      data: data,
    });

    delete_request.done(response => {
      this.modal_delete_user.modal('hide');
      for (var i = users.length - 1; i >= 0; --i) {
        var index_selected = users_selected.indexOf(users[i].id);

        if (index_selected > -1) {
          if (users_filter.length > 0) {
            var index_filter = users_filter.map(e => e.id).indexOf(users[i].id);
            if (index_filter > -1) {
              users_filter.splice(index_filter, 1);
            }
          }

          this.user_table.find('tr#' + users[i].id).remove();
          users_selected.splice(index_selected, 1);
          users.splice(i, 1);
        }
      }

      if (users_filter.length <= 0) {
        this.input_filter_user.val('');
        this.ui.render_user_rows(users.slice(0, users_per_page));
      } else {
        this.ui.render_user_rows(users_filter.slice(0, users_per_page));
      }

      this.ui.render_users_pagination(users.length, users_per_page);
      this.ui.render_message({ message: 'Users deleted', type: 'success' });
      $('input.form-check-input').prop('checked', false);
    });

    delete_request.fail(response => {
      this.ui.render_message({ message: 'Delete users fail', type: 'danger' });
      if (users_filter.length <= 0) {
        this.ui.render_user_rows(users.slice(0, users_per_page));
      } else {
        this.ui.render_user_rows(users_filter.slice(0, users_per_page));
      }

      this.ui.render_users_pagination(users.length, users_per_page);
      $('input.form-check-input').prop('checked', false);
    });
  }

  open_delete_user(event) {
    if (users_selected.length <= 0) {
      alert('No users selected');
    } else {
      this.modal_delete_user.modal('show');
      for (var i = 0; i < users_selected.length; i++) {
        this.list_users_to_delete.append(
          '<li><a href="/idm/users/' +
            users_selected[i] +
            '">' +
            users_selected[i] +
            '</a></li>'
        );
      }
    }
  }

  close_delete_user() {
    this.list_users_to_delete.empty();
  }

  submit_enable_user(event) {
    event.preventDefault();

    var user_id = $(event.target)
      .closest('tr')
      .attr('id');
    var user_current_enablement = $(event.target)
      .siblings("input[type='checkbox']")
      .is(':checked');

    var data = {
      enabled: !user_current_enablement,
    };

    // Send put request
    var put_request = $.ajax({
      url: '/idm/admins/list_users/users/' + user_id + '/enable',
      type: 'PUT',
      beforeSend: before_send(
        this.users_page.find('input:hidden[name=_csrf]').val()
      ),
      data: data,
    });

    put_request.done(() => {
      $('#' + user_id)
        .find('td.enable')
        .find("input[type='checkbox']")
        .prop('checked', !user_current_enablement);
      this.ui.render_message({ message: 'User enabled', type: 'success' });
      this.search_user_by_id(user_id).user.enabled = !user_current_enablement;
    });

    put_request.fail(response => {
      this.ui.render_message({ message: 'Fail enalbed user', type: 'danger' });
    });
  }

  submit_create_user(event) {
    // stop form from submitting normally
    event.preventDefault();

    // Hide alerts
    $('span.alert', this.form_create_user).hide();

    // Payload to be send to the server
    var data = {
      username: $('input#id_username', this.form_create_user).val(),
      email: $('input#id_email', this.form_create_user).val(),
      password1: $('input#id_password1', this.form_create_user).val(),
      password2: $('input#id_password2', this.form_create_user).val(),
      description: $('textarea#id_description', this.form_create_user).val(),
      website: $('input#id_website', this.form_create_user).val(),
      send_email: $('input#id_send_email', this.form_create_user).is(
        ':checked'
      ),
      enabled: $('input#id_enabled', this.form_create_user).is(':checked'),
    };

    // Check values of inputs before send to the server
    if (data.username == '') {
      $('span.alert#username', this.form_create_user).show('open');
    }
    if (data.email == '') {
      $('span.alert#email', this.form_create_user).show('open');
    }
    if (data.password1 == '') {
      $('span.alert#password1', this.form_create_user).show('open');
    }
    if (data.password2 == '') {
      $('span.alert#password2', this.form_create_user).show('open');
    }
    if (data.password1 !== data.password2) {
      $('span.alert#passwordDifferent', this.form_create_user).show('open');
    }

    // If there is no alert send post request to the server
    if (!$('span.alert').is(':visible')) {
      // Get the action attribute from the <form action=""> element
      var $form = $(event.target),
        url = $form.attr('action');

      // Send the data using post with element id name
      var post_request = $.post({
        url: url,
        data: data,
        beforeSend: before_send(
          this.form_create_user.find('input:hidden[name=_csrf]').val()
        ),
      });

      post_request.done(user => {
        users.push(user);

        if (
          this.input_filter_user.val() !== '' &&
          user.username.includes(this.input_filter_user.val())
        ) {
          users_filter.push(user);
        }

        if (users_filter.length <= 0) {
          this.ui.render_user_rows(users.slice(0, users_per_page));
        } else {
          this.ui.render_user_rows(users_filter.slice(0, users_per_page));
        }
        this.ui.render_users_pagination(users.length, users_per_page);
        this.ui.render_message({ message: 'User created', type: 'success' });
        this.modal_create_user.modal('hide');
      });

      post_request.fail(response => {
        var errors = JSON.parse(response.responseText).errors;
        this.ui.render_message({ message: 'Fail create user', type: 'danger' });
        for (var i in errors) {
          $('span.alert#' + errors[i].message, this.form_create_user).show(
            'open'
          );
        }
      });
    }
  }

  close_create_user() {
    this.form_create_user.find('input.form-control').val('');
    this.form_create_user.find('input[type="checkbox"]').prop('checked', false);
    $('span.alert', this.form_create_user).hide();
  }

  search_user_by_id(id) {
    for (var i = 0; i < users.length; i++) {
      if (users[i].id === id) {
        return { user: users[i], index: i };
      }
    }
  }

  filter_users(event) {
    var filter = this.input_filter_user.val();
    users_filter = [];
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      for (var i = 0; i < users.length; i++) {
        if (users[i].username.includes(filter)) {
          users_filter.push(users[i]);
        }
      }
      this.ui.render_user_rows(users_filter.slice(0, users_per_page));
      this.ui.render_users_pagination(users_filter.length, users_per_page);
    }, this.doneTypingInterval);
  }
}
