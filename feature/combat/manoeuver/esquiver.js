import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Esquiver extends AbstractManoeuver {

    static ID = "esquiver";

    /**
     * Constructor.
     */
    constructor() {
        super(Esquiver.ID, Constants.DODGE);
        this.withApproches(['air','eau', 'ka']);
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