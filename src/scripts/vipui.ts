import { Selector } from "./modules/selector";

class VIPUI {
    version: string = "0.0.1";
    selector: Selector;

    constructor() {
        this.selector = new Selector();

        let lib = new VIPUI(),
            $ = lib.selector.$;
    }
}

export { VIPUI };