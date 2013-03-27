if (typeof koInspector == 'undefined') {
	koInspector = {};
}

koInspector.Comparer = function() {
	var storedObject = {},

	addDirtyFlags = function(newObject) {
		for (p in newObject) {
			if (ko.isObservable(newObject[p])) {

				if (typeof newObject[p].isDirty === 'undefined') {
					newObject[p].isDirty = new koInspector.DirtyFlag(newObject[p]);
				}
			}

			var unwrapped = ko.utils.unwrapObservable(newObject[p]);
			if (isObject(unwrapped)) {
				addDirtyFlags(unwrapped);
			}

		}
	},

	isObject = function(object) {
		return object && typeof object === 'object' && typeof object.getMonth === 'undefined'
	},

	resetDirtyFlag = function(object) {
		object.isDirty(false);
	},

	compare = function(newObject) {
		addDirtyFlags(ko.utils.unwrapObservable(newObject));
		recurse(ko.utils.unwrapObservable(newObject), this.object);
	},

	recurse = function(newObject, object) {
		for (p in newObject) {

			if (ko.isObservable(newObject[p])) {
				var unwrapped = ko.utils.unwrapObservable(newObject[p]);

				if (object[p]) { // observable object 
					if (isObject(object[p].value)) {
						if (newObject[p].isDirty()) {
							resetDirtyFlag(newObject[p]);
							object[p].count++;
							object[p].value = {};
						}
						recurse(unwrapped, object[p].value)
					} else {
						if (newObject[p].isDirty()) {
							resetDirtyFlag(newObject[p]);
							object[p].count++;
							object[p].value = unwrapped;
							object[p].isObservable = true;
						}
					}
					if (object[p]) {
						object[p].subscribers = ko.isObservable(newObject[p]) ? newObject[p].getSubscriptionsCount() : 0;	
					}
				} else {
					var unwrapped = ko.utils.unwrapObservable(newObject[p]);
					parseObject(unwrapped, newObject, object, p);
				}
			} else { // normal object				
				if (object[p]) {
					updateObject(newObject[p], newObject, object, p);
				} else {
					parseObject(newObject[p], newObject, object, p);
				}
			}
		}
	},
	
	updateObject = function(unwrapped, newObject, object, p) {
		if (isObject(object[p].value)) {
			recurse(newObject[p], object[p].value)
		} else {
			if (object[p].value !== newObject[p]) {
				object[p].count++;
				object[p].value = newObject[p];
				object[p].isObservable = false;
			}
		}
	},

	parseObject = function(unwrapped, newObject, object, p) {
		if (isObject(unwrapped)) {
			object[p] = {
				value: {},
				count: 0,
				isObservable: ko.isObservable(newObject[p]),
				subscribers: ko.isObservable(newObject[p]) ? newObject[p].getSubscriptionsCount() : 0,
				guid: koInspector.guid.create()
			};
			recurse(unwrapped, object[p].value);
		} else {
			object[p] = {
				value: unwrapped,
				count: 0,
				isObservable: ko.isObservable(newObject[p]),
				subscribers: ko.isObservable(newObject[p]) ? newObject[p].getSubscriptionsCount() : 0,
			}
		};
	};

	return {
		compare: compare,
		object: storedObject,
		addDirtyFlags: addDirtyFlags
	};
};
