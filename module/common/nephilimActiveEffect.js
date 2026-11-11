import { Regles } from "../regles/regles.js";

/**
 * Les effets du système. Les règles de la version du monde peuvent en suspendre (effets.suspendu)
 * et compléter ceux qu'on crée (effets.preparer) ; sans elles, ceux de Foundry (voir Regles).
 */
export class NephilimActiveEffect extends foundry.documents.ActiveEffect {

    /**
     * @override
     */
    get isSuppressed() {
        return Regles.courantes.effets?.suspendu?.(this) === true || super.isSuppressed;
    }

    /**
     * @returns the actor this effect applies to, null if none.
     */
    get acteur() {
        return this.parent instanceof foundry.documents.Item ? this.parent.parent : this.parent;
    }

    /**
     * @override
     */
    async _preCreate(data, options, user) {
        const allowed = await super._preCreate(data, options, user);
        if (allowed === false) return false;
        Regles.courantes.effets?.preparer?.(this);
    }

}
