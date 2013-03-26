ko.bindingHandlers.jsonViewer = {
	bindingHandler: {},
	init: function(element, valueAccessor, allBindingsAccessor) {
		if (jsonViewer.elementId === undefined || element.id === jsonViewer.elementId) {
			this.bindingHandler = new jsonViewer.BindingHandler(element, valueAccessor, allBindingsAccessor);

			var guid = jsonViewer.guid.create();
			jsonViewer.elementId = 'jsonViewer-' + guid;
			element.id = jsonViewer.elementId;
	 		
	 		document.body.addEventListener('click', jsonViewer.renderer.onToggle, false);

	 		if (allBindingsAccessor().pinToTop) {
	 			jsonViewer.renderer.pinToTop(element);	
	 		};
			
			this.bindingHandler.addStyle();
		} else {
			console.log('jsonViewer: only one jsonViewer allowed');
		}
	},
	update: function(element, valueAccessor, allBindingsAccessor) {
		if (jsonViewer.elementId === undefined || element.id === jsonViewer.elementId) {
			this.bindingHandler.compare(valueAccessor());
			var jsonHtml = this.bindingHandler.render();
			element.innerHTML = jsonHtml;
			this.bindingHandler.setState();
		}
	}
};


/* automatically attach it */
	var scripts = document.getElementsByTagName('script');
	var thisScriptTag = document.getElementsByTagName('script')[ scripts.length - 1 ];
	var script;

	var settings;
	for (var i = scripts.length - 1; i >= 0; i--) {
		if (scripts[i].getAttribute('data-jsonViewer')) {
			script = scripts[i];
			settings = eval('settings = {' + scripts[i].getAttribute('data-jsonViewer') + '}');
		}
	}

	if (settings && settings.observable) {
		var dataBindString = 'jsonViewer: ' + settings.observable;

		if (settings.pinToTop) {
			dataBindString += ', pinToTop: true';
		};

		var div = document.createElement('div');
		div.setAttribute('data-bind', dataBindString);
		script.parentNode.insertBefore(div, script.nextSibling);
	}
};

if (typeof jsonViewer == 'undefined') {
	jsonViewer = {};
}

jsonViewer.elementId;

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
		return jsonViewer.renderer.jsonToHtml(this.object, this.rootName());
	};
	
	return {
		rootName: rootName,
		addStyle: addStyle,
		compare: comparer.compare,
		object: comparer.object,
		render: render,
		setState: jsonViewer.renderer.setState
	};
};

