import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class EsquiverLance extends AbstractManoeuver {

    static ID = "esquiverLance";

    /**
     * Constructor.
     */
    constructor() {
        super(EsquiverLance.ID, Constants.DODGE);
        this.withApproches(['eau', 'ka']);
    }

    /**
     * @Override
     */
    canBePerformed(action) {
        return action.actor.isEsquiveAvailable &&
               action.attack.manoeuver.family === Constants.THROW;
    }

}