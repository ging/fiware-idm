import ui_manager from './ui_manager';

export default class EventManager{
	constructor() {
		this.users = []
	    this.users_filter = []
	    this.users_selected = []

	    this.users_per_page = 15

	    this.user_table = $('table#user_table > tbody')
	    this.check_all = $('input#check_all')

	    // Create user modal
	    this.modal_create_user =  $("div#create_user_modal")
	    this.form_create_user =  $('form#create_user_form', modal_create_user)

	    // Delete user modal
	    this.modal_delete_user =  $("div#delete_user_modal")
	    this.form_delete_user =  $('form#delete_user_form', modal_delete_user)

	    // Edit user info modal
	    this.modal_edit_user = $('div#edit_user_modal')
	    this.form_edit_user =  $('form#edit_user_form', modal_edit_user)
	    this.edit_input_username = $('input#id_username', form_edit_user)
	    this.edit_input_email = $('input#id_email', form_edit_user)
	    this.edit_input_description = $('textarea#id_description', form_edit_user)
	    this.edit_input_website = $('input#id_website', form_edit_user)

	    // Change password modal
	    this.modal_chg_pw = $('div#change_password_modal')
	    this.form_chg_pw = $('form#change_password_form', modal_chg_pw)
	    this.chg_pw_input_pw1 = $('input#id_password1', form_chg_pw)
	    this.chg_pw_input_pw2 = $('input#id_password2', form_chg_pw)
	}
	add_ui_manager(ui_manager){
		this.ui_manager = ui_manager;
	}
	init_ui(){
		this.select_all_users = this.select_all_users.bind(this);
		this.select_users = this.select_users.bind(this);
		this.select_action = this.select_action.bind(this);
		this.submit_delete = this.submit_delete.bind(this);
		this.ch_pw = this.ch_pw.bind(this);
		this.submit_ch_pw = this.submit_ch_pw.bind(this);
		this.edit_user = this.edit_user.bind(this);
		this.submit_edit = this.submit_edit.bind(this);
	}
}