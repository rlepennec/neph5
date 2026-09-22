import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Puissante extends AbstractManoeuver {

    static ID = "puissante";

    /**
     * Constructor.
     */
    constructor(action) {
        super(Puissante.ID, Constants.STRIKE, action);
        this.strike = true;
        this.approches = ['feu','terre'];
        this.attack = {modifier: -20};
        this.defense = {modifier: 0};
        this.impact = {modifier: 2};
    }

}