ko.bindingHandlers.jsonViewer = {
	bindingHandler: {},
	init: function(element, valueAccessor, allBindingsAccessor) {
		this.bindingHandler = new jsonViewer.BindingHandler(element, valueAccessor, allBindingsAccessor);
		this.bindingHandler.addStyle();
	},
	update: function(element, valueAccessor, allBindingsAccessor) {
		this.bindingHandler.compare(valueAccessor());
		var jsonHtml = this.bindingHandler.render();
		element.innerHTML = jsonHtml;
	}
};

if (typeof jsonViewer == 'undefined') {
	jsonViewer = {};
}

jsonViewer.BindingHandler = function(element, valueAccessor, allBindingsAccessor) {
	var comparer = jsonViewer.Comparer(),
	
	rootName = function() {
		var propertyString = allBindingsAccessor()._ko_property_writers.jsonViewer.toString();
		propertyString = propertyString.substring(24).replace(' = __ko_value; }', '');
		return propertyString;
	},
	
	addStyle = function() {
		if (document.getElementById('jsonViewerCss') === null) {
			var style = document.createElement('style');
			style.type = 'text/css';
			style.rel = 'stylesheet'
			style.innerHTML = jsonViewer.css;
			style.id = 'jsonViewerCss'
			document.getElementsByTagName('head')[0].appendChild(style);	
		};
	},
	
	render = function() {
		return jsonViewer.renderer(this.object, this.rootName());
	};
	
	return {
		rootName: rootName,
		addStyle: addStyle,
		compare: comparer.compare,
		object: comparer.object,
		render: render
	};
};

// var ontoggle = function(event) {
// 	var collapsed, target = event.target;
// 	if (event.target.className == 'collapser') {
// 		collapsed = target.parentNode.getElementsByClassName('collapsible')[0];
// 		if (collapsed.parentNode.classList.contains("collapsed")) collapsed.parentNode.classList.remove("collapsed");
// 		else collapsed.parentNode.classList.add("collapsed");
// 	}
// 
// document.body.addEventListener('click', ontoggle, false);
