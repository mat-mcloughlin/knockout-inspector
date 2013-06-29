var testViewModel = ko.observable({
    doIt: function () {
        this.parent({ child: ko.observable('the') });
        return false;
    },
    errorId: ko.observable(1),
    testZero: ko.observable(0),
    errorMessage: ko.computed(function () { return 'testing'; }),
    test: ko.observable({ foo: { bar: ko.observable('test') } }),
    parent: ko.observable({ child: ko.observable('test') }),
    items: ko.observableArray([
    {
        id: 1,
        name: ko.observable("Turton Brewery Gas"),
        endDate: ko.observable(new Date("2016-03-31T00:00:00.000Z")),
        isTradable: true,
        startDate: "2013-04-01T00:00:00.000Z",
        supplier: {
            id: 269,
            name: "TOTAL GAS & POWER"
        },
        customer: {
            id: 1,
            name: "2gether NHS Foundation Trust"
        },
        utilityCategory: {
            id: 2,
            name: "Natural Gas ",
            calendar: null
        }
    },
    {
        id: 2,
        name: "McLoughlin Facial Hair Removal",
        endDate: "2016-03-31T00:00:00.000Z",
        isTradable: true,
        startDate: "2013-04-01T00:00:00.000Z",
        supplier: {
            id: 140,
            name: "EDF ENERGY"
        },
        customer: {
            id: 5,
            name: "Airedale NHS Trust"
        },
        utilityCategory: {
            id: 1,
            name: "Electricity ",
            calendar: null
        }
    }
    ])
});