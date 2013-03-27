module('Intial run of compare');

test('object with one child', 4, function() {
	var object = {
		id: 1,
		foo: 'bar'
	};
	
	var comparer = new koInspector.Comparer();
	comparer.compare(object);
	
	equal(comparer.object.id.value, 1);
	equal(comparer.object.id.count, 0);
	equal(comparer.object.foo.value, 'bar');
	equal(comparer.object.foo.count, 0);
});

test('object with one child observable', 4, function() {
	var object = {
		id: 1,
		foo: ko.observable('bar')
	};
	
	var comparer = new koInspector.Comparer();
	comparer.compare(object);
	
	equal(comparer.object.id.value, 1);
	equal(comparer.object.id.isObservable, false);
	equal(comparer.object.foo.value, 'bar');
	equal(comparer.object.foo.isObservable, true);
});

test('object with multiple children', 3, function() {
	var object = {
		foo: { bar: 'test' }
	};
	
	var comparer = new koInspector.Comparer();
	comparer.compare(object);
	
	equal(comparer.object.foo.value.bar.value, 'test');
	equal(comparer.object.foo.value.bar.count, 0);
	equal(comparer.object.foo.value.bar.isObservable, false);
});

test('object with multiple children that is observable', 5, function() {
	var object = {
		foo: ko.observable({ bar: ko.observable('test') })
	};
	
	var comparer = new koInspector.Comparer();
	comparer.compare(object);
	
	equal(comparer.object.foo.count, 0);
	equal(comparer.object.foo.isObservable, true);
	equal(comparer.object.foo.value.bar.value, 'test');
	equal(comparer.object.foo.value.bar.count, 0);
	equal(comparer.object.foo.value.bar.isObservable, true);
});

test('array', 5, function() {
	var object = {
		foo: [ 1, 2, 3 ]
	};
	
	var comparer = new koInspector.Comparer();
	comparer.compare(object);
	
	equal(comparer.object.foo.count, 0);
	equal(comparer.object.foo.isObservable, false);
	equal(comparer.object.foo.value[0].value, 1);
	equal(comparer.object.foo.value[1].value, 2);
	equal(comparer.object.foo.value[2].value, 3);

});

test('array with an observable', 1, function() {
	var object = {
		foo: [ 1, ko.observable(2), 3 ]
	};
	
	var comparer = new koInspector.Comparer();
	comparer.compare(object);
	
	equal(comparer.object.foo.value[1].isObservable, true);
});

test('array of objects', 3, function() {
	var object = {
		foo: [{ bar: 1 }, { bar: 2 }]
	};

	var comparer = new koInspector.Comparer();
	comparer.compare(object);

	equal(comparer.object.foo.value[0].value.bar.value, 1);
	equal(comparer.object.foo.value[0].value.bar.count, 0);
	equal(comparer.object.foo.value[0].value.bar.isObservable, false);
});

test('date', 3, function() {
	var object = {
		foo: new Date()
	};

	var comparer = new koInspector.Comparer();
	comparer.compare(object);

	ok(comparer.object.foo.value.getMonth);
	equal(comparer.object.foo.count, 0);
	equal(comparer.object.foo.isObservable, false);
});

module('after second run of comparer');

test('object with one child', 6, function() {
	var object = {
		id: 1,
		foo: 'bar updated'
	};
	
	var comparer = new koInspector.Comparer();
	comparer.object = {
		id: { value: 1, count: 0, isObservable: false },
		foo: { value: 'bar', count: 0, isObservable: false }
	};
	comparer.compare(object);
	
	equal(comparer.object.id.value, 1);
	equal(comparer.object.id.count, 0);
	equal(comparer.object.id.isObservable, false);	
	equal(comparer.object.foo.value, 'bar updated');
	equal(comparer.object.foo.count, 1);
	equal(comparer.object.foo.isObservable, false);
});

test('object with one child observable', 3, function() {
	var object = {
		foo: ko.observable('bar')
	};
	
	var comparer = new koInspector.Comparer();
	comparer.addDirtyFlags(object);
	comparer.compare(object);
	object.foo('bar updated');
	comparer.compare(object);
	
	equal(comparer.object.foo.value, 'bar updated');
	equal(comparer.object.foo.count, 1);
	equal(comparer.object.foo.isObservable, true);
});

test('object with multiple children', 3, function() {
	var object = {
		foo: { bar: 'test updated' }
	};
	
	var comparer = new koInspector.Comparer();
	comparer.object = {
		foo: { value: { bar: { value: 'test', count: 0, isObservable: false} }, count: 0, isObservable: false }
	};
	comparer.compare(object);
	
	equal(comparer.object.foo.value.bar.value, 'test updated');
	equal(comparer.object.foo.value.bar.count, 1);
	equal(comparer.object.foo.value.bar.isObservable, false);
});

module('dirty flag');

test('dirty flag gets added to observables', function() {
	var object = {
		foo: ko.observable('test'),
		bar: 'test'
	};
	
	var comparer = new koInspector.Comparer();
	comparer.addDirtyFlags(object);
	
	equal(typeof object.foo.isDirty, 'function');
	equal(typeof object.bar.isDirty, 'undefined');	
});

test('dirty flag gets added to child observables', function() {
	var object = {
		foo: ko.observable({ bar: ko.observable('test') })
	};
	
	var comparer = new koInspector.Comparer();
	comparer.addDirtyFlags(object);
	
	equal(typeof object.foo.isDirty, 'function');
	equal(typeof object.foo().bar.isDirty, 'function');	
});

test('observable child counter gets reset when parent is updated', function() {
	var object = {
		foo: ko.observable({ bar: ko.observable('test') })
	};
	
	var comparer = new koInspector.Comparer();
	comparer.compare(object);
	object.foo().bar('test updated');
	comparer.compare(object);

	equal(comparer.object.foo.count, 0);
	equal(comparer.object.foo.value.bar.count, 1);
	
	object.foo({ bar: ko.observable('test updated') });
	comparer.compare(object);
	
	equal(comparer.object.foo.count, 1);
	equal(comparer.object.foo.value.bar.count, 0);
});

test('handles null object', function() {
	var object = {
		foo: null
	};
	
	var comparer = new koInspector.Comparer();
	comparer.compare(object);
	
	equal(comparer.object.foo.count, 0);
	equal(comparer.object.foo.value, null);
	equal(comparer.object.foo.isObservable, false);
});

test('handles function', function() {
	var object = {
		foo: function() { return 'test'}
	};
	
	var comparer = new koInspector.Comparer();
	comparer.compare(object);
	
	equal(comparer.object.foo.count, 0);
	equal(typeof comparer.object.foo.value, 'function');
	equal(comparer.object.foo.isObservable, false);
});

test('handles computed', function() {
	var object = {
		foo: ko.computed(function() { return 'test' })
	};
	
	var comparer = new koInspector.Comparer();
	comparer.compare(object);
	
	equal(comparer.object.foo.count, 0);
	equal(comparer.object.foo.value, 'test');
	equal(comparer.object.foo.isObservable, true);
});

test('handles computed getting updated', function() {

	var bar = ko.observable('test');
	var object = {
		foo: ko.computed(function() { 
			return bar() + 'foo'; 
		})
	};
	
	var comparer = new koInspector.Comparer();
	comparer.compare(object);
	bar('updated')
	comparer.compare(object)
	
	equal(comparer.object.foo.count, 1);
	equal(comparer.object.foo.value, 'updatedfoo');
	equal(comparer.object.foo.isObservable, true);
});

test('observable keeps track of number of subscribers', function() {

	var object = {
		foo: ko.observable('bar')
	};
	
	var comparer = new koInspector.Comparer();
	comparer.compare(object);
	
	equal(comparer.object.foo.subscribers, 1);
});

test('observable keeps track of 1 subscribers', function() {

	var object = {
		foo: ko.observable('bar')
	};
	
	object.foo.subscribe(function() {
		return 'test';
	});
	
	var comparer = new koInspector.Comparer();
	comparer.compare(object);
	
	equal(comparer.object.foo.subscribers, 2);
});

test('observable keeps track of 2 subscribers', function() {

	var object = {
		foo: ko.observable('bar')
	};
	
	object.foo.subscribe(function() {
		return 'test';
	});
	
	object.foo.subscribe(function() {
		return 'test';
	});
	
	var comparer = new koInspector.Comparer();
	comparer.compare(object);
	
	equal(comparer.object.foo.subscribers, 3);
});

test('observable keeps track of 2 subscribers', function() {

	var object = {
		foo: ko.observable('bar')
	};
	
	object.foo.subscribe(function() {
		return 'test';
	});
	
	var comparer = new koInspector.Comparer();
	comparer.compare(object);
	
	object.foo.subscribe(function() {
		return 'test 2';
	});
	
	comparer.compare(object);
	
	equal(comparer.object.foo.subscribers, 3);
});





// Check adding a new object
// Check deleting an object


