import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Subtile extends AbstractManoeuver {

    static ID = "subtile";

    /**
     * Constructor.
     */
    constructor(action) {
        super(Subtile.ID, Constants.STRIKE, action);
        this.strike = true;
        this.approches = ['air','eau'];
        this.attack = {modifier: -20};
        this.defense = {modifier: -40};
        this.impact = {modifier: 0};
    }

}