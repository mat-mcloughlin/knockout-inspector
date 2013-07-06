ko.bindingHandlers.inspect = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        var bindingHandler = new koInspector.BindingHandler(element, allBindingsAccessor);
        var guid = koInspector.guid.create();
        element.setAttribute('data-koInspector', guid);
        koInspector.global.inspectors[guid] = bindingHandler;

    },
    update: function (element, valueAccessor, allBindingsAccessor) {
        var bindingHandler = koInspector.global.inspectors[element.getAttribute('data-koInspector')];
        bindingHandler.comparer.compare(valueAccessor());
        bindingHandler.renderer.draw(bindingHandler.comparer.storedObject);
    }
};

if (typeof koInspector == 'undefined') {
    koInspector = {};
}

koInspector.BindingHandler = function (container, allBindingsAccessor) {
    this.addStyle();
    this.comparer = new koInspector.Comparer();
    this.rootName = this.getRootName(allBindingsAccessor);
    this.renderer = new koInspector.Renderer(this.rootName, container);

    return this;
};

koInspector.BindingHandler.prototype.addStyle = function () {
    if (document.getElementById('ko-inspector-css') === null) {
        var style = document.createElement('style');
        style.type = 'text/css';
        style.rel = 'stylesheet'
        style.innerHTML = koInspector.css;
        style.id = 'ko-inspector-css'
        document.getElementsByTagName('head')[0].appendChild(style);
    };
};

koInspector.BindingHandler.prototype.getRootName = function (allBindingsAccessor) {
    var propertyString = allBindingsAccessor()._ko_property_writers.inspect.toString();
    propertyString = propertyString.substring(24).replace(' = __ko_value; }', '');
    return propertyString;
};


///* automatically attach it */
//var scripts = document.getElementsByTagName('script');
//var thisScriptTag = document.getElementsByTagName('script')[scripts.length - 1];
//var script;

//var settings;
//for (var i = scripts.length - 1; i >= 0; i--) {
//    if (scripts[i].getAttribute('data-inspect')) {
//        script = scripts[i];
//        settings = eval('settings = {' + scripts[i].getAttribute('data-inspect') + '}');
//    }
//}

//if (settings && settings.observable) {
//    var dataBindString = 'inspect: ' + settings.observable;

//    if (settings.pinToTop) {
//        dataBindString += ', pinToTop: \'' + settings.pinToTop + '\'';
//    };

//    var div = document.createElement('div');
//    div.setAttribute('data-bind', dataBindString);
//    script.parentNode.insertBefore(div, script.nextSibling);
//}

