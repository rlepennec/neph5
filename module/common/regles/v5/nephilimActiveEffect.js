import { ActiveEffects } from "../../../../feature/core/regles/v5/effects.js";
import { IncarnationsV5 } from "../../../../feature/incarnation/regles/v5/incarnations.js";

/**
 * Les effets du système. Les états d'une figure (désorienté, immobilisé, à terre, mort...)
 * sont portés par ses incarnations, chacune les siens (voir ActiveEffects.porteur) : seuls
 * ceux de l'incarnation courante s'appliquent à la figure, les autres sont suspendus.
 * Un token non lié est un individu à part : les états posés sur son acteur ne le touchent pas.
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
        if (this.herite) return true;
        return super.isSuppressed;
    }

    /**
     * @returns the actor this effect applies to, null if none.
     */
    get acteur() {
        return this.parent instanceof foundry.documents.Item ? this.parent.parent : this.parent;
    }

    /**
     * L'origine le dit, même quand Foundry recopie l'incarnation dans le token.
     * @returns true if this state was set on the actor of an unlinked token, not on the token.
     */
    get herite() {
        const modele = this.acteur?.token?.baseActor;
        return modele != null && this.origin === modele.uuid && ActiveEffects.estEtat(this);
    }

    /**
     * Les états posés par le HUD n'ont pas d'origine : sans elle, rien ne les distinguerait.
     * @override
     */
    async _preCreate(data, options, user) {
        const allowed = await super._preCreate(data, options, user);
        if (allowed === false) return false;
        if (this.origin == null && this.statuses.size > 0 && this.acteur != null) {
            this.updateSource({ origin: this.acteur.uuid });
        }
    }

}
