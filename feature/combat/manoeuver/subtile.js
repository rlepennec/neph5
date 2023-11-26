import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Subtile extends AbstractManoeuver {

    static ID = "subtile";

    /**
     * Constructor.
     */
    constructor() {
        super(Subtile.ID, Constants.STRIKE);
        this.withAdvanced(true);
        this.withApproches(['air','eau']);
        this.withAttack({modifier: -20});
        this.withDefense({modifier: -40});
        this.withImpact({modifier: 0});
    }

}