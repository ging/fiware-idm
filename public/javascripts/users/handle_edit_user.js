// Handle edit user

$(document).ready(function(){

	// Select image
	$('.modal-body').on('change','#id_image', function() {
		readURL(this);
		if ($(this).val()) {
			$('.avatar-update-container').children().show("open")
		}
	});

	// Cancel select image
	$('#cancel-crop-button').click(function() {
		$('#id_image').replaceWith('<input id="id_image" name="image" type="file">')
		$('.avatar-update-container').children().hide("close")
	});

    // Handle the submit button from the edit application form
	$("#create_avatar_form").on("submit", function(event) {

		// stop form from submitting normally
	    event.preventDefault();
	    var types = ['jpg', 'jpeg', 'png']
	    var file_type = $(this).find('#id_image')[0].files[0].name.split('.').pop().toLowerCase()

	    if (types.includes(file_type)) {
	    	// Continue with the submit request
	    	$("#create_avatar_form")[0].submit();
	    } else {
	    	alert("Please upload a valid file: jpg, jpeg or png")
	    	$('#id_image').replaceWith('<input id="id_image" name="image" type="file">')
			$('.avatar-update-container').children().hide("close")
	    }
  	});

    // To remove message
    $("#container.container-fluid").on("click","#close_message",function () {
        $(".messages").empty();
    });

});

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('.avatar-update-container').find('#avatar-update').attr('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}