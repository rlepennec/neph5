import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Desarmer extends AbstractManoeuver {

    static ID = "desarmer";

    /**
     * Constructor.
     */
    constructor() {
        super(Desarmer.ID, Constants.PARADE);
        this.withApproches(['lune', 'ka']);
        this.withShots(0, -20, -40, -60, -80, -100);
    }

    /**
     * @Override
     */
    canBePerformed(action) {
        const performable = action.attack.manoeuver.family === Constants.STRIKE;
        if (performable === true) {
            this.update(action);
        }
        return performable;
    }

    /**
     * @Override
     */
    update(action) {
        if (action.attack.weapon.system.type === Constants.MELEE && action.weapon == null) {
            this.withDefense({modifier: -80});
        } else {
            this.withDefense({modifier: -40});
        }
        return this;
    }

}