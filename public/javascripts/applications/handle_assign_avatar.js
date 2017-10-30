// Handle assign avatar to application

$(document).ready(function(){

	// Select image
	$('.modal-body').on('change','#id_image', function() {
		readURL(this);
		if ($(this).val()) {
			$('.avatar-update-container').find('.update_actions').show("open")
		}
	});

	// Cancel select image
	$('#cancel-crop-button').click(function() {
		$('#avatar-update').attr('src', '/img/logos/original/app.png')
		$('#id_image').replaceWith('<input id="id_image" name="image" type="file">')
		$('.avatar-update-container').find('.update_actions').hide("close")
	});

	// Handle the submit button from the edit application form
	$("#create_avatar_form").on("submit", function(event) {

		// stop form from submitting normally
	    event.preventDefault();


	    if ($(this).find('#id_image')[0].files[0]) {
	    	var types = ['jpg', 'jpeg', 'png']
	    	var file_type = $(this).find('#id_image')[0].files[0].name.split('.').pop().toLowerCase()
	    	if (types.includes(file_type)) {
		    	// Continue with the submit request
		    	$("#create_avatar_form")[0].submit();
		    } else {
		    	alert("Please upload a valid file: jpg, jpeg or png")
		    	$('#avatar-update').attr('src', '/img/logos/original/app.png')
		    	$('#id_image').replaceWith('<input id="id_image" name="image" type="file">')
				$('.avatar-update-container').find('.update_actions').hide("close")
		    }	
	    } else {
	    	$("#create_avatar_form")[0].submit();
	    }

  	});

});

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#avatar-update').attr('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}