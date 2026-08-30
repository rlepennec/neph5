import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Bloquer extends AbstractManoeuver {

    static ID = "bloquer";

    /**
     * Constructor.
     */
    constructor() {
        super(Bloquer.ID, Constants.PARADE);
        this.withApproches(['terre', 'ka']);
        this.withShots(0, -20, -40, -60, -80, -100);
        this.withAbsorption({modifier: 2});
    }

    /**
     * @Override
     */
    canBePerformed(action) {
        switch (action.attack.manoeuver.family) {
            case Constants.BRAWL:
                return true;
            case Constants.STRIKE:
                return action.attack.weapon?.system?.type === Constants.NATURELLE || (action.attack.weapon?.system?.type === Constants.MELEE && action.weapon?.system?.type === Constants.MELEE);
            default:
                return false;
        }
    }

}