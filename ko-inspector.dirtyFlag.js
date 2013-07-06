if (typeof koInspector == 'undefined') {
    koInspector = {};
}

koInspector.DirtyFlag = function (root) {
    var _isDirty = false;
    var isDirty = function (value) {
        if (value !== undefined) {
            _isDirty = value
        }
        return _isDirty;
    };

    root.subscribe(function () {
        if (!isDirty()) {
            isDirty(true);
        }
    });

    return isDirty;
};