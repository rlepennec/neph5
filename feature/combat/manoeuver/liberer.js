import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";
import { Controler } from "./controler.js";

export class Liberer extends AbstractManoeuver {

    static ID = "liberer";

    /**
     * Constructor.
     */
    constructor(action) {
        super(Liberer.ID, Constants.BRAWL, action);
        this.approches = ['eau','feu', 'ka'];
        this.immobilized = true;
        this.skill = Constants.BRAWL;
        // Se dégager d'une prise ne s'esquive ni ne se pare : celui qui tient resserre sa
        // prise, ou la perd.
        this.onlyDefense = Controler.ID;
    }

    /**
     * @Override
     */
    isAllowed(action) {
        return action.actor.immobilise;
    }

}