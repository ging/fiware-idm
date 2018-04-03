var _tourTemplate = "<div class='popover tour'>\
	<div class='arrow'></div>\
	<h5 class='tour-title'>Tour title</h5>\
	<h3 class='popover-title tour-subtitle'></h3>\
	<div class='popover-content tour-content'></div>\
	<div class='popover-navigation tour-navigation'><div class='btn-group'>\
	<button class='btn btn-default' data-role='prev'>« Prev</button>\
	<button class='btn btn-primary' data-role='next'>Next »</button>\
	</div>\
	<div class='btn-group'><button class='btn btn-default' data-role='end'>Exit</button></div>\
	</div>";

var _noNextTemplate = "<div class='popover tour'>\
	<div class='arrow'></div>\
	<h5 class='tour-title'>Tour title</h5>\
	<h3 class='popover-title tour-subtitle'></h3>\
	<div class='popover-content tour-content'></div>\
	<div class='popover-navigation tour-navigation'><div class='btn-group'>\
	<button class='btn btn-default' data-role='prev'>« Prev</button>\
	</div>\
	<div class='btn-group'><button class='btn btn-default' data-role='end'>Exit</button></div>\
	</div>";

var _noPrevTemplate = "<div class='popover tour'>\
	<div class='arrow'></div>\
	<h5 class='tour-title'>Tour title</h5>\
	<h3 class='popover-title tour-subtitle'></h3>\
	<div class='popover-content tour-content'></div>\
	<div class='popover-navigation tour-navigation'><div class='btn-group'>\
	<button class='btn btn-primary' data-role='next'>Next »</button>\
	</div>\
	<div class='btn-group'><button class='btn btn-default' data-role='end'>Exit</button></div>\
	</div>";

var _toursDefaultOptions = {
	debug: false,
	backdrop: true,
	backdropPadding: 5,
	keyboard: false,
	onRedirectError: function (tour) {
		tour.end();
		document.location.href = "/idm/";
		window.console.log("Bootstrap Tour '" + tour._options.name + "' | " + 'Redirection error');
	}
};

var _toursOptions = {

	initTourOptions: {
		name: "getStartedTour",
		template: _tourTemplate.replace('Tour title', 'Basics Tour'),
		steps: [
		{
			path: "/idm/",
			title: "Let's get started!",
			content: "Welcome to the FIWARE's KeyRock Identity Manager. This is a basic tour that will guide you through the basics.",
			orphan: true
		},
		{
			path: "/idm/",
			element: "header",
			title: "FIWARE Portal",
			content: "The FIWARE's IdM is part of FIWARE Lab. You can check some other FIWARE Lab components in the header bar.",
			placement: "bottom"
		},
		{
			path: "/idm/",
			element: "#profile_editor_switcher",
			title: "Your Profile",
			content: "Use this section to access your profile, the settings and to log out.",
			placement: "bottom",
			onShown: function() {
				$('.tour-step-backdrop').closest(".nav").addClass("tour-step-backdrop-parent").css("z-index", "1101");
				$('.tour-step-backdrop').closest(".navbar").addClass("tour-step-backdrop-parent").css("z-index", "1101");
				$('#user_info').addClass('tour-profile-step');
			},
			onHidden: function() {
				$('.tour-step-backdrop-parent').removeClass("tour-step-backdrop-parent").css("z-index", "");
				$('#user_info').removeClass('tour-profile-step');
			}
		},
		{
			path: "/idm/",
			element: "nav.sidebar",
			title: "Navigation",
			content: "You can find the different sections of KeyRock in this sidebar.",
			placement: "right"
		},
		{
			path: "/idm/",
			element: "#applications",
			title: "Applications",
			content: "Applications are the experiments with the FIWARE technology you participate on (e.g. as an owner or purchaser). This table shows a quick summary of them.",
			placement: "right"
		},
		{
			path: "/idm/",
			element: "#organizations",
			title: "Organizations",
			content: "Organizations are basically groups of users. They come in very handy when you want to authorize several users in your application at once. A quick summary of them can be found in this table.",
			placement: "left"
		},
		{
			path: "/idm/",
			title: "You're all set!",
			content: "<p>You finished the basics Tour! You can now head on to the next Tour and learn more about the most important settings of your profile or exit this tutorial and start experimenting yourself.</p><p>Thank you for using FIWARE Lab!</p><a href='#' class='next-tour' data-current-tour='initTour' data-next-tour='profileTour'> > Go to Profile Tour</a>",
			orphan: true
		},
		]
	},

	profileTourOptions: {
		name: "profileTour",
		template: _tourTemplate.replace('Tour title', 'Profile Tour'),
		steps: [
		{
			path: "/idm/",
			title: "Let's get started!",
			content: "Welcome to the Profile Tour! You will now learn how the most important settings of your profile.",
			orphan: true,
		},
		{
			path: "/idm/",
			element: "#profile_editor_switcher",
			title: "Your Profile",
			content: "Access your profile page from this menu.",
			placement: "bottom",
			onShown: function() {
				$('.tour-step-backdrop').closest(".nav").addClass("tour-step-backdrop-parent").css("z-index", "1101");
				$('.tour-step-backdrop').closest(".navbar").addClass("tour-step-backdrop-parent").css("z-index", "1101");
				$('#user_info').addClass('tour-profile-step');
			},
			onHidden: function() {
				$('.tour-step-backdrop-parent').removeClass("tour-step-backdrop-parent").css("z-index", "");
				$('#user_info').removeClass('tour-profile-step');
			}
		},
		{
			path: RegExp("\/idm\/users\/[^\/]+\/$", "i"),
			element:  "#content_body",
			title: "Your profile",
			content: "This is your profile page. It contains some useful information, such as your avatar and some personal data about yourself.",
			placement: "left",
			redirect: function () {
				document.location.href = $("#profile_editor_switcher .dropdown-menu li:first-child a").attr('href');
			},
		},
		{
			path: RegExp("\/idm\/users\/[^\/]+\/$", "i"),
			element:  "#detailUser>.panel.panel-default:nth-child(3)",
			title: "Your organizations",
			content: "This table shows the organizations you belong to.",
			placement: "left"
		},
		{
			path: RegExp("\/idm\/users\/[^\/]+\/$", "i"),
			title: "Your apps",
			content: "This table shows the applications you are authorized on (i.e. you were assigned at least one role on them).",
			element:  "#detailUser>.panel.panel-default:nth-child(4)",
			placement: "left"
		},
		{
			path: RegExp("\/idm\/users\/[^\/]+\/$", "i"),
			title: "Your profile",
			content: "Let's include some personal information! Click this button to edit your profile.",
			element:  "#detailUser>header a",
			placement: "bottom",
			reflex: true,
			template: _noNextTemplate.replace('Tour title', 'Profile Tour')
		},
		{
			path: RegExp("\/idm\/users\/[^\/]+\/edit\/", "i"),
			title: "Editing your profile",
			content: "Provide some useful information about yourself. This will appear in your profile page.",
			element:  "#content_body>.panel.panel-default:first-child",
			placement: "left",
			template: _noPrevTemplate.replace('Tour title', 'Profile Tour'),
			onShown: function (tour) {
				$("#id_description").inputTextWithDelay("This is something about myself.");
				setTimeout(function() {
					$("#id_website").inputTextWithDelay("http://my.website.com");
				}, 750);
			}
		},
		{
			path: RegExp("\/idm\/users\/[^\/]+\/edit\/", "i"),
			title: "Editing your profile",
			content: "Choose your avatar now. You can choose from a previously uploaded image, upload a new one or even use your Gravatar!",
			element:  "#content_body>.panel.panel-default:last-child",
			placement: "left"
		},
		{
			path: "/idm/",
			title: "You're all set!",
			content: "<p>You finished the Profile Tour! You can now head on to the next Tour and learn more about aplications and how to register one or exit this tutorial and start experimenting yourself.</p><p>Thank you for using FIWARE Lab!</p><a href='#' class='next-tour' data-current-tour='profileTour' data-next-tour='appsTour'> > Go to Applications Tour</a>",
			orphan: true,
			template: _noPrevTemplate.replace('Tour title', 'Profile Tour')
		}
		]
	},

	appsTourOptions: {
		name: "applicationsTour",
		template: _tourTemplate.replace('Tour title', 'Applications Tour'),
		steps: [
		{
			path: "/idm/",
			title: "Let's get started!",
			content: "Welcome to the Applications Tour! You will now learn how to register an application in KeyRock.",
			orphan: true,
		},
		{
			path: "/idm/",
			element: "#applications",
			title: "Registering a new application",
			content: "The quickest way to register a new application is the 'Register' button. Click on it to register your first application!",
			placement: "right",
			reflex: true,
			reflexElement: "#applications .btn-group"
		},
		{
			path: "/idm/myApplications/create/",
			element: "#create_application_modal",
			title: "STEP 1: Registering a new application",
			content: "<p>This form contains the basic information required to create a new application.</p>First of all, provide a name and a longer description for your it.",
			placement: "left",
			onShown: function (tour) {
				$("#id_name").inputTextWithDelay("First App");
				setTimeout(function() {
					$("#id_description").inputTextWithDelay("Created during the Applications Tour.");
				}, 750);
			}
		},
		{
			path: "/idm/myApplications/create/",
			element: "#create_application_modal fieldset .form-group:eq(2)",
			title: "STEP 1: Registering a new application",
			content: "This is the URL of your app. This field is required to check that requests to KeyRock regarding your app (e.g. when using OAuth to authorize users) come actually from your app.",
			placement: "left",
			onShown: function (tour) {
				$("#id_url").inputTextWithDelay("sample.app.com");
			}
		},
		{
			path: "/idm/myApplications/create/",
			element: "#create_application_modal fieldset .form-group:eq(3)",
			title: "STEP 1: Registering a new application",
			content: "This is the callback URL of your application. KeyRock will redirect the User Agent back to it after an OAuth authorization flow.",
			placement: "left",
			onShown: function (tour) {
				$("#id_callbackurl").inputTextWithDelay("sample.app.com/login");
			}
		},
		{
			path: "/idm/myApplications/create/",
			element: ".btn.btn-primary",
			title: "STEP 1: Registering a new application",
			content: "Click on this button to continue to the next step.",
			placement: "left",
			reflex: true,
			template: _noNextTemplate.replace('Tour title', 'Applications Tour')
		},
		{
			path: RegExp("\/idm\/myApplications\/[^\/]+\/step\/avatar\/", "i"),
			element: "#upload_image_modal",
			title: "STEP 2: Registering a new application",
			content: "In this step you can choose an image for your app. We will leave the default one.",
			placement: "left",
			template: _noPrevTemplate.replace('Tour title', 'Applications Tour')
		},
		{
			path: RegExp("\/idm\/myApplications\/[^\/]+\/step\/avatar\/", "i"),
			element: ".btn.btn-primary",
			title: "STEP 2: Registering a new application",
			content: "Click on this button to continue to the next step.",
			placement: "left",
			reflex: true,
			template: _noNextTemplate.replace('Tour title', 'Applications Tour')
		},
		{
			path: RegExp("\/idm\/myApplications\/[^\/]+\/step\/roles\/", "i"),
			element: "#create_application_roles",
			title: "STEP 3: Registering a new application",
			content: "In this last step, you can manage the roles and permissions of your app. We won't change anything now, but you can learn more about them in the next Tour.",
			placement: "left",
			template: _noPrevTemplate.replace('Tour title', 'Applications Tour')
		},
		{
			path: RegExp("\/idm\/myApplications\/[^\/]+\/step\/roles\/", "i"),
			element:  ".btn.btn-primary",
			title: "STEP 3: Registering a new application",
			content: "Click on this button when you're done editing your new app.",
			placement: "left",
			reflex: true,
			template: _noNextTemplate.replace('Tour title', 'Applications Tour')
		},
		{
			path: RegExp("\/idm\/myApplications\/[^\/]+\/$", "i"),
			element:  "#content_body",
			title: "Check out your new application",
			content: "This is the detail page of your new app, with some useful information about it.",
			placement: "left",
			template: _noPrevTemplate.replace('Tour title', 'Applications Tour')
		},
		{
			path: "/idm/",
			title: "You're all set!",
			content: "<p>You finished the Applications Tour! You can now head on to the next Tour and learn more about roles and permissions inside apps and how to manage them or exit this tutorial and start experimenting yourself.</p><p>Thank you for using FIWARE Lab!</p><a href='#' class='next-tour' data-current-tour='appsTour' data-next-tour='rolesTour'> > Go to Roles & Permissions Tour</a>",
			orphan: true
		}
		]
	},

	rolesTourOptions: {
		name: "rolesAndPermissionsTour",
		template: _tourTemplate.replace('Tour title', 'Roles & Permissions Tour'),
		steps: [
		{
			path: "/idm/",
			title: "Let's get started!",
			content: "Welcome to the Roles & Permissions Tour! You will now learn how roles and permissions inside applications work.",
			orphan: true,
		},
		{
			path: "/idm/",
			title: "Pick an application",
			element: "#applications",
			content: "<p>To continue with the tour, click on any of your apps. If you don't have any, you should first create one or take the Applications tour.</p><a href='#' class='next-tour' data-current-tour='rolesTour' data-next-tour='appsTour'> > Go to Applications Tour</a>",
			placement: 'right',
			template: _noNextTemplate.replace('Tour title', 'Roles & Permissions Tour'),
			reflex: true,
			reflexElement: "#applications .list-group-item a.item"
		},
		{
			path: RegExp("\/idm\/myApplications\/[^\/]+\/", "i"),
			element:  "#content_body",
			title: "Application Detail Page",
			content: "Remember this is the detail page of your app. It contains some important stuff, such as the OAuth credentials, register a PEP Proxy or some IoT Sensors and manage the roles inside it.",
			placement: "left",
		},
		{
			path: RegExp("\/idm\/myApplications\/[^\/]+\/", "i"),
			element:  "#detailApplication h4 a.small:last-child",
			title: "Application Detail Page",
			content: "This link will take you to the Roles Management page or this application. Click on it to continue.",
			placement: "bottom",
			reflex: true,
			template: _noNextTemplate.replace('Tour title', 'Roles & Permissions Tour')
		},
		{
			path: RegExp("\/idm\/myApplications\/[^\/]+\/edit\/roles\/", "i"),
			element:  "#create_application_roles",
			title: "Managing Roles & Permissions",
			content: "This view lets you manage the roles and permissions of your application.",
			placement: "left",
			template: _noPrevTemplate.replace('Tour title', 'Roles & Permissions Tour')
		},
		{
			path: RegExp("\/idm\/myApplications\/[^\/]+\/edit\/roles\/", "i"),
			element:  "#role_list",
			title: "Roles",
			content: "<p>This is the list of roles which exist inside your application (provider and purchaser are default ones).</p><p>A role is basically a set of one or more permissions. When authorizing a user in your application, one or more roles must be assigned to them.",
			placement: "bottom",
		},
		{
			path: RegExp("\/idm\/myApplications\/[^\/]+\/edit\/roles\/", "i"),
			element:  "#role_list",
			title: "Roles",
			content: "Click on a role and the permissions attached to it will be shown on the right.",
			placement: "bottom",
			template: _noNextTemplate.replace('Tour title', 'Roles & Permissions Tour'),
			reflexElement: "div.btn.btn-default.role",
			reflex: true
		},
		{
			path: RegExp("\/idm\/myApplications\/[^\/]+\/edit\/roles\/", "i"),
			element:  "#permissions_list",
			title: "Permissions",
			content: "<p>This is the list of permissions which are available in your application. The checked ones are the ones attached to the role you chose.",
			placement: "bottom"
		},
		{
			path: RegExp("\/idm\/myApplications\/[^\/]+\/edit\/roles\/", "i"),
			element:  "#permissions_list i.fa.fa-plus",
			title: "New permission",
			content: "Use this button to create a new permission for your app.",
			placement: "bottom"
		},
		{
			path: RegExp("\/idm\/myApplications\/[^\/]+\/edit\/roles\/", "i"),
			element:  "#role_list i.fa.fa-plus",
			title: "New role",
			content: "Use this button to create a new role for your app.",
			placement: "bottom"
		},
		{
			path: RegExp("\/idm\/myApplications\/[^\/]+\/edit\/roles\/", "i"),
			element:  "#create_application_roles input.btn.btn-primary",
			title: "Save changes",
			content: "Click on this button to save the changes you made.",
			placement: "bottom",
			template: _noNextTemplate.replace('Tour title', 'Roles & Permissions Tour'),
			reflex: true,
		},
		{
			path: RegExp("\/idm\/myApplications\/[^\/]+\/$", "i"),
			element:  "#auth_users",
			title: "Authorizing users",
			content: "This section shows the users who have been assigned some role in your app. Use the 'Authorize' button to assign a new role to a certain user.",
			placement: "left",
			template: _noPrevTemplate.replace('Tour title', 'Roles & Permissions Tour')
		},
		{
			path: RegExp("\/idm\/myApplications\/[^\/]+\/", "i"),
			element:  "#organizations",
			title: "Authorizing organizations",
			content: "This section shows the organizations who have been assigned some role in your app. Use the 'Authorize' button to assign a new role to a certain organization.",
			placement: "left"
		},
		{
			path: "/idm/",
			title: "You're all set!",
			content: "<p>You finished the Roles & Permissions Tour! You can now head on to the next Tour and learn more about organizations or exit this tutorial and start experimenting yourself.</p><p>Thank you for using FIWARE Lab!</p><a href='#' class='next-tour' data-current-tour='rolesTour' data-next-tour='orgsTour'> > Go to Organizations Tour</a>",
			orphan: true,
			template: _noPrevTemplate.replace('Tour title', 'Roles & Permissions Tour')
		},
		]
	},

	orgsTourOptions: {
		name: "organizationsTour",
		template: _tourTemplate.replace('Tour title', 'Organizations Tour'),
		steps: [
		{
			path: "/idm/",
			title: "Let's get started!",
			content: "Welcome to the Organizations Tour! You will now learn how to create an organization in KeyRock.",
			orphan: true
		},
		{
			path: "/idm/",
			element: "#organizations",
			title: "Creating a new organization",
			content: "The quickest way to create a new organization is the 'Create' button. Click on it to create your first organization!",
			placement: "left",
			reflex: true,
			reflexElement: "#organizations .btn-group"
		},
		{
			path: "/idm/organizations/create/",
			element: "#create_application_modal",
			title: "<p>Creating a new organization",
			content: "<p>This form contains the basic information required to create a new organization.</p>Just provide a name and a longer description for it.",
			placement: "left",
			onShown: function (tour) {
				$("#id_name").inputTextWithDelay("First Org");
				setTimeout(function() {
					$("#id_description").inputTextWithDelay("Created during the Organizations Tour.");
				}, 750);
			}
		},
		{
			path: "/idm/organizations/create/",
			element: ".btn.btn-primary",
			title: "Creating a new organization",
			content: "Click on this button when you're done to create your new organization.",
			placement: "left",
			reflex: true,
			template: _noNextTemplate.replace('Tour title', 'Organizations Tour')
		},
		{
			path: "/idm/home_orgs/",
			title: "Organization created!",
			content: "Your new organization was successfully created. This is its home page.",
			orphan: true,
			template: _noPrevTemplate.replace('Tour title', 'Organizations Tour')
		},
		{
			path: "/idm/home_orgs/",
			element: "#profile_editor_switcher",
			title: "Organization profile",
			content: "Note that you are now logged in as your new organization. You can use this section to log back in with your personal account.",
			placement: "bottom",
			onShown: function() {
				$('.tour-step-backdrop').closest(".nav").addClass("tour-step-backdrop-parent").css("z-index", "1101");
				$('.tour-step-backdrop').closest(".navbar").addClass("tour-step-backdrop-parent").css("z-index", "1101");
				$('#user_info').addClass('tour-profile-step');
			},
			onHidden: function() {
				$('.tour-step-backdrop-parent').removeClass("tour-step-backdrop-parent").css("z-index", "");
				$('#user_info').removeClass('tour-profile-step');
			}
		},
		{
			path: "/idm/home_orgs/",
			element: "nav.sidebar",
			title: "Navigation",
			content: "Some things have changed since you're logged in as an organization. For example: in the sidebar menu, the 'Organizations' item has been replaced by a new one called 'Members'.",
			placement: "right"
		},
		{
			path: "/idm/home_orgs/",
			element: "#applications",
			title: "Applications",
			content: "These are the applications your organization participates on.",
			placement: "right"
		},
		{
			path: "/idm/home_orgs/",
			element: "#members",
			title: "Members",
			content: "This table shows a quick summary of the members of your organization.",
			placement: "left"
		},
		{
			path: "/idm/",
			title: "You're all set!",
			content: "<p>You finished the Organizations Tour! You can now head on to Help&About to learn more about KeyRock or start experimenting yourself.</p><p>Thank you for using FIWARE Lab!</p><a href='#' class='next-tour' data-current-tour='orgsTour' id='end-tours'> > Go to Help&About</a>",
			orphan: true,
			redirect: function () {
				var switchAccountElements = $("#profile_editor_switcher .dropdown-menu .dropdown-menu li a");
				var userImageElement;
				switchAccountElements.find('img').each(function(index, value){
					if ($(value).attr('src').includes('UserAvatar')){
						userImageElement = value;
						return false;
					}
				});
				document.location.href = $(userImageElement).closest('a').attr('href');
			},
			template: _noPrevTemplate.replace('Tour title', 'Organizations Tour')
		},
		]
	}
}

var tours = {

	initTour: new Tour($.extend(_toursDefaultOptions, _toursOptions.initTourOptions)),
	profileTour: new Tour($.extend(_toursDefaultOptions, _toursOptions.profileTourOptions)),
	appsTour: new Tour($.extend(_toursDefaultOptions, _toursOptions.appsTourOptions)),
	rolesTour: new Tour($.extend(_toursDefaultOptions, _toursOptions.rolesTourOptions)),
	orgsTour: new Tour($.extend(_toursDefaultOptions, _toursOptions.orgsTourOptions))
};

$( document ).ready(function() {
	/* extend jQuery with a new function */
	$.fn.extend({
		inputTextWithDelay: function(text, delay=40) {
			if (this.val() !== '')
				return void 0;

			i = 0;
			$this = this;
			interval = setInterval(function() {
				$this.val($this.val() + text[i]);
				if (++i > text.length - 1)
					return clearInterval(interval);
			}, delay);
		}
	});

	/* init one tour after another */
	$("body").on("click", ".next-tour", function() {
		var nextTour = $(this).attr('data-next-tour');
		var currentTour = $(this).attr('data-current-tour');

		tours[currentTour].end();

		if (nextTour !== undefined) {
			tours[nextTour].init();
			if (tours[nextTour]._getState('current_step')!== null)
				tours[nextTour].restart();
			else
				tours[nextTour].start();
		}
	});

	/* resume tour if any */
	$.each(tours, function(i, tour) {
		if (tour._getState('current_step')!== null && !tour.ended()) {
			tour.init();
			return false;
		}
	});
});
