import { AbstractManoeuver } from "./abstractManoeuver.js";
import { ActiveEffects } from "../../core/effects.js";
import { Constants } from "../../../module/common/constants.js";

export class Etrange extends AbstractManoeuver {

    static ID = "etrange";

    /**
     * Constructor.
     */
    constructor(action) {
        super(Etrange.ID, Constants.STRIKE, action);
        this.strike = true;
        this.approches = ['lune'];
        this.attack = {modifier: -30};
        this.defense = {modifier: 0};
        this.impact = {modifier: 0};
        this.effect = ActiveEffects.DESORIENTE;
    }

}