/*
	@name: 			/lib/3rd_party/uuid
	
	@description: 	base model
	
	@author: 		Simon Jefford
	
*/

var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''); 

exports.generate = function () {
	var uuid = [];

	// rfc4122, version 4 form
	var r;

	// rfc4122 requires these characters
	uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
	uuid[14] = '4';

	// Fill in random data.  At i==19 set the high bits of clock sequence as
	// per rfc4122, sec. 4.1.5
	for (var i = 0; i < 36; i++) {
		if (!uuid[i]) {
			r = 0 | Math.random()*16;
			uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
		}
	}

	return uuid.join('');
};

