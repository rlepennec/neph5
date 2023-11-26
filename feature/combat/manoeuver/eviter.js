import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Eviter extends AbstractManoeuver {

    static ID = "eviter";

    /**
     * Constructor.
     */
    constructor() {
        super(Eviter.ID, Constants.DODGE);
        this.withAdvanced(true);
        this.withApproches(['ka']);
        this.withShots(0, -20, -40, -60, -80, -100);
        this.withAbsorption({modifier: 1});
    }

    /**
     * @Override
     */
    canBePerformed(action) {
        return action.attack.manoeuver.family !== Constants.FIRE &&
               action.actor.isEsquiveAvailable;
    }

}