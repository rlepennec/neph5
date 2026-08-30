import { AbstractManoeuver } from "./abstractManoeuver.js";
import { ActiveEffects } from "../../core/effects.js";
import { Constants } from "../../../module/common/constants.js";

export class Etrange extends AbstractManoeuver {

    static ID = "etrange";

    /**
     * Constructor.
     */
    constructor() {
        super(Etrange.ID, Constants.STRIKE);
        this.withApproches(['lune']);
        this.withAttack({modifier: -30});
        this.withDefense({modifier: 0});
        this.withImpact({modifier: 0});
        this.withEffect(ActiveEffects.DESORIENTE);
    }

}