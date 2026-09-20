import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Elaboree extends AbstractManoeuver {

    static ID = "elaboree";

    /**
     * Constructor.
     */
    constructor() {
        super(Elaboree.ID, Constants.PARADE);
        this.withApproches(['air','eau', 'ka']);
        this.withNextDefenseModifier(0);
        this.withNoAttack();
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
        const history = action.history ?? [];
        if (history.some(e => e.manoeuver !== this.id)) {
            return false;
        }
        return action.attack.manoeuver.family === Constants.STRIKE ||
              (action.attack.manoeuver.family === Constants.BRAWL);
    }

}