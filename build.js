var fs = require('fs'),
exec = require('child_process').exec,
namespace = 'koInspector',
file = 'ko-inspector'
stylesheetFile = file + '.css',
cssFile = file + '.css.js';

var cssFileStart = "if (typeof " + namespace + " == 'undefined') { " + namespace + " = {};	} " + namespace + ".css='",
cssFileEnd = "';";

fs.readFile(stylesheetFile, 'utf8', function (err, data) {
    if (err) {
        console.log(err);
    }

    var stylesheetContents = data.replace(/(\r\n|\n|\r)/gm, '').replace(/\t/g, '');

    stylesheetContents = cssFileStart + stylesheetContents + cssFileEnd;

    fs.writeFile(cssFile, stylesheetContents, function (err) {
        if (err) {
            console.log(err);
        } else {
            child = exec('uglifyjs ' +
            file + '.bindingHandler.js ' +
            file + '.comparer.js ' +
            file + '.css.js ' +
            file + '.dirtyFlag.js ' +
            file + '.renderer.js ' +
            file + '.guid.js ' +
            '-o ' + file + '.js');
        }
    });

});