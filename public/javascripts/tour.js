var _tourTemplate =
  "<div class='popover tour'>\
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

var _noNextTemplate =
  "<div class='popover tour'>\
  <div class='arrow'></div>\
  <h5 class='tour-title'>Tour title</h5>\
  <h3 class='popover-title tour-subtitle'></h3>\
  <div class='popover-content tour-content'></div>\
  <div class='popover-navigation tour-navigation'><div class='btn-group'>\
  <button class='btn btn-default' data-role='prev'>« Prev</button>\
  </div>\
  <div class='btn-group'><button class='btn btn-default' data-role='end'>Exit</button></div>\
  </div>";

var _noPrevTemplate =
  "<div class='popover tour'>\
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
  onRedirectError: function(tour) {
    tour.end();
    document.location.href = '/idm';
    window.console.log(
      "Bootstrap Tour '" + tour._options.name + "' | " + 'Redirection error'
    );
  },
};

var _toursOptions = {
  initTourOptions: {
    name: 'getStartedTour',
    template: _tourTemplate.replace('Tour title', 'Basics Tour'),
    steps: [
      {
        path: '/idm',
        title: tours.init_tour.title01,
        content: tours.init_tour.content01,
        orphan: true,
      },
      {
        path: '/idm',
        element: '#profile_editor_switcher',
        title: tours.init_tour.title02,
        content: tours.init_tour.content02,
        placement: 'bottom',
        onShown: function() {
          $('.tour-step-backdrop')
            .closest('.nav')
            .addClass('tour-step-backdrop-parent')
            .css('z-index', '1101');
          $('.tour-step-backdrop')
            .closest('.navbar')
            .addClass('tour-step-backdrop-parent')
            .css('z-index', '1101');
          $('#user_info').addClass('tour-profile-step');
        },
        onHidden: function() {
          $('.tour-step-backdrop-parent')
            .removeClass('tour-step-backdrop-parent')
            .css('z-index', '');
          $('#user_info').removeClass('tour-profile-step');
        },
      },
      {
        path: '/idm',
        element: 'nav.sidebar',
        title: tours.init_tour.title03,
        content: tours.init_tour.content03,
        placement: 'right',
      },
      {
        path: '/idm',
        element: '#applications',
        title: tours.init_tour.title04,
        content: tours.init_tour.content04,
        placement: 'right',
      },
      {
        path: '/idm',
        element: '#organizations',
        title: tours.init_tour.title05,
        content: tours.init_tour.content05,
        placement: 'left',
      },
      {
        path: '/idm',
        title: tours.init_tour.title06,
        content: tours.init_tour.content06,
        orphan: true,
      },
    ],
  },

  profileTourOptions: {
    name: 'profileTour',
    template: _tourTemplate.replace('Tour title', 'Profile Tour'),
    steps: [
      {
        path: '/idm',
        title: tours.profile_tour.title01,
        content: tours.profile_tour.content01,
        orphan: true,
      },
      {
        path: '/idm',
        element: '#profile_editor_switcher',
        title: tours.profile_tour.title02,
        content: tours.profile_tour.content02,
        placement: 'bottom',
        onShown: function() {
          $('.tour-step-backdrop')
            .closest('.nav')
            .addClass('tour-step-backdrop-parent')
            .css('z-index', '1101');
          $('.tour-step-backdrop')
            .closest('.navbar')
            .addClass('tour-step-backdrop-parent')
            .css('z-index', '1101');
          $('#user_info').addClass('tour-profile-step');
        },
        onHidden: function() {
          $('.tour-step-backdrop-parent')
            .removeClass('tour-step-backdrop-parent')
            .css('z-index', '');
          $('#user_info').removeClass('tour-profile-step');
        },
      },
      {
        path: RegExp('/idm/users/[^/]', 'i'),
        element: '#content_body',
        title: tours.profile_tour.title03,
        content: tours.profile_tour.content03,
        placement: 'left',
        redirect: function() {
          document.location.href = $(
            '#profile_editor_switcher .dropdown-menu li:first-child a'
          ).attr('href');
        },
      },
      {
        path: RegExp('/idm/users/[^/]', 'i'),
        element: '#detailUser>.panel.panel-default:nth-child(3)',
        title: tours.profile_tour.title04,
        content: tours.profile_tour.content04,
        placement: 'left',
      },
      {
        path: RegExp('/idm/users/[^/]', 'i'),
        title: tours.profile_tour.title05,
        content: tours.profile_tour.content05,
        element: '#detailUser>.panel.panel-default:nth-child(4)',
        placement: 'left',
      },
      {
        path: RegExp('/idm/users/[^/]', 'i'),
        title: tours.profile_tour.title06,
        content: tours.profile_tour.content06,
        element: '#detailUser>header a',
        placement: 'bottom',
        reflex: true,
        template: _noNextTemplate.replace('Tour title', 'Profile Tour'),
      },
      {
        path: RegExp('/idm/users/[^/]+/edit', 'i'),
        title: tours.profile_tour.title07,
        content: tours.profile_tour.content07,
        element: '#content_body>.panel.panel-default:first-child',
        placement: 'left',
        template: _noPrevTemplate.replace('Tour title', 'Profile Tour'),
        onShown: function(tour) {
          $('#id_description').inputTextWithDelay(
            'This is something about myself.'
          );
          setTimeout(function() {
            $('#id_website').inputTextWithDelay('http://my.website.com');
          }, 750);
        },
      },
      {
        path: RegExp('/idm/users/[^/]+/edit', 'i'),
        title: tours.profile_tour.title08,
        content: tours.profile_tour.content08,
        element: '#content_body>.panel.panel-default:last-child',
        placement: 'left',
      },
      {
        path: '/idm',
        title: tours.profile_tour.title09,
        content: tours.profile_tour.content09,
        orphan: true,
        template: _noPrevTemplate.replace('Tour title', 'Profile Tour'),
      },
    ],
  },

  appsTourOptions: {
    name: 'applicationsTour',
    template: _tourTemplate.replace('Tour title', 'Applications Tour'),
    steps: [
      {
        path: '/idm',
        title: tours.apps_tour.title01,
        content: tours.apps_tour.content01,
        orphan: true,
      },
      {
        path: '/idm',
        element: '#applications',
        title: tours.apps_tour.title02,
        content: tours.apps_tour.content02,
        placement: 'right',
        reflex: true,
        reflexElement: '#applications .btn-group',
      },
      {
        path: '/idm/applications/new',
        element: '#create_application_modal',
        title: tours.apps_tour.title03,
        content: tours.apps_tour.content03,
        placement: 'left',
        onShown: function(tour) {
          $('#id_name').inputTextWithDelay('First App');
          setTimeout(function() {
            $('#id_description').inputTextWithDelay(
              'Created during the Applications Tour.'
            );
          }, 750);
        },
      },
      {
        path: '/idm/applications/new',
        element: '#create_application_modal fieldset .form-group:eq(2)',
        title: tours.apps_tour.title04,
        content: tours.apps_tour.content04,
        placement: 'left',
        onShown: function(tour) {
          $('#id_url').inputTextWithDelay('sample.app.com');
        },
      },
      {
        path: '/idm/applications/new',
        element: '#create_application_modal fieldset .form-group:eq(3)',
        title: tours.apps_tour.title05,
        content: tours.apps_tour.content05,
        placement: 'left',
        onShown: function(tour) {
          $('#id_callbackurl').inputTextWithDelay('sample.app.com/login');
        },
      },
      {
        path: '/idm/applications/new',
        element: '#create_application_modal fieldset .form-group:eq(4)',
        title: tours.apps_tour.title06,
        content: tours.apps_tour.content06,
        placement: 'left',
        onShown: function(tour) {
          var def = $.Deferred();
          setTimeout(function() {
            $('.dropdown-menu')
              .addClass('tour-step-backdrop-parent')
              .css('z-index', '1101');
            $("label[for='id_grant_type']")
              .siblings('div')
              .find('.bootstrap-select')
              .addClass('open');
            def.resolve();
          });

          return def.promise();
        },
      },
      {
        path: '/idm/applications/new',
        element: '#create_application_modal fieldset .form-group:eq(5)',
        title: tours.apps_tour.title07,
        content: tours.apps_tour.content07,
        placement: 'left',
        onShown: function(tour) {
          var def = $.Deferred();
          setTimeout(function() {
            $('.dropdown-menu')
              .addClass('tour-step-backdrop-parent')
              .css('z-index', '1101');
            $("label[for='id_provider']")
              .siblings('div')
              .find('.bootstrap-select')
              .addClass('open');
            def.resolve();
          });

          return def.promise();
        },
      },
      {
        path: '/idm/applications/new',
        element: '.btn.btn-primary',
        title: tours.apps_tour.title08,
        content: tours.apps_tour.content08,
        placement: 'left',
        reflex: true,
        template: _noNextTemplate.replace('Tour title', 'Applications Tour'),
      },
      {
        path: RegExp('/idm/applications/[^/]+/step/avatar', 'i'),
        element: '#upload_image_modal',
        title: tours.apps_tour.title09,
        content: tours.apps_tour.content09,
        placement: 'left',
        template: _noPrevTemplate.replace('Tour title', 'Applications Tour'),
      },
      {
        path: RegExp('/idm/applications/[^/]+/step/avatar', 'i'),
        element: '.btn.btn-primary',
        title: tours.apps_tour.title10,
        content: tours.apps_tour.content10,
        placement: 'left',
        reflex: true,
        template: _noNextTemplate.replace('Tour title', 'Applications Tour'),
      },
      {
        path: RegExp('/idm/applications/[^/]+/step/roles', 'i'),
        element: '#create_application_roles',
        title: tours.apps_tour.title11,
        content: tours.apps_tour.content11,
        placement: 'left',
        template: _noPrevTemplate.replace('Tour title', 'Applications Tour'),
      },
      {
        path: RegExp('/idm/applications/[^/]+/step/roles', 'i'),
        element: '#create_application_roles .btn.btn-primary',
        title: tours.apps_tour.title12,
        content: tours.apps_tour.content12,
        placement: 'left',
        reflex: true,
        template: _noNextTemplate.replace('Tour title', 'Applications Tour'),
      },
      {
        path: RegExp('/idm/applications/[^/]', 'i'),
        element: '#content_body',
        title: tours.apps_tour.title13,
        content: tours.apps_tour.content13,
        placement: 'left',
        template: _noPrevTemplate.replace('Tour title', 'Applications Tour'),
      },
      {
        path: '/idm',
        title: tours.apps_tour.title14,
        content: tours.apps_tour.content14,
        orphan: true,
      },
    ],
  },

  rolesTourOptions: {
    name: 'rolesAndPermissionsTour',
    template: _tourTemplate.replace('Tour title', 'Roles & Permissions Tour'),
    steps: [
      {
        path: '/idm',
        title: tours.roles_tour.title01,
        content: tours.roles_tour.content01,
        orphan: true,
      },
      {
        path: '/idm',
        title: tours.roles_tour.title02,
        content: tours.roles_tour.content02,
        element: '#applications',
        placement: 'right',
        template: _noNextTemplate.replace(
          'Tour title',
          'Roles & Permissions Tour'
        ),
        reflex: true,
        reflexElement: '#applications .list-group-item a.item',
      },
      {
        path: RegExp('/idm/applications/[^/]', 'i'),
        element: '#content_body',
        title: tours.roles_tour.title03,
        content: tours.roles_tour.content03,
        placement: 'left',
      },
      {
        path: RegExp('/idm/applications/[^/]', 'i'),
        element: '#detailApplication h4 a.small:last-child',
        title: tours.roles_tour.title04,
        content: tours.roles_tour.content04,
        placement: 'bottom',
        reflex: true,
        template: _noNextTemplate.replace(
          'Tour title',
          'Roles & Permissions Tour'
        ),
      },
      {
        path: RegExp('/idm/applications/[^/]+/edit/roles', 'i'),
        element: '#create_application_roles',
        title: tours.roles_tour.title05,
        content: tours.roles_tour.content05,
        placement: 'left',
        template: _noPrevTemplate.replace(
          'Tour title',
          'Roles & Permissions Tour'
        ),
      },
      {
        path: RegExp('/idm/applications/[^/]+/edit/roles', 'i'),
        element: '#role_list',
        title: tours.roles_tour.title06,
        content: tours.roles_tour.content06,
        placement: 'bottom',
      },
      {
        path: RegExp('/idm/applications/[^/]+/edit/roles', 'i'),
        element: '#role_list',
        title: tours.roles_tour.title07,
        content: tours.roles_tour.content07,
        placement: 'bottom',
        template: _noNextTemplate.replace(
          'Tour title',
          'Roles & Permissions Tour'
        ),
        reflexElement: 'div.btn.btn-default.role',
        reflex: true,
      },
      {
        path: RegExp('/idm/applications/[^/]+/edit/roles', 'i'),
        element: '#permissions_list',
        title: tours.roles_tour.title08,
        content: tours.roles_tour.content08,
        placement: 'bottom',
      },
      {
        path: RegExp('/idm/applications/[^/]+/edit/roles', 'i'),
        element: '#permissions_list i.fa.fa-plus',
        title: tours.roles_tour.title09,
        content: tours.roles_tour.content09,
        placement: 'bottom',
      },
      {
        path: RegExp('/idm/applications/[^/]+/edit/roles', 'i'),
        element: '#role_list i.fa.fa-plus',
        title: tours.roles_tour.title10,
        content: tours.roles_tour.content10,
        placement: 'bottom',
      },
      {
        path: RegExp('/idm/applications/[^/]+/edit/roles', 'i'),
        element: '#create_application_roles input.btn.btn-primary',
        title: tours.roles_tour.title11,
        content: tours.roles_tour.content11,
        placement: 'bottom',
        template: _noNextTemplate.replace(
          'Tour title',
          'Roles & Permissions Tour'
        ),
        reflex: true,
      },
      {
        path: RegExp('/idm/applications/[^/]', 'i'),
        element: '#content_body #auth_users',
        title: tours.roles_tour.title12,
        content: tours.roles_tour.content12,
        placement: 'left',
        template: _noPrevTemplate.replace(
          'Tour title',
          'Roles & Permissions Tour'
        ),
        onNext: function(tour) {
          var def = $.Deferred();
          setTimeout(function() {
            def.resolve();
          }, 100);

          return def.promise();
        },
      },
      {
        path: RegExp('/idm/applications/[^/]', 'i'),
        element: '#content_body #auth_organizations',
        title: tours.roles_tour.title13,
        content: tours.roles_tour.content13,
        placement: 'left',
      },
      {
        path: '/idm',
        title: tours.roles_tour.title14,
        content: tours.roles_tour.content14,
        orphan: true,
        template: _noPrevTemplate.replace(
          'Tour title',
          'Roles & Permissions Tour'
        ),
      },
    ],
  },

  orgsTourOptions: {
    name: 'organizationsTour',
    template: _tourTemplate.replace('Tour title', 'Organizations Tour'),
    steps: [
      {
        path: '/idm',
        title: tours.orgs_tour.title01,
        content: tours.orgs_tour.content01,
        orphan: true,
      },
      {
        path: '/idm',
        element: '#organizations',
        title: tours.orgs_tour.title02,
        content: tours.orgs_tour.content02,
        placement: 'left',
        reflex: true,
        reflexElement: '#organizations .btn-group',
      },
      {
        path: '/idm/organizations/new',
        element: '#create_application_modal',
        title: tours.orgs_tour.title03,
        content: tours.orgs_tour.content03,
        placement: 'left',
        onShown: function(tour) {
          $('#id_name').inputTextWithDelay('First Org');
          setTimeout(function() {
            $('#id_description').inputTextWithDelay(
              'Created during the Organizations Tour.'
            );
          }, 750);
        },
      },
      {
        path: '/idm/organizations/new',
        element: '.btn.btn-primary',
        title: tours.orgs_tour.title04,
        content: tours.orgs_tour.content04,
        placement: 'left',
        reflex: true,
        template: _noNextTemplate.replace('Tour title', 'Organizations Tour'),
      },
      {
        path: RegExp('/idm/organizations/[^/]', 'i'),
        element: '#content_body',
        title: tours.orgs_tour.title05,
        content: tours.orgs_tour.content05,
        placement: 'left',
        template: _noPrevTemplate.replace('Tour title', 'Organizations Tour'),
      },
      {
        path: RegExp('/idm/organizations/[^/]', 'i'),
        element: '#content_body #auth_users',
        title: tours.orgs_tour.title06,
        content: tours.orgs_tour.content06,
        placement: 'left',
      },
      {
        path: RegExp('/idm/organizations/[^/]', 'i'),
        element: '#content_body #auth_applications',
        title: tours.orgs_tour.title07,
        content: tours.orgs_tour.content07,
        placement: 'left',
      },
      {
        path: '/idm',
        title: tours.orgs_tour.title08,
        content: tours.orgs_tour.content08,
        orphan: true,
        redirect: function() {
          var switchAccountElements = $(
            '#profile_editor_switcher .dropdown-menu .dropdown-menu li a'
          );
          var userImageElement;
          switchAccountElements.find('img').each(function(index, value) {
            if (
              $(value)
                .attr('src')
                .includes('UserAvatar')
            ) {
              userImageElement = value;
              return false;
            }
          });

          document.location.href = $(userImageElement)
            .closest('a')
            .attr('href');
        },
        template: _noPrevTemplate.replace('Tour title', 'Organizations Tour'),
      },
    ],
  },
};

var tours = {
  initTour: new Tour(
    $.extend(_toursDefaultOptions, _toursOptions.initTourOptions)
  ),
  profileTour: new Tour(
    $.extend(_toursDefaultOptions, _toursOptions.profileTourOptions)
  ),
  appsTour: new Tour(
    $.extend(_toursDefaultOptions, _toursOptions.appsTourOptions)
  ),
  rolesTour: new Tour(
    $.extend(_toursDefaultOptions, _toursOptions.rolesTourOptions)
  ),
  orgsTour: new Tour(
    $.extend(_toursDefaultOptions, _toursOptions.orgsTourOptions)
  ),
};

$(document).ready(function() {
  /* extend jQuery with a new function */
  $.fn.extend({
    inputTextWithDelay: function(text, delay = 20) {
      if (this.val() !== '') return void 0;

      i = 0;
      $this = this;
      interval = setInterval(function() {
        if (text[i] !== undefined) {
          $this.val($this.val() + text[i]);
          if (++i > text.length - 1) return clearInterval(interval);
        }
      }, delay);
    },
  });

  /* init one tour after another */
  $('body').on('click', '.next-tour', function() {
    var nextTour = $(this).attr('data-next-tour');
    var currentTour = $(this).attr('data-current-tour');

    tours[currentTour].end();

    if (nextTour !== undefined) {
      tours[nextTour].init();
      if (tours[nextTour]._getState('current_step') !== null)
        tours[nextTour].restart();
      else tours[nextTour].start();
    }
  });

  /* resume tour if any */
  $.each(tours, function(i, tour) {
    if (tour._getState('current_step') !== null && !tour.ended()) {
      tour.init();
      return false;
    }
  });
});
