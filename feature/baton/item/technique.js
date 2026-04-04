import { NephilimItemSheet } from "../../../module/item/base.js";

export class TechniqueSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 560,
            height: 600
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/baton/item/technique.html`,
        }
    }

    /** 
     * @override
     */
    getOriginalData() {
        return {
            cercles: super.cerclesOf('baton')
        }
    }

}