if (typeof koInspector == 'undefined') {
	koInspector = {};
}

koInspector.renderer = function() {
	var state = {

	},

	htmlEncode = function(t) {
		return t != null ? t.toString().replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : '';
	},

	decorateWithSpan = function(value, className) {
		return '<span class="' + className + '">' + htmlEncode(value) + '</span>';
	},

	getValue = function(value) {
		if (value && value.hasOwnProperty('value')) 
			return value;
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
		else if (value.value && value.value.constructor == Array) output += arrayToHtml(value.value, value.guid);
		else if (valueType == "object" && value.value.getMonth) output += stringToHtml(value.value.toString());
		else if (valueType == "object") output += objectToHtml(value.value, value.guid);
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

	arrayToHtml = function(json, guid) {
		var i, length, output = '<div data-collapser="ko-inspector-' + guid + '" class="collapser "></div>[<span class="ellipsis"></span><ul class="array collapsible">',
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

	objectToHtml = function(json, guid) {
		var i, key, length, keys = Object.keys(json),
			output = '<div data-collapser="ko-inspector-' + guid + '" class="collapser';
			output += '"></div>{<span class="ellipsis"></span><ul class="obj collapsible">',
			hasContents = false;
		for (i = 0, length = keys.length; i < length; i++) {
			key = keys[i];
			hasContents = true;

			if (json[key] && json[key].hasOwnProperty('isObservable') && json[key].isObservable) output += '<li><div class="hoverable">';
			else output += '<li><div class="hoverable nonObservable">';

			if (json[key] && json[key].hasOwnProperty('count') && json[key].count > 0) output += '<span class="change-counter">' + json[key].count + '</span>';
			if (json[key] && json[key].hasOwnProperty('subscribers') && (Number(json[key].subscribers) - 2 > 0)) output += '<span class="subscriber-counter">' + (Number(json[key].subscribers) - 2) + '</span>'
			
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
		output += '<div class="ko-inspector">';
		output += '<ul class="obj collapsible"><li><div class="hoverable"><span class="property">' + root + '</span>: ';
		output += valueToHtml(json);
		output += '</div></li></ul>';
		output += '</div>';
		return output;
	},

	pinToTop = function(element) {
		element.style.position = 'absolute';
		element.style.top = 0;
		element.style.left = 0;
		element.style.background ='#FFF';
		element.style.border = 'solid 1px #000';
		element.style['-moz-box-shadow'] = '4px 4px 4px 0 #CCC';
		element.style['-webkit-box-shadow'] = '4px 4px 4px 0 #CCC';
		element.style['box-shadow'] = '4px 4px 4px 0 #CCC';
	},

	onToggle = function(event) {
		var collapsed, target = event.target;
		if (event.target.className == 'collapser') {
			var guid = event.target.getAttribute('data-collapser');
			collapsed = target.parentNode.getElementsByClassName('collapsible')[0];
			
			if (collapsed.parentNode.classList.contains("collapsed")) {
				state[guid] = '';
				collapsed.parentNode.classList.remove("collapsed");
			} else {
				state[guid] = 'collapsed';
				collapsed.parentNode.classList.add("collapsed");
			}
		}
	},

	setState = function() {
		var collapsers = document.getElementsByClassName('collapser');
		for (var i = collapsers.length - 1; i >= 0; i--) {
			var collapsed = collapsers[i].parentNode.getElementsByClassName('collapsible')[0];
			if (state[collapsers[i].getAttribute('data-collapser')] && state[collapsers[i].getAttribute('data-collapser')] === 'collapsed') {
				collapsed.parentNode.classList.add("collapsed");
			}

		};
	
	};

	return {
		jsonToHtml: jsonToHtml,
		pinToTop: pinToTop,
		onToggle: onToggle,
		setState: setState,
	};
}();
