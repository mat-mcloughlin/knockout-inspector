ko.bindingHandlers.jsonViewer = {
    jsonViewer: {},
    init: function (element, valueAccessor, allBindingsAccessor) {
        this.jsonViewer = new JsonViewer(element, valueAccessor, allBindingsAccessor);
    },
    update: function (element, valueAccessor, allBindingsAccessor) {
        this.jsonViewer.compare(valueAccessor);
        var jsonHtml = viewModelFormatter(this.jsonViewer.value, jsonViewer.getRootName());
        element.innerHTML = jsonHtml;
    }
};

var JsonViewer = function (element, valueAccessor, allBindingsAccessor) {
    var value = {},
    getRootName = function () {
        var propertyString = allBindingsAccessor()._ko_property_writers.jsonViewer.toString();
        propertyString = propertyString.substring(24).replace(' = __ko_value; }', '');
        return propertyString;
    },
    compare = function (newValue) {
        recurseObject(ko.utils.unwrapObservable(newValue()), value);
    },
    recurseObject = function (obj, currentObject) {
        for (var p in obj) {
            var isObservable = ko.isObservable(obj[p]);
            var unwrapped = ko.utils.unwrapObservable(obj[p]);

            if (currentObject[p]) {
                if (currentObject[p].value && (currentObject[p].value != unwrapped)) {
                    currentObject[p].changeCount++;
                    currentObject[p].value = unwrapped;
                }
                else {
                    recurseObject(unwrapped, currentObject[p]);
                }
            }
            else {
                if (typeof unwrapped !== 'object' || (unwrapped && unwrapped.getMonth))
                    currentObject[p] = { value: unwrapped, changeCount: 0, isObservable: isObservable };
                else {
                    currentObject[p] = {};
                    recurseObject(unwrapped, currentObject[p]);
                }
            }
        }
    },
    ontoggle = function (event) {
        var collapsed, target = event.target;
        if (event.target.className == 'collapser') {
            collapsed = target.parentNode.getElementsByClassName('collapsible')[0];
            if (collapsed.parentNode.classList.contains("collapsed"))
                collapsed.parentNode.classList.remove("collapsed");
            else
                collapsed.parentNode.classList.add("collapsed");
        }
    };

    document.body.addEventListener('click', ontoggle, false);

    return {
        getRootName: getRootName,
        compare: compare,
        value: value
    };
};

var viewModelFormatter = function () {
    var htmlEncode = function (t) {
        return t != null ? t.toString().replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : '';
    },
        decorateWithSpan = function (value, className) {
            return '<span class="' + className + '">' + htmlEncode(value) + '</span>';
        },
        getValue = function (value) {
            if (value && value.value)
                return value;
            else
                return { value: value, changeCount: 0 };
        },
        valueToHtml = function (value) {
            value = getValue(value)
            var valueType = typeof value.value,
                output = "";

            if (value.value == null)
                output += decorateWithSpan("null", "type-null");
            else if (value.value && value.value.constructor == Array)
                output += arrayToHtml(value.value);
            else if (valueType == "object" && value.value.getMonth)
                output += stringToHtml(value.value.toString());
            else if (valueType == "object")
                output += objectToHtml(value.value);
            else if (valueType == "number")
                output += decorateWithSpan(value.value, "type-number");
            else if (valueType == "string")
                output += stringToHtml(value.value);
            else if (valueType == "boolean")
                output += decorateWithSpan(value.value, "type-boolean");
            else if (valueType == "function")
                output += decorateWithSpan('function() {  }', "type-callback-function");

            return output;
        },
        stringToHtml = function (value) {
            var output = '';
            if (/^(http|https):\/\/[^\s]+$/.test(value))
                output += decorateWithSpan('"', "type-string") + '<a href="' + value + '">' + htmlEncode(value) + '</a>' + decorateWithSpan('"', "type-string");
            else
                output += decorateWithSpan('"' + value + '"', "type-string");
            return output;
        },
        arrayToHtml = function (json) {
            var i, length, output = '<div class="collapser "></div>[<span class="ellipsis"></span><ul class="array collapsible">', hasContents = false;
            for (i = 0, length = json.length; i < length; i++) {
                hasContents = true;
                output += '<li><div class="hoverable collapsed">';
                output += valueToHtml(json[i]);
                if (i < length - 1)
                    output += ',';
                output += '</div></li>';
            }
            output += '</ul>]';
            if (!hasContents)
                output = "[ ]";
            return output;
        },
        objectToHtml = function (json) {
            var i, key, length, keys = Object.keys(json), output = '<div class="collapser"></div>{<span class="ellipsis"></span><ul class="obj collapsible">', hasContents = false;
            for (i = 0, length = keys.length; i < length; i++) {
                key = keys[i];
                hasContents = true;

                if (json[key] && json[key].hasOwnProperty('isObservable') && json[key].isObservable)
                    output += '<li><div class="hoverable collapsed">';
                else
                    output += '<li><div class="hoverable collapsed nonObservable">';

                if (json[key] && json[key].hasOwnProperty('changeCount') && json[key].changeCount > 0)
                    output += '<span class="change-counter">' + json[key].changeCount + '</span>'

                output += '<span class="property">' + htmlEncode(key) + '</span>: ';
                output += valueToHtml(json[key]);
                if (i < length - 1)
                    output += ',';
                output += '</div></li>';
            }
            output += '</ul>}';
            if (!hasContents)
                output = "{ }";
            return output;
        },
        jsonToHtml = function (json, root) {
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