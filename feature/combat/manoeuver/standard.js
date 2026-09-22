import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Standard extends AbstractManoeuver {

    static ID = "standard";

    /**
     * Constructor.
     */
    constructor(action) {
        super(Standard.ID, Constants.STRIKE, action);
        this.strike = true;
        this.approches = ['ka'];
        this.attack = {modifier: 0};
        this.defense = {modifier: 0};
        this.impact = {modifier: 0};
    }

}