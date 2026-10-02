import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Version } from "../../../module/common/version.js";
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
                return Version.data(action.attack.weapon).type === Constants.NATURELLE || (Version.data(action.attack.weapon).type === Constants.MELEE && Version.data(action.weapon).type === Constants.MELEE);
            default:
                return false;
        }
    }

}