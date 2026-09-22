import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Force extends AbstractManoeuver {

    static ID = "force";

    /**
     * Constructor.
     */
    constructor(action) {
        super(Force.ID, Constants.STRIKE, action);
        this.strike = true;
        this.approches = ['feu','terre'];
        this.attack = {modifier: 30};
        this.defense = {modifier: 0};
        this.impact = {modifier: 0};
        this.noDefense = true;
    }

}