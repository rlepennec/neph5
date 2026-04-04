import { Game } from "../../../module/common/game.js";
import { NephilimItemSheet } from "../../../module/item/base.js";

export class InvocationSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 560,
            height: 500
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/kabbale/item/invocation.html`,
        }
    }

    /** 
     * @override
     */
    getOriginalData() {
        return {
            elements: Game.kabbale.elements,
            cercles: super.cerclesOf('kabbale'),
            mondes: Game.kabbale.mondes,
            sephiroth: Game.kabbale.sephiroth
        }
    }

}