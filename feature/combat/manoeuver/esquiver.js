import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Esquiver extends AbstractManoeuver {

    static ID = "esquiver";

    /**
     * Constructor.
     */
    constructor() {
        super(Esquiver.ID, Constants.DODGE);
        this.withAdvanced(false);
        this.withApproches(['air','eau', 'ka']);
        this.withShots(0, -20, -40, -60, -80, -100);
        this.withAbsorption({fix: 0});
    }

    /**
     * @Override
     */
    canBePerformed(action) {
        return action.attack.manoeuver.family !== Constants.FIRE &&
               action.attack.manoeuver.family !== Constants.THROW &&
               action.actor.isEsquiveAvailable;
    }

}