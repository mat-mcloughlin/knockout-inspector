var fs = require('fs'),
	exec = require('child_process').exec,
	namespace = 'jsonViewer',
	stylesheetFile = namespace + '.css',
	cssFile = namespace + '.css.js';

var cssFileStart = 	"if (typeof " + namespace + " == 'undefined') { " + namespace + " = {};	} " + namespace + ".css='",
	cssFileEnd = "';";
	
fs.readFile(stylesheetFile, 'utf8', function(err, data) {
  if (err) {
		console.log(err);
	}
	console.log(data);
	
	var stylesheetContents = data.replace(/(\r\n|\n|\r)/gm,'').replace(/\t/g, '');

	stylesheetContents = cssFileStart + stylesheetContents + cssFileEnd;

	fs.writeFile(cssFile, stylesheetContents, function(err) {
    if(err) {
    	console.log(err);
    } else {
      console.log(namespace + '.bindingHandler.js');
			child = exec('uglifyjs ' + namespace + '.bindingHandler.js ' + 
			namespace + '.comparer.js ' + 
			namespace + '.css.js ' + 
			namespace + '.dirtyFlag.js ' +
			namespace + '.renderer.js ' +
			namespace + '.guid.js ' +
			'-o ' + namespace + '.js');
    }
	});
	
});

