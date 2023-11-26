import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Elaboree extends AbstractManoeuver {

    static ID = "elaboree";

    /**
     * Constructor.
     */
    constructor() {
        super(Elaboree.ID, Constants.PARADE);
        this.withAdvanced(true);
        this.withApproches(['air','eau', 'ka']);
        this.withNoAttack();
    }

    /**
     * @Override
     */
    canBePerformed(action) {
        return action.attack.manoeuver.family === Constants.STRIKE ||
              (action.attack.manoeuver.family === Constants.BRAWL);
    }

}