import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Bloquer extends AbstractManoeuver {

    static ID = "bloquer";

    /**
     * Constructor.
     */
    constructor(action) {
        super(Bloquer.ID, Constants.PARADE, action);
        this.approches = ['terre', 'ka'];
        this.nextDefenseModifier = -20;
        this.absorption = {modifier: 2};
    }

    /**
     * @Override
     */
    defenseSentenceOf(winner) {
        return this.defenseSentence(winner);
    }

    /**
     * @Override
     */
    canBePerformed(action) {
        if (this.exclusiveDefensePlayed(action)) return false;
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