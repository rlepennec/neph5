import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Fuir extends AbstractManoeuver {

    static ID = "fuir";

    /**
     * Constructor.
     */
    constructor() {
        super(Fuir.ID, Constants.DODGE);
        this.withAdvanced(false);
        this.withApproches(['air','eau','lune', 'ka']);
        this.withNoTarget();
        this.withNoDefense();
        this.withAbsorption({fix: 0});
    }

    /**
     * @Override
     */
    canBePerformed(action) {
        return action.attack.manoeuver.family !== Constants.FIRE &&
               action.actor.isEsquiveAvailable;
    }

}