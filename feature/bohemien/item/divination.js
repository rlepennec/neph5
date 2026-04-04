import { NephilimItemSheet } from "../../../module/item/base.js";

export class DivinationSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 560,
            height: 600
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/bohemien/item/divination.html`,
        }
    }

    /** 
     * @override
     */
    getOriginalData() {
        return {
            cercles: super.cerclesOf('bohemien')
        }
    }

}