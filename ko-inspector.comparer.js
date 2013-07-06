if (typeof koInspector == 'undefined') {
    koInspector = {};
}

koInspector.Comparer = function () {
    this.storedObject = {};
    this.cache = [];
    this.dirtyFlagCache = [];

    return this;
};

koInspector.Comparer.prototype.addDirtyFlags = function (newObject) {
    for (p in newObject) {
        if (ko.isObservable(newObject[p])) {

            if (typeof newObject[p].isDirty === 'undefined') {
                newObject[p].isDirty = new koInspector.DirtyFlag(newObject[p]);
            }
        }

        var unwrapped = ko.utils.unwrapObservable(newObject[p]);
        if (this.isObject(unwrapped)) {
            if (this.cycleReplacer(unwrapped, this.dirtyFlagCache)) {
               break;
            }
            this.addDirtyFlags(unwrapped);
        }

    }
};

koInspector.Comparer.prototype.isObject = function (object) {
    return object && typeof object === 'object' && typeof object.getMonth === 'undefined'
};

koInspector.Comparer.prototype.resetDirtyFlag = function (object) {
    object.isDirty(false);
};

koInspector.Comparer.prototype.compare = function (newObject) {
    this.addDirtyFlags(ko.utils.unwrapObservable(newObject));
    this.recurse(ko.utils.unwrapObservable(newObject), this.storedObject);
};

koInspector.Comparer.prototype.recurse = function (newObject, object) {
    for (p in newObject) {

        if (ko.isObservable(newObject[p])) { // observable object 
            var unwrapped = ko.utils.unwrapObservable(newObject[p]);

            if (object[p]) { // object is old
                this.updateObservable(unwrapped, newObject, object, p);
            } else { // object is new
                this.parseObject(unwrapped, newObject, object, p);
            }
        } else { // normal object
            if (object[p]) {
                this.updateObject(newObject[p], newObject, object, p);
            } else {
                this.parseObject(newObject[p], newObject, object, p);
            }
        }
    }
};

koInspector.Comparer.prototype.updateObservable = function (unwrapped, newObject, object, p) {
    if (this.isObject(object[p].value)) {
        if (newObject[p].isDirty()) {
            this.resetDirtyFlag(newObject[p]);
            object[p].count++;
            object[p].value = {};
        }
        this.recurse(unwrapped, object[p].value)
    } else {
        if (newObject[p].isDirty()) {
            this.resetDirtyFlag(newObject[p]);
            object[p].count++;
            object[p].value = unwrapped;
            object[p].isObservable = true;
        }
    }
    if (object[p]) {
        object[p].subscribers = ko.isObservable(newObject[p]) ? newObject[p].getSubscriptionsCount() : 0;
    }
};

koInspector.Comparer.prototype.updateObject = function (unwrapped, newObject, object, p) {
    if (this.isObject(object[p].value)) {
        this.recurse(newObject[p], object[p].value)
    } else {
        if (object[p].value !== newObject[p]) {
            object[p].count++;
            object[p].value = newObject[p];
            object[p].isObservable = false;
        }
    }
};

koInspector.Comparer.prototype.parseObject = function (unwrapped, newObject, object, p) {

    if (this.isObject(unwrapped)) {
        if (this.cycleReplacer(unwrapped, this.cache)) {
           return;
        }
        object[p] = {
            value: {},
            count: 0,
            isObservable: ko.isObservable(newObject[p]),
            subscribers: ko.isObservable(newObject[p]) ? newObject[p].getSubscriptionsCount() : 0,
            guid: koInspector.guid.create()
        };
        this.recurse(unwrapped, object[p].value);
    } else {
        object[p] = {
            value: unwrapped,
            count: 0,
            isObservable: ko.isObservable(newObject[p]),
            subscribers: ko.isObservable(newObject[p]) ? newObject[p].getSubscriptionsCount() : 0,
        }
    };
};

koInspector.Comparer.prototype.cycleReplacer = function (object, cache) {
    if (typeof object === 'object' && object !== null) {
        if (cache.indexOf(object) !== -1) {
            return true;
        }
        cache.push(object);
        return false;
    }
};