import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Force extends AbstractManoeuver {

    static ID = "force";

    /**
     * Constructor.
     */
    constructor() {
        super(Force.ID, Constants.STRIKE);
        this.withAdvanced(true);
        this.withApproches(['feu','terre']);
        this.withAttack({modifier: 30});
        this.withDefense({modifier: 0});
        this.withImpact({modifier: 0});
        this.withNoDefense();
    }

}