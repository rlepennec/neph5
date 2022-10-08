import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Projeter extends AbstractManoeuver {

    static ID = "projeter";

    /**
     * Constructor.
     */
    constructor() {
        super(Projeter.ID, Constants.BRAWL);
        this.withApproches(['feu','terre', 'ka']);
        this.withImpact({modifier: 0});
    }

    /**
     * @Override
     */
    canBePerformed(action) {
        return !action.actor.immobilise;
    }

}