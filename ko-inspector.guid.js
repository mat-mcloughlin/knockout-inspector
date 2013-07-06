if (typeof koInspector == 'undefined') {
    koInspector = {};
}

koInspector.guid = {
    s4: function () {
        return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    },

    create: function () {
        return koInspector.guid.s4() + koInspector.guid.s4() + '-' + koInspector.guid.s4() + '-' + koInspector.guid.s4() + '-' +
        koInspector.guid.s4() + '-' + koInspector.guid.s4() + koInspector.guid.s4() + koInspector.guid.s4();
    }
};