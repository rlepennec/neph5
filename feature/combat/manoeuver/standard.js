import { AbstractManoeuver } from "./abstractManoeuver.js";
import { Constants } from "../../../module/common/constants.js";

export class Standard extends AbstractManoeuver {

    static ID = "standard";

    /**
     * Constructor.
     */
    constructor() {
        super(Standard.ID, Constants.STRIKE);
        this.withAdvanced(false);
        this.withApproches(this.customApproches);
        this.withAttack({modifier: 0});
        this.withDefense({modifier: 0});
        this.withImpact({modifier: 0});
    }

    get customApproches() {
        return game.settings.get('neph5e', 'useCombatSystem') === 'normal' ? ['ka'] : ['eau', 'feu', 'ka'];
    }

}