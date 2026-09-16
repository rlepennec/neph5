import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Eviter extends AbstractManoeuver {

    static ID = "eviter";

    /**
     * Constructor.
     */
    constructor() {
        super(Eviter.ID, Constants.DODGE);
        this.withApproches(['ka']);
        this.withNextDefenseModifier(-20);
        this.withAbsorption({modifier: 1});
    }

    /**
     * @Override
     */
    canBePerformed(action) {
        if (this.exclusiveDefensePlayed(action)) return false;
        return action.attack.manoeuver.family !== Constants.FIRE &&
               action.actor.isEsquiveAvailable;
    }

}