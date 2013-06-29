// TODO: 
// handle urls.
// set state when opened. by checking the list of guids.
// Make them hoverable.
var Tree = function (object, objectName, container) {
    this.originalObject = object;
    this.objectName = objectName;
    this.container = container;
    this.treeObject;
};

/* This function goes through the object and flattens out an arrays or objects. This
/* is so it can be used as a lookup when building out the tree */
Tree.prototype.prepareObject = function () {
    this.treeObject = {};
    recurseObject('root', this.treeObject, this.originalObject);
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
                } else if (typeof object[property].value === 'object' && object[property].value.getMonth === undefined) {
                    recurseObject(object[property].guid, returnObject, object[property].value)
                    returnObject[name][property].value = '[[object]]';
                }

            }
        }
        return returnObject;
    };
};

Tree.prototype.prepareContainer = function () {
    var id = 'ko-inspector-' + koInspector.guid.create();

    container.setAttribute('class', 'ko-inspector');
    container.id = id;

    return id;
};

Tree.prototype.drawRoot = function () {
    var self = this,
        root = self.treeObject.root,
        ul = self.create('ul', 'collapsible'),
        li = self.create('li'),
        div = self.create('div', 'hoverable collapsed'),
        span = self.create('span', 'property'),
        collapser = self.create('div', 'collapser'),
        ellipsis = self.create('span', 'ellipsis'),
        childUl = self.create('ul', 'collapsible');

    self.prepareContainer();

    span.innerText = self.objectName;

    collapser.onclick = function () {
        self.collapserClick.call(self, root, div, childUl);
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
};

Tree.prototype.collapserClick = function (root, div, childUl) {
    var self = this;

    if (self.hasClass(div, 'collapsed')) {
        if (childUl.innerHTML === '') {
            var keys = Object.keys(root);
            for (i = 0, length = keys.length; i < length; i++) {
                var key = keys[i],
                    isLast = i === length - 1;

                childUl.appendChild(self.drawValue(key, root[key], isLast));
            }
        }
        div.className = 'hoverable';
    } else {
        div.className = 'hoverable collapsed';
    }
};

Tree.prototype.drawObject = function (div, value) {
    /* In hear depending on wether the guid is in the state show it or hide it.*/

    var self = this,
        root = self.treeObject[value.guid],
        collapser = self.create('div', 'collapser'),
        ellipsis = self.create('span', 'ellipsis'),
        childUl = self.create('ul', 'collapsible'); // maybe add in object type here to?

    collapser.onclick = function () {
        self.collapserClick.call(self, root, div, childUl);
    }

    div.appendChild(collapser);
    div.appendChild(document.createTextNode(value.value === '[[object]]' ? '{' : '['));
    div.appendChild(ellipsis);
    div.appendChild(childUl);
    div.appendChild(document.createTextNode(value.value === '[[object]]' ? '}' : ']'));
    div.className = 'hoverable collapsed';

    return div;
};

Tree.prototype.drawValue = function (property, value, isLast) {
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
        console.log('in');
        var countSpan = self.create('span', 'change-counter');
        countSpan.innerText = value.count;
        div.appendChild(countSpan);
    }

    if (value.subscribers && value.subscribers > 0) {
        console.log('in');
        var subscriberSpan = self.create('span', 'subscriber-counter');
        subscriberSpan.innerText = value.subscribers;
        div.appendChild(subscriberSpan);
    }

    span.innerText = property;

    div.appendChild(span);
    div.appendChild(document.createTextNode(': '));

    if (value.value == null) this.drawSpan(div, "null", "type-null");
    else if (valueType == "object" && value.value.getMonth) this.drawString(div, value.value.toString());
    else if (value.value == "[[object]]" || value.value == "[[array]]") this.drawObject(div, value);
    else if (valueType == "number") this.drawSpan(div, value.value, "type-number");
    else if (valueType == "string") this.drawString(div, value.value);
    else if (valueType == "boolean") this.drawSpan(div, value.value, "type-boolean");
    else if (valueType == "function") this.drawSpan('function() {  }', "type-callback-function");

    if (!isLast) {
        div.appendChild(document.createTextNode(','));
    }

    li.appendChild(div);

    return li;
};

Tree.prototype.drawSpan = function (div, value, className) {
    var span = this.create('span', className);
    span.innerText = value;
    div.appendChild(span);
};

Tree.prototype.drawString = function (div, value) {
    return this.drawSpan(div, '"' + value + '"', "type-string");
};

Tree.prototype.create = function (name, elementClass) {
    var element = document.createElement(name);

    if (elementClass) {
        element.className = elementClass;
    }

    return element;
};

Tree.prototype.hasClass = function (element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
};