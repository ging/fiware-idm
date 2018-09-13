class UiManager {
  constructor() {

      this.users_pagination = $('#users_pagination_container');
      this.user_row = $('#table_row_user_row_template');

      this.user_table = $('table#user_table > tbody')
      this.check_all_input = $('input#check_all')

      this.htmlEntities = this.htmlEntities.bind(this);
      this.render_users_pagination = this.render_users_pagination.bind(this);
      this.render_user_rows = this.render_user_rows.bind(this);
  }



  htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
        }).on("page", (event, num) => {            

            var start = (num === 1) ? 0 : rows*(num - 1)
            var end = start + rows

            this.check_all_input.prop('checked', false);

            if (users_filter.length <= 0) {
                this.render_user_rows(users.slice(start, end))
            } else {
                this.render_user_rows(users_filter.slice(start, end))
            }
        });
    }

    render_user_rows(rows) {

        var selected = 0

        this.user_table.html("");

        for (var i = 0; i < rows.length; i++) {

            var row = this.user_row.html();
            row = row.replace(/user_username/g, this.htmlEntities(rows[i].username));
            row = row.replace(/user_id/g, String(rows[i].id));
            row = row.replace(/user_email/g, String(rows[i].email));
            row = row.replace(/user_avatar/g, String(rows[i].image));
            this.user_table.append(row);
            if (rows[i].enabled) {
                $('#'+rows[i].id).find('.enable').find("input[type='checkbox']").prop('checked', true)
            }
            if (users_selected.indexOf(rows[i].id) > -1) {
                $('tr#'+rows[i].id).find("input.form-check-input").prop('checked', true);
                selected = selected + 1
            }

            $('.selectpicker').selectpicker('render');
        }

        if (i === selected) {
            this.check_all_input.prop('checked', true);
        }
    }
}