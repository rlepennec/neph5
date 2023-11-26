import { AbstractManoeuver } from "./abstractManoeuver.js";
import { ActiveEffects } from "../../core/effects.js";
import { Constants } from "../../../module/common/constants.js";

export class Immobiliser extends AbstractManoeuver {

    static ID = "immobiliser";

    /**
     * Constructor.
     */
    constructor() {
        super(Immobiliser.ID, Constants.BRAWL);
        this.withAdvanced(false);
        this.withApproches(['eau','terre', 'ka']);
        this.withImpact({fix: 1});
        this.withEffect(ActiveEffects.IMMOBILISE);
    }

    /**
     * @Override
     */
    canBePerformed(action) {
        return !action.actor.immobilise;
    }
}