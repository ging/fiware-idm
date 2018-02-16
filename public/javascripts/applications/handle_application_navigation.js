$(document).ready(function(){

	// Init some values
	change_role('?tab=panel_tabs__providing_tab', $('#panel_tabs').find('li:first').find('a:first'))

	$('.ajax-tabs').on('click', 'li', function() {
		var panel = $(this).find('a:first')
		
		if (panel.attr('data-loaded') === 'false') {
			
			$('#spinner_panel_tabs').show()

			var url = panel.attr('href')
			change_role(url, panel)

			$('#spinner_panel_tabs').hide()
		}
	})

	function change_role(url, panel) {
		$.get(url, function(data, status) {
			var table;

			if (url.includes('panel_tabs__providing_tab')) {
				table = $('#providing_table_content')
				providing_applications(data.number_applications)				
			} else if (url.includes('panel_tabs__purchased_tab')) {
				table = $('#purchased_table_content')
				purchased_applications(data.number_applications)
			} else if (url.includes('panel_tabs__authorized_tab')) {						
				table = $('#authorized_table_content')
				authorized_applications(data.number_applications)
			}

			create_rows(data.applications, table);
			panel.attr('data-loaded', 'true')
			
		})
	}

	function create_rows(applications, table) {
		if (applications.length > 0) {
			for (var i = 0; i < applications.length; i++) {
				var application_row = $('#application_row_template').html();
	            application_row = application_row.replace(/application_id/g, applications[i].id);
	            application_row = application_row.replace(/application_image/g, applications[i].image);
	            application_row = application_row.replace(/application_name/g, htmlEntities(applications[i].name));
	            application_row = application_row.replace(/application_url/g, htmlEntities(applications[i].url));

	            table.append(application_row);
				
			}
		} else {
			table.find('.alert').show()
		}
	}

	function htmlEntities(str) {
	    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	function providing_applications(max) {

		$('#providing_table_pagination_container').bootpag({
		    total: Math.ceil(max/5),
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
		}).on("page", function(event, num){
			var url = '/idm/applications/filtered?role=provider&page='+num
		    $.get(url, function(data, status) {

				var table = $('#providing_table_content')

				table.empty()
				create_rows(data.applications, table);
				
			})
		});
	}

	function purchased_applications(max) {

		$('#purchased_table_pagination_container').bootpag({
		    total: Math.ceil(max/5),
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
		}).on("page", function(event, num){
		    var url = '/idm/applications/filtered?role=purchaser&page='+num
		    $.get(url, function(data, status) {
				var table = $('#purchased_table_content')

				table.empty()
				create_rows(data.applications, table);
				
			})
		}); 
	}

	function authorized_applications(max) {

		$('#authorized_table_pagination_container').bootpag({
		    total: Math.ceil(max/5),
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
		}).on("page", function(event, num){
		    var url = '/idm/applications/filtered?role=other&page='+num
		    $.get(url, function(data, status) {
				var table = $('#authorized_table_content')

				table.empty()
				create_rows(data.applications, table);
				
			})
		});
	} 
	
});