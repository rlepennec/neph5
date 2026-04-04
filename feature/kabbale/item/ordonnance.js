import { NephilimItemSheet } from "../../../module/item/base.js";
import { Game } from "../../../module/common/game.js";

export class OrdonnanceSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 560,
            height: 500
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/kabbale/item/ordonnance.html`,
        }
    }

    /** 
     * @override
     */
    getOriginalData() {
        return {
            mondes: Game.kabbale.mondes
        }
    }

}