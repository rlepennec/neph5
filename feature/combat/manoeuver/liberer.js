import { AbstractManoeuver } from "./abstractManoeuver.js";
import { ActiveEffects } from "../../core/effects.js";
import { Constants } from "../../../module/common/constants.js";

export class Liberer extends AbstractManoeuver {

    static ID = "liberer";

    /**
     * Constructor.
     */
    constructor(action) {
        super(Liberer.ID, Constants.BRAWL, action);
        this.approches = ['eau','feu', 'ka'];
        this.immobilized = true;
        this.skill = Constants.BRAWL;
        this.effect = ActiveEffects.LIBERE;
    }

    /**
     * @Override
     */
    isAllowed(action) {
        return action.actor.immobilise;
    }

}