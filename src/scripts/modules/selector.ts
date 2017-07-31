class Selector {

    constructor() {

    }

    $(selectorString: string): any {
        let self = this;
        let selectorSymbols = {},
            selector: string,
            indexChart: string = selectorString.substr(0, 1);

        if (!document.querySelector) {
            selectorSymbols = {
                ".": "getElementsByClassName",
                "#": "getElementById"
            };
            selector = selectorString.substr(1);
        } else {
            selectorSymbols = {
                ".": "querySelectorAll",
                "#": "querySelector"
            };
            selector = selectorString;
        }

        let fetcher = selectorSymbols[indexChart];

        return document[fetcher](selector);
    }
}

export { Selector };