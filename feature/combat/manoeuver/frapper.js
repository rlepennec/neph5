import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Frapper extends AbstractManoeuver {

    static ID = "frapper";

    /**
     * Constructor.
     */
    constructor(action) {
        super(Frapper.ID, Constants.BRAWL, action);
        this.strike = true;
        this.approches = ['eau','feu', 'ka'];
        this.impact = {modifier: 0};
    }

}