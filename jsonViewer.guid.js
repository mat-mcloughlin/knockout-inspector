if (typeof jsonViewer == 'undefined') {
	jsonViewer = {};
}

jsonViewer.guid = {
	s4: function() {
		return Math.floor((1 + Math.random()) * 0x10000)
 		.toString(16)
 		.substring(1);
	},

	create: function() {
		return jsonViewer.guid.s4() + jsonViewer.guid.s4() + '-' + jsonViewer.guid.s4() + '-' + jsonViewer.guid.s4() + '-' +
     	jsonViewer.guid.s4() + '-' + jsonViewer.guid.s4() + jsonViewer.guid.s4() + jsonViewer.guid.s4();
	}
};