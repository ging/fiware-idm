// Import event and ui manager

var users = [];
var users_filter = [];
var users_selected = [];

var users_per_page = 15;

$(document).ready(function() {
  load_users().then(function() {
    let ui_manager = new UiManager();
    ui_manager.render_users_pagination(users.length, users_per_page);
    ui_manager.render_user_rows(users.slice(0, users_per_page));

    let event_manager = new EventManager();
    event_manager.add_ui_manager(ui_manager);
    event_manager.init_ui();
  });
});

function load_users() {
  return new Promise(function(resolve, reject) {
    $.get('/idm/admins/list_users/users', function(data, status) {
      users = data.users;
      resolve();
    });
  });
}
