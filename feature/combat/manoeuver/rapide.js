import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Rapide extends AbstractManoeuver {

    static ID = "rapide";

    /**
     * Constructor.
     */
    constructor() {
        super(Rapide.ID, Constants.STRIKE);
        this.withApproches(['air','eau']);
        this.withTimes({modifier: 2});
        this.withAttack({modifier: -20});
        this.withDefense({modifier: 0});
        this.withImpact({modifier: 0});
        this.withNoDefense();
    }

}