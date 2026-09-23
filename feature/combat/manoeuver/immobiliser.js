import { AbstractManoeuver } from "./abstractManoeuver.js";
import { ActiveEffects } from "../../core/effects.js";
import { Constants } from "../../../module/common/constants.js";

export class Immobiliser extends AbstractManoeuver {

    static ID = "immobiliser";

    /**
     * Constructor.
     */
    constructor(action) {
        super(Immobiliser.ID, Constants.BRAWL, action);
        this.approches = ['eau','terre', 'ka'];
        this.impact = {fix: 1};
        this.effect = ActiveEffects.IMMOBILISE;
        this.holds = true;
    }

    /**
     * @Override
     */
    isAllowed(action) {
        return !action.actor.immobilise;
    }
}