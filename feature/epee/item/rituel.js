import { NephilimItemSheet } from "../../../module/item/base.js";

export class RituelSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 560,
            height: 500
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/epee/item/rituel.html`,
        }
    }

    /** 
     * @override
     */
    getOriginalData() {
        return {
            cercles: super.cerclesOf('epee')
        }
    }

}