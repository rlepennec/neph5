import { Regles } from "../regles/regles.js";

/**
 * Les combattants. Les règles de la version du monde donnent la formule d'initiative
 * (initiative) ; sans elles, celle de Foundry (voir Regles).
 */
export class NephilimCombatant extends Combatant {

    /**
     * @override
     */
    _getInitiativeFormula() {
        return Regles.courantes.initiative?.(this) ?? super._getInitiativeFormula();
    }

}
