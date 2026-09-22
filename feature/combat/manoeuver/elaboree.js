import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Elaboree extends AbstractManoeuver {

    static ID = "elaboree";

    /**
     * Constructor.
     */
    constructor(action) {
        super(Elaboree.ID, Constants.PARADE, action);
        this.approches = ['air','eau', 'ka'];
        this.nextDefenseModifier = 0;
        this.noAttack = true;
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