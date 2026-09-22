import { AbstractManoeuver } from "./abstractManoeuver.js";
import { ActiveEffects } from "../../core/effects.js";
import { Constants } from "../../../module/common/constants.js";

export class Projeter extends AbstractManoeuver {

    static ID = "projeter";

    /**
     * Constructor.
     */
    constructor(action) {
        super(Projeter.ID, Constants.BRAWL, action);
        this.approches = ['feu','terre', 'ka'];
        this.impact = {fix: 1};
        this.effect = ActiveEffects.PROJETE;
    }

    /**
     * @Override
     */
    isAllowed(action) {
        return !action.actor.immobilise;
    }

}