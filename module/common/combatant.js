import { Status } from "../combat/data/status.js";

export class NephilimCombatant extends Combatant {

    /**
     * @override
     */
    async _onCreate(data,options,user) {
        await super._onCreate(data, options, user);
        await this.setFlag("world", "combat", Status.create());
    }

    /**
     * @override
     */
    _getInitiativeFormula() {
        let modifier = this.actor.getWoundModifier('physique') + this.actor.data.data.bonus.initiative;
        return "1d4+" + modifier.toString();
    }

}