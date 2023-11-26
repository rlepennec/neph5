import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Puissante extends AbstractManoeuver {

    static ID = "puissante";

    /**
     * Constructor.
     */
    constructor() {
        super(Puissante.ID, Constants.STRIKE);
        this.withAdvanced(true);
        this.withApproches(['feu','terre']);
        this.withAttack({modifier: -20});
        this.withDefense({modifier: 0});
        this.withImpact({modifier: 2});
    }

}