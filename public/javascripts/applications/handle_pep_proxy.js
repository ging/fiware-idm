
// Handle authorize users to the application
$(document).ready(function(){

	// Assign pep proxy to application
    $("#collapse_pep_proxy").on("click","#register_pep", function(event) { 

    	// Stop linking        
        event.preventDefault();

        // Send ajax request to create pep proxy
        var url = $(this).attr('href');
        $.get(url, function(result) {
        	if (result.message.type === 'success') {
        		var pep = $('#pep_proxy_template').html();
	            pep = pep.replace(/pep_id/g, result.pep.id);
	            pep = pep.replace(/pep_password/g, result.pep.password);
	            pep = pep.replace(/application_id/g, result.application.id);
				$('#collapse_pep_proxy').empty();
	            $('#collapse_pep_proxy').append(pep);                                         		                           
        	}

        	// Add message
            var message = $('#message_template').html();
            message = message.replace(/type/g, result.message.type);
            message = message.replace(/data/g, result.message.text);
            $('.messages').replaceWith(message);
        });
    });

    // Assign roles to users
    // SI PONES ACTION_PEP EN LUGAR DE DELETE_PEP Y LE DAS A DELETE SE ENVIA UNA PETICION RARA QUE DE POR SI NO HACE NADA, PERO SI LUEGO PINCHAS EN VERR TODAS 
    // LAS APLICATIONES RESULTA QUE ELIMINA EN LA QUE ESTABAS DANDO AL BOTON DE DELETE
    $("#collapse_pep_proxy").on("click",".delete_pep", function(event) { 

        // Stop linking        
        event.preventDefault();

        // Send ajax request to delete pep proxy
        var url = $(this).attr('href');
        $.ajax({
            url: url,
            type: 'DELETE',
            success: function(result) {
                if (result.message.type === "success") {
                    $('#collapse_pep_proxy').empty();
                    $('#collapse_pep_proxy').append('<h6 class="panel-heading"></h6>');
                    $('#collapse_pep_proxy').append('<a id="register_pep" href="/idm/applications/'+result.application.id+'/pep/register/" class="btn btn-default">Register a new PEP Proxy</a>');                                
                } 

                // Add message
                var message = $('#message_template').html();
                message = message.replace(/type/g, result.message.type);
                message = message.replace(/data/g, result.message.text);
                $('.messages').replaceWith(message);
            }
        });
    });
});