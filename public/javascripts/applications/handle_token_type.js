
$(document).ready(function() {

	$("select#select_toke_type").on("changed.bs.select", function() {
		var token_type = $('select#select_toke_type').val()
		
		if (token_type === 'jwt') {
			$('div#jwt_secret').show()
		} else {
			$('div#jwt_secret').hide()
		}

		// Send put request
        var put_request = $.ajax({
            url: window.location.pathname+'/token_type/change',
            type: 'PUT',
            beforeSend: beforeSend($('input:hidden[name=_csrf]').val()),
            data: { token_type: token_type }
        })

        put_request.done((result) => {
        	console.log(result)
        	if (result.message.type === 'success') {
        		if (token_type === 'jwt') {
                	$('#secret').html(result.jwt_secret)
        		}
            }

            // Add message
            create_message(result.message.type, result.message.text);
        });

        put_request.fail((result) => {
            // Add message
            create_message(result.message.type, result.message.text);
        })
	})

    $("#collapse_token_type").on("click","a.reset_secret", function(event) { 

        // Stop linking        
        event.preventDefault();

        // Send ajax request to delete pep proxy
        var url = $(this).attr('href');
        $.get(url, function(result) {
            
            if (result.message.type === 'success') {
                $('#secret').html(result.jwt_secret)
            }

            // Add message
            create_message(result.message.type, result.message.text);
        });
    });

})