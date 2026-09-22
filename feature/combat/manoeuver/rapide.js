import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Rapide extends AbstractManoeuver {

    static ID = "rapide";

    /**
     * Constructor.
     */
    constructor(action) {
        super(Rapide.ID, Constants.STRIKE, action);
        this.strike = true;
        this.approches = ['air','eau'];
        this.times = 2;
        this.attack = {modifier: -20};
        this.defense = {modifier: 0};
        this.impact = {modifier: 0};
        this.noDefense = true;
    }

}