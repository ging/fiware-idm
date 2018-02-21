$(document).ready(function(){

	// Init some values
	org_change_role('/idm/applications/filtered_organization?role=provider', $('#organization_applications').find('#panel_tabs').find('li:first').find('a:first'))

	$('#organization_applications').find('.ajax-tabs').on('click', 'li', function() {

		var panel = $(this).find('a:first')
		
		if (panel.attr('data-loaded') === 'false') {
			
			$('#organization_applications').find('#spinner_panel_tabs').show()

			var url = panel.attr('href')
			org_change_role(url, panel)

			$('#organization_applications').find('#spinner_panel_tabs').hide()
		}
	})

	function org_change_role(url, panel) {
		$.get(url, function(data, status) {
			var table;

			if (url.includes('provider')) {
				table = $('#organization_applications').find('#providing_table_content')
				org_providing_application(data.number_applications)				
			} else if (url.includes('purchaser')) {
				table = $('#organization_applications').find('#purchased_table_content')
				org_purchased_applications(data.number_applications)
			} else if (url.includes('other')) {						
				table = $('#organization_applications').find('#authorized_table_content')
				org_authorized_applications(data.number_applications)
			}

			org_create_rows(data.applications, table);
			panel.attr('data-loaded', 'true')
			
		})
	}

	function org_create_rows(applications, table) {

		if (applications.length > 0) {
			for (var i = 0; i < applications.length; i++) {
				var organization = 'Org: ' + htmlEntities(applications[i].organization_name)
				var application_row = $('#application_row_template').html();
	            application_row = application_row.replace(/application_id/g, applications[i].oauth_client_id);
	            application_row = application_row.replace(/application_image/g, applications[i].image);
	            application_row = application_row.replace(/application_name/g, htmlEntities(applications[i].name));
	            application_row = application_row.replace(/application_url/g, organization);

	            table.append(application_row);
				
			}
		} else {
			table.find('.alert').show()
		}
	}

	function htmlEntities(str) {
	    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	function org_providing_application(max) {

		$('#organization_applications').find('#providing_table_pagination_container').bootpag({
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
			var url = '/idm/applications/filtered_organization?role=provider&page='+num
		    $.get(url, function(data, status) {

				var table = $('#organization_applications').find('#providing_table_content')

				table.empty()
				org_create_rows(data.applications, table);
				
			})
		});
	}

	function org_purchased_applications(max) {

		$('#organization_applications').find('#purchased_table_pagination_container').bootpag({
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
		    var url = '/idm/applications/filtered_organization?role=purchaser&page='+num
		    $.get(url, function(data, status) {
				var table = $('#organization_applications').find('#purchased_table_content')

				table.empty()
				org_create_rows(data.applications, table);
				
			})
		}); 
	}

	function org_authorized_applications(max) {

		$('#organization_applications').find('#authorized_table_pagination_container').bootpag({
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
		    var url = '/idm/applications/filtered_organization?role=other&page='+num
		    $.get(url, function(data, status) {
				var table = $('#organization_applications').find('#authorized_table_content')

				table.empty()
				org_create_rows(data.applications, table);
				
			})
		});
	} 
	
});