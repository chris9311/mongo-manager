db.users.find().forEach(function(x) {
	print('name:'+x.name);
});