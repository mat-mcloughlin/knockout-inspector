ko.bindingHandlers.inspect = {
    bindingHandler: {},
    init: function (element, valueAccessor, allBindingsAccessor) {
        if (koInspector.elementId === undefined || element.id === koInspector.elementId) {
            this.bindingHandler = new koInspector.BindingHandler(element, valueAccessor, allBindingsAccessor);

            var guid = koInspector.guid.create();
            koInspector.elementId = 'ko-inspector-' + guid;
            element.id = koInspector.elementId;

            document.body.addEventListener('click', koInspector.renderer.onToggle, false);

            if (allBindingsAccessor().pinToTop) {
                koInspector.renderer.pinToTop(element, allBindingsAccessor().pinToTop);
            };

            this.bindingHandler.addStyle();
        } else {
            console.log('ko-inspector: only one inspect allowed');
        }
    },
    update: function (element, valueAccessor, allBindingsAccessor) {
        if (koInspector.elementId === undefined || element.id === koInspector.elementId) {
            this.bindingHandler.compare(valueAccessor());
            var jsonHtml = this.bindingHandler.render();
            element.innerHTML = jsonHtml;
            this.bindingHandler.setState();
        }
    }
};


/* automatically attach it */
var scripts = document.getElementsByTagName('script');
var thisScriptTag = document.getElementsByTagName('script')[scripts.length - 1];
var script;

var settings;
for (var i = scripts.length - 1; i >= 0; i--) {
    if (scripts[i].getAttribute('data-inspect')) {
        script = scripts[i];
        settings = eval('settings = {' + scripts[i].getAttribute('data-inspect') + '}');
    }
}

if (settings && settings.observable) {
    var dataBindString = 'inspect: ' + settings.observable;

    if (settings.pinToTop) {
        dataBindString += ', pinToTop: \'' + settings.pinToTop + '\'';
    };

    var div = document.createElement('div');
    div.setAttribute('data-bind', dataBindString);
    script.parentNode.insertBefore(div, script.nextSibling);
}

if (typeof koInspector == 'undefined') {
    koInspector = {};
}

koInspector.elementId;

koInspector.BindingHandler = function (element, valueAccessor, allBindingsAccessor) {
    var comparer = koInspector.Comparer(),

    rootName = function () {
        var propertyString = allBindingsAccessor()._ko_property_writers.inspect.toString();
        propertyString = propertyString.substring(24).replace(' = __ko_value; }', '');
        return propertyString;
    },

    addStyle = function () {
        if (document.getElementById('ko-inspector-css') === null) {
            var style = document.createElement('style');
            style.type = 'text/css';
            style.rel = 'stylesheet'
            style.innerHTML = koInspector.css;
            style.id = 'ko-inspector-css'
            document.getElementsByTagName('head')[0].appendChild(style);
        };
    },

    render = function () {
        return koInspector.renderer.jsonToHtml(this.object, this.rootName());
    };

    return {
        rootName: rootName,
        addStyle: addStyle,
        compare: comparer.compare,
        object: comparer.object,
        render: render,
        setState: koInspector.renderer.setState
    };
};

