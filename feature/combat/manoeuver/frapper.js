import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Frapper extends AbstractManoeuver {

    static ID = "frapper";

    /**
     * Constructor.
     */
    constructor() {
        super(Frapper.ID, Constants.BRAWL);
        this.withAdvanced(false);
        this.withApproches(['eau','feu', 'ka']);
        this.withImpact({modifier: 0});
    }

}