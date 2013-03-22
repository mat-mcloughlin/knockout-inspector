if (typeof jsonViewer == 'undefined') {
	jsonViewer = {};
}

jsonViewer.renderer = function() {
	var htmlEncode = function(t) {
			return t != null ? t.toString().replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : '';
		},
		decorateWithSpan = function(value, className) {
			return '<span class="' + className + '">' + htmlEncode(value) + '</span>';
		},
		getValue = function(value) {
			if (value && value.value) return value;
			else return {
				value: value,
				count: 0
			};
		},
		valueToHtml = function(value) {
			value = getValue(value)
			var valueType = typeof value.value,
				output = "";

			if (value.value == null) output += decorateWithSpan("null", "type-null");
			else if (value.value && value.value.constructor == Array) output += arrayToHtml(value.value);
			else if (valueType == "object" && value.value.getMonth) output += stringToHtml(value.value.toString());
			else if (valueType == "object") output += objectToHtml(value.value);
			else if (valueType == "number") output += decorateWithSpan(value.value, "type-number");
			else if (valueType == "string") output += stringToHtml(value.value);
			else if (valueType == "boolean") output += decorateWithSpan(value.value, "type-boolean");
			else if (valueType == "function") output += decorateWithSpan('function() {  }', "type-callback-function");

			return output;
		},
		stringToHtml = function(value) {
			var output = '';
			if (/^(http|https):\/\/[^\s]+$/.test(value)) output += decorateWithSpan('"', "type-string") + '<a href="' + value + '">' + htmlEncode(value) + '</a>' + decorateWithSpan('"', "type-string");
			else output += decorateWithSpan('"' + value + '"', "type-string");
			return output;
		},
		arrayToHtml = function(json) {
			var i, length, output = '<div class="collapser "></div>[<span class="ellipsis"></span><ul class="array collapsible">',
				hasContents = false;
			for (i = 0, length = json.length; i < length; i++) {
				hasContents = true;
				output += '<li><div class="hoverable">';
				output += valueToHtml(json[i]);
				if (i < length - 1) output += ',';
				output += '</div></li>';
			}
			output += '</ul>]';
			if (!hasContents) output = "[ ]";
			return output;
		},
		objectToHtml = function(json) {
			var i, key, length, keys = Object.keys(json),
				output = '<div class="collapser"></div>{<span class="ellipsis"></span><ul class="obj collapsible">',
				hasContents = false;
			for (i = 0, length = keys.length; i < length; i++) {
				key = keys[i];
				hasContents = true;

				if (json[key] && json[key].hasOwnProperty('isObservable') && json[key].isObservable) output += '<li><div class="hoverable">';
				else output += '<li><div class="hoverable nonObservable">';

				if (json[key] && json[key].hasOwnProperty('count') && json[key].count > 0) output += '<span class="change-counter">' + json[key].count + '</span>'
				if (json[key] && json[key].hasOwnProperty('subscribers') && json[key].subscribers - 2 > 0) output += '<span class="subscriber-counter">' + (Number(json[key].subscribers) - 2) + '</span>'
				
				debugger;
				var css = 'property ' + (json[key] && json[key].isObservable ? '' : 'nonObservable');
				output += '<span class="' + css + '">' + htmlEncode(key) + '</span>: ';
				output += valueToHtml(json[key]);
				if (i < length - 1) output += ',';
				output += '</div></li>';
			}
			output += '</ul>}';
			if (!hasContents) output = "{ }";
			return output;
		},
		jsonToHtml = function(json, root) {
			var output = '';
			output += '<div class="jsonViewer">';
			output += '<ul class="obj collapsible"><li><div class="hoverable"><span class="property">' + root + '</span>: ';
			output += valueToHtml(json);
			output += '</div></li></ul>';
			output += '</div>';
			return output;
		};

	return jsonToHtml;
}();
