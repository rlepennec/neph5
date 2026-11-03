import { IncarnationsV5 } from "../../../../feature/incarnation/regles/v5/incarnations.js";

/**
 * Les effets du système. Les états d'une figure (désorienté, immobilisé, à terre, mort...)
 * sont portés par ses incarnations, chacune les siens (voir ActiveEffects.porteur) : seuls
 * ceux de l'incarnation courante s'appliquent à la figure, les autres sont suspendus.
 */
export class NephilimActiveEffect extends foundry.documents.ActiveEffect {

    /**
     * @override
     */
    get isSuppressed() {
        const item = this.parent;
        if (item instanceof foundry.documents.Item && item.type === 'incarnation' && item.parent != null) {
            if (item.sid !== new IncarnationsV5(item.parent).courante) return true;
        }
        return super.isSuppressed;
    }

}
