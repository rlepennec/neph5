import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Standard extends AbstractManoeuver {

    static ID = "standard";

    /**
     * Constructor.
     */
    constructor() {
        super(Standard.ID, Constants.STRIKE);
        this.withApproches(['ka']);
        this.withAttack({modifier: 0});
        this.withDefense({modifier: 0});
        this.withImpact({modifier: 0});
    }

}