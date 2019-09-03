function checkStrength(password, input, label) {
  var strength = 0;
  if (password.length > 7) strength += 1;
  // If password contains both lower and uppercase characters, increase strength value.
  if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) strength += 1;
  // If it has numbers and characters, increase strength value.
  if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) strength += 1;
  // If it has one special character, increase strength value.
  if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1;
  // If it has two special characters, increase strength value.
  if (password.match(/(.*[!,%,&,@,#,$,^,*,?,_,~].*[!,%,&,@,#,$,^,*,?,_,~])/))
    strength += 1;
  // Calculated strength value, we can return messages
  // If value is less than 2
  if (password.length <= 0) {
    input.removeClass();
    input.addClass('form-control');
    label.find('a').remove();
  } else if (strength < 2) {
    input.removeClass();
    input.addClass('form-control weak_pwd_input');
    label.find('a').remove();
    label.append(
      '<a href="#" class="weak_pwd" data-toggle="tooltip" data-placement="top" title="">weak</a>'
    );
  } else if (strength == 2) {
    input.removeClass();
    input.addClass('form-control medium_pwd_input');
    label.find('a').remove();
    label.append(
      '<a href="#" class="medium_pwd" data-toggle="tooltip" data-placement="top" title="">medium</a>'
    );
  } else {
    input.removeClass();
    input.addClass('form-control hard_pwd_input');
    label.find('a').remove();
    label.append(
      '<a href="#" class="hard_pwd" data-toggle="tooltip" data-placement="top" title="">hard</a>'
    );
  }
}
