import { AbstractManoeuver } from "./abstractManoeuver.js";
import { ActiveEffects } from "../../core/effects.js";
import { Constants } from "../../../module/common/constants.js";

export class Projeter extends AbstractManoeuver {

    static ID = "projeter";

    /**
     * Constructor.
     */
    constructor() {
        super(Projeter.ID, Constants.BRAWL);
        this.withApproches(['feu','terre', 'ka']);
        this.withImpact({fix: 1});
        this.withEffect(ActiveEffects.PROJETE);
    }

    /**
     * @Override
     */
    canBePerformed(action) {
        return !action.actor.immobilise;
    }

}