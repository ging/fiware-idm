export default class ui_manager {
  constructor() {

      this.users_pagination = $('#users_pagination_container');
      this.user_row = $('#table_row_user_row_template');
      this.selectpicker = $('.selectpicker')

      var user_table = $('table#user_table > tbody')
      var check_all = $('input#check_all')

      this.render_user_pagination = this.render_user_pagination.bind(this);

      this.count_answer_letters = this.count_answer_letters.bind(this);
      this.render_lang = this.render_lang.bind(this);
  }
  init_ui() {
      console.log("uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu")
      users_pagination(users.length, users_per_page)
      create_user_rows(users.slice(0,users_per_page))
  }
  render_users_pagination(max, rows) {

        this.users_pagination.bootpag({
            total: Math.ceil(max/rows),
            page: 1,
            maxVisible: 5,
            leaps: true,
            firstLastUse: true,
            first: 'First',
            last: 'Last',
            wrapClass: 'pagination',
            activeClass: 'active',
            disabledClass: 'disabled',
            nextClass: 'next',
            prevClass: 'prev',
            lastClass: 'last',
            firstClass: 'first'
        }).on("page", function(event, num) {            

            var start = (num === 1) ? 0 : rows*(num - 1)
            var end = start + rows

            check_all.prop('checked', false);

            if (users_filter.length <= 0) {
                render_user_rows(users.slice(start, end))
            } else {
                render_user_rows(users_filter.slice(start, end))
            }
        });
    }
    render_user_rows(rows) {
        
        var selected = 0

        user_table.html("");

        for (var i = 0; i < rows.length; i++) {
            var user_row = user_row.html();
            user_row = user_row.replace(/user_username/g, htmlEntities(rows[i].username));
            user_row = user_row.replace(/user_id/g, String(rows[i].id));
            user_row = user_row.replace(/user_email/g, String(rows[i].email));
            user_row = user_row.replace(/user_avatar/g, String(rows[i].image));
            user_table.append(user_row);
            if (rows[i].enabled) {
                $('#'+rows[i].id).find('.enable').find("input[type='checkbox']").prop('checked', true)
            }
            if (users_selected.indexOf(rows[i].id) > -1) {
                $('tr#'+rows[i].id).find("input.form-check-input").prop('checked', true);
                selected = selected + 1
            }
            selectpicker.selectpicker('render');
        }

        if (i === selected) {
            check_all.prop('checked', true);
        }
    }
}