// TODO: 
// handle urls.
// set state when opened. by checking the list of guids.
// Make them hoverable.
// figure our what to do about functions?
// put inline block inside block to render properly

if (typeof koInspector == 'undefined') {
    koInspector = {};
}

koInspector.Renderer = function (objectName, container) {
    this.objectName = objectName;
    this.container = this.prepareContainer(container);
    this.treeObject;
    this.cache = [];

    return this;
};

/* This function goes through the object and flattens out an arrays or objects. This
/* is so it can be used as a lookup when building out the tree */
koInspector.Renderer.prototype.prepareObject = function (object) {
    this.treeObject = {};
    var clone = JSON.parse(JSON.stringify(object))
    recurseObject('root', this.treeObject, clone);
    return this.treeObject;

    function recurseObject(name, returnObject, object) {
        returnObject[name] = object; // pull in all the properties
        for (var property in returnObject[name]) {
            if (object.hasOwnProperty(property)) {

                /* If the object is an object (not date) or an array we remove the value and add it as another
                /* node of the root */
                if (Object.prototype.toString.call(object[property].value) === '[object Array]') {
                    recurseObject(object[property].guid, returnObject, object[property].value)
                    returnObject[name][property].value = '[[array]]';
                } else if (object[property].value && typeof object[property].value === 'object' && object[property].value.getMonth === undefined) {
                    recurseObject(object[property].guid, returnObject, object[property].value)
                    returnObject[name][property].value = '[[object]]';
                }

            }
        }
        return returnObject;
    };
};

koInspector.Renderer.prototype.prepareContainer = function (container) {
    var id = 'ko-inspector-' + koInspector.guid.create(),
        div = this.create('div', 'ko-inspector');

    div.id = id;
    container.appendChild(div);

    return div;
};

koInspector.Renderer.prototype.draw = function (object) {
    this.prepareObject(object);
    this.container.innerHTML = '';

    var self = this;
    var root = self.treeObject.root;
    var ul = self.create('ul', 'collapsible');
    var li = self.create('li');
    var div = self.create('div', 'hoverable collapsed');
    var span = self.create('span', 'property');
    var collapser = self.create('div', 'collapser');
    var ellipsis = self.create('span', 'ellipsis');
    var childUl = self.create('ul', 'collapsible');

    span.textContent = self.objectName;

    collapser.onclick = function () {
        self.collapserClick.call(self, root, div, childUl, 'root');
    }

    div.appendChild(span);
    div.appendChild(document.createTextNode(': '));
    div.appendChild(collapser);
    div.appendChild(document.createTextNode('{'));
    div.appendChild(ellipsis);
    div.appendChild(childUl);
    div.appendChild(document.createTextNode('}'));

    li.appendChild(div);
    ul.appendChild(li);

    self.container.appendChild(ul);

    if (self.cache.indexOf('root') > -1) {
        self.showChildren(root, childUl);
        div.className = 'hoverable';
    }

};

koInspector.Renderer.prototype.showChildren = function (root, childUl) {
    var self = this;
    if (childUl.innerHTML === '') {
        var keys = Object.keys(root);
 
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i],
                isLast = i === length - 1;

            childUl.appendChild(self.drawValue(key, root[key], isLast));
        }
    }
};

koInspector.Renderer.prototype.collapserClick = function (root, div, childUl, guid) {
    var self = this;

    if (self.hasClass(div, 'collapsed')) {
        self.showChildren.call(self, root, childUl);
        div.className = 'hoverable';
        self.cache.push(guid);
    } else {
        div.className = 'hoverable collapsed';
        self.cache.splice(self.cache.indexOf(guid), 1);
    }
};

koInspector.Renderer.prototype.drawObject = function (div, value) {
    /* In hear depending on wether the guid is in the state show it or hide it.*/

    var self = this;
    var root = self.treeObject[value.guid];
    var collapser = self.create('div', 'collapser');
    var ellipsis = self.create('span', 'ellipsis');
    var childUl = self.create('ul', 'collapsible'); // maybe add in object type here to?

    collapser.onclick = function () {
        self.collapserClick.call(self, root, div, childUl, value.guid);
    }

    div.appendChild(collapser);
    div.appendChild(document.createTextNode(value.value === '[[object]]' ? '{' : '['));
    div.appendChild(ellipsis);
    div.appendChild(childUl);
    div.appendChild(document.createTextNode(value.value === '[[object]]' ? '}' : ']'));
    div.className = 'hoverable collapsed';

    if (self.cache.indexOf(value.guid) > -1) {
        self.showChildren(root, childUl);
        div.className = 'hoverable';
    }

    return div;
};

koInspector.Renderer.prototype.drawValue = function (property, value, isLast) {
    var self = this;

    var valueType = typeof value.value;

    var li = self.create('li'),
        div = self.create('div', 'hoverable'),
        span = self.create('span', 'property'),
        valueElement;

    if (!value.isObservable) {
        span.className += ' nonObservable';
    }

    if (value.count && value.count > 0) {
        var countSpan = self.create('span', 'change-counter');
        countSpan.textContent = value.count;
        div.appendChild(countSpan);
    }

    if (value.subscribers && value.subscribers > 0) {
        var subscriberSpan = self.create('span', 'subscriber-counter');
        subscriberSpan.textContent = value.subscribers;
        div.appendChild(subscriberSpan);
    }

    span.textContent = property;

    div.appendChild(span);
    div.appendChild(document.createTextNode(': '));

    if (value.value == null) this.drawSpan(div, "null", "type-null");
    else if (valueType == "object" && value.value.getMonth) this.drawString(div, value.value.toString());
    else if (value.value == "[[object]]" || value.value == "[[array]]") this.drawObject(div, value);
    else if (valueType == "number") this.drawSpan(div, value.value, "type-number");
    else if (valueType == "string") this.drawString(div, value.value);
    else if (valueType == "boolean") this.drawSpan(div, value.value, "type-boolean");
    else if (valueType == "function") this.drawSpan(div, 'function() {…}', "type-callback-function");

    if (!isLast) {
        div.appendChild(document.createTextNode(','));
    }

    li.appendChild(div);

    return li;
};

koInspector.Renderer.prototype.drawSpan = function (div, value, className) {
    var span = this.create('span', className);
    span.textContent = value;
    div.appendChild(span);
};

koInspector.Renderer.prototype.drawString = function (div, value) {
    return this.drawSpan(div, '"' + value + '"', "type-string");
};

koInspector.Renderer.prototype.create = function (name, elementClass) {
    var element = document.createElement(name);

    if (elementClass) {
        element.className = elementClass;
    }

    return element;
};

koInspector.Renderer.prototype.hasClass = function (element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
};