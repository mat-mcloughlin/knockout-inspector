if (typeof jsonViewer == 'undefined') {
  jsonViewer = {};
}

jsonViewer.DirtyFlag = function(root) {
	var isDirty = ko.observable(false);
	
    root.subscribe(function() {
        if (!isDirty()) {
            isDirty(true);
        }
    });

    return isDirty;
};