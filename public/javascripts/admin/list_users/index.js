// Import event and ui manager
//import event_manager from './event_manager';
import ui_manager from './ui_manager';

var users = []
var users_filter = []
var users_selected = []

var users_per_page = 15

$(document).ready(function() {
	console.log("holiiiiiiiiiiiiiiiii")
	load_users()

	const event_manager = new event_manager();
	const ui_manager = new ui_manager();

	ui_manager.init_ui()
});


function load_users() {
        
    $.get('/idm/admins/list_users/users', function(data, status) {
        users = data.users
        console.log("uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu")
    })  
}