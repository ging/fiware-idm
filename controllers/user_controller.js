var users = { admin: {id:1, username:"admin", password:"1234"},
			  pepe: {id:2, username:"pepe", password:"5678"}
			};

// See if user is registered
exports.autenticar = function(login, password, callback) {
	if (users[login]) {
		if (password == users[login].password) {
			callback(null, users[login]);
		} else { callback(new Error('Password erroneo')); }
	} else { callback(new Error('Usuario no registrado')); }
}