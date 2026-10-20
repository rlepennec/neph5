import { Incarnations } from "../../feature/incarnation/incarnations.js";

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
            if (item.sid !== new Incarnations(item.parent).courante) return true;
        }
        return super.isSuppressed;
    }

}
