class UiManager {
  constructor() {
    this.typingTimerMessage;
    this.doneTypingIntervalMessage = 2000;
    this.upper_message = $('div#upper_message');

    this.users_pagination = $('#users_pagination_container');
    this.user_row = $('#table_row_user_row_template');

    this.user_table = $('table#user_table > tbody');
    this.check_all_input = $('input#check_all');

    this.message_no_users_found = $('div#no_users_found');

    this.htmlEntities = this.htmlEntities.bind(this);
    this.render_users_pagination = this.render_users_pagination.bind(this);
    this.render_user_rows = this.render_user_rows.bind(this);
    this.render_message = this.render_message.bind(this);
  }

  htmlEntities(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  render_users_pagination(max, rows) {
    this.users_pagination
      .bootpag({
        total: Math.ceil(max / rows),
        page: 1,
        maxVisible: 5,
        leaps: true,
        firstLastUse: true,
        first: navigation.first,
        last: navigation.last,
        wrapClass: 'pagination',
        activeClass: 'active',
        disabledClass: 'disabled',
        nextClass: 'next',
        prevClass: 'prev',
        lastClass: 'last',
        firstClass: 'first',
      })
      .on('page', (event, num) => {
        var start = num === 1 ? 0 : rows * (num - 1);
        var end = start + rows;

        this.check_all_input.prop('checked', false);

        if (users_filter.length <= 0) {
          this.render_user_rows(users.slice(start, end));
        } else {
          this.render_user_rows(users_filter.slice(start, end));
        }
      });
  }

  render_user_rows(rows) {
    var selected = 0;

    this.user_table.html('');

    if (rows.length <= 0) {
      this.message_no_users_found.show();
    } else {
      this.message_no_users_found.hide();

      for (var i = 0; i < rows.length; i++) {
        var row = this.user_row.html();
        row = row.replace(
          /user_username/g,
          this.htmlEntities(rows[i].username)
        );
        row = row.replace(/user_id/g, String(rows[i].id));
        row = row.replace(/user_email/g, String(rows[i].email));
        row = row.replace(/user_avatar/g, String(rows[i].image));
        this.user_table.append(row);
        if (rows[i].enabled) {
          $('#' + rows[i].id)
            .find('.enable')
            .find("input[type='checkbox']")
            .prop('checked', true);
        }
        if (users_selected.indexOf(rows[i].id) > -1) {
          $('tr#' + rows[i].id)
            .find('input.form-check-input')
            .prop('checked', true);
          selected = selected + 1;
        }

        $('.selectpicker').selectpicker('render');
      }

      if (i !== 0 && i === selected) {
        this.check_all_input.prop('checked', true);
      }
    }
  }

  render_message(message_info) {
    var class_message = 'alert-' + message_info.type;
    this.upper_message.addClass(class_message);
    this.upper_message.find('p').html(message_info.message);

    this.upper_message.fadeIn(1000);

    clearTimeout(this.typingTimerMessage);
    this.typingTimerMessage = setTimeout(() => {
      this.upper_message.fadeOut(1000).done(function() {
        this.upper_message.removeClass(class_message);
      });
    }, this.doneTypingIntervalMessage);
  }
}
