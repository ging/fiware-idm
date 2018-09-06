class EventManager {

	constructor() {
		this.ui = {}

		this.entries = $('select#select_entries.selectpicker')


		this.change_table_entries = this.change_table_entries.bind(this);
		/*this.users = []
	    this.users_filter = []
	    this.users_selected = []

	    this.users_per_page = 15

	    this.typingTimer
    	this.doneTypingInterval = 500;

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

		// Filter users
		this.filter_users = this.filter_users.bind(this);

		// User actions
		this.submit_delete = this.submit_delete.bind(this);
		this.submit_ch_pw = this.submit_ch_pw.bind(this);
		this.submit_edit = this.submit_edit.bind(this);
		this.submit_create = this.submit_create.bind(this);
		this.enable_user = this.enable_user.bind(this);

		this.select_all_users = this.select_all_users.bind(this);
		this.select_users = this.select_users.bind(this);
		this.select_action = this.select_action.bind(this);
		this.ch_pw = this.ch_pw.bind(this);
		this.edit_user = this.edit_user.bind(this);


		this.search_user_by_id = this.search_user_by_id.bind(this);
		this.htmlEntities = this.htmlEntities.bind(this);*/

	}

	add_ui_manager(uimanager) {
	    this.ui = uimanager;
	}

	init_ui() {
		this.entries.on('change', this.change_table_entries)
	}

	change_table_entries(users_per_page) {

		users_per_page = parseInt(this.entries.val());
        this.ui.render_users_pagination(users.slice(0,users_per_page))
        this.ui.render_user_rows(users.length, users_per_page)
	}

}