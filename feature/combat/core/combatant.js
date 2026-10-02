import { Constants } from "../../../module/common/constants.js";
import { Version } from "../../../module/common/version.js";

export class NephilimCombatant extends Combatant {

    /**
     * @override
     */
    _getInitiativeFormula() {
        if (!this.actor) return "1d6";
        let malus = this.actor.getWoundsModifier(Constants.PHYSICAL) / 10;
        let bonus = Version.data(this.actor).bonus.initiative;
        let base = this.actor.initiative;
        return "1d6" + 
            (malus === 0 ? "" : malus.toString()) +
            (bonus === 0 ? "" : "+" + bonus.toString()) +
            (base === 0 ? "" : "+" + base.toString());
    }

}