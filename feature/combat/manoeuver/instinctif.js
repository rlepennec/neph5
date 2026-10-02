import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Version } from "../../../module/common/version.js";
import { Constants } from "../../../module/common/constants.js";

export class Instinctif extends AbstractManoeuver {

    static ID = "instinctif";

    /**
     * Constructor.
     */
    constructor(action) {
        super(Instinctif.ID, Constants.FIRE, action);
        this.approches = ['feu'];
        this.impact = {modifier: 0};
    }

    /**
     * @Override
     */
    isAllowed(action) {
        return Version.data(action.weapon).type === 'trait' ||
              (Version.data(action.weapon).munitions > Version.data(action.weapon).tire);
    }

}