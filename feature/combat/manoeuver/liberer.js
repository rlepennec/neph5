import { AbstractManoeuver } from "./abstractManoeuver.js";
import { ActiveEffects } from "../../core/effects.js";
import { Constants } from "../../../module/common/constants.js";

export class Liberer extends AbstractManoeuver {

    static ID = "liberer";

    /**
     * Constructor.
     */
    constructor() {
        super(Liberer.ID, Constants.BRAWL);
        this.withApproches(['eau','feu', 'ka']);
        this.whithImmobilized();
        this.withFamilly(Constants.BRAWL);
        this.withEffect(ActiveEffects.LIBERE);
    }

    /**
     * @Override
     */
    canBePerformed(action) {
        return action.actor.immobilise;
    }

}