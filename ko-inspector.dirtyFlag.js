if (typeof koInspector == 'undefined') {
    koInspector = {};
}

koInspector.DirtyFlag = function (root) {
    var isDirty = ko.observable(false);

    root.subscribe(function () {
        if (!isDirty()) {
            isDirty(true);
        }
    });

    return isDirty;
};