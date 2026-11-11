import { IncarnationsV5 } from "../../../incarnation/regles/v5/incarnations.js";

export class ActiveEffects {

    static get DESORIENTE() {
        return {
            name: 'Stunned',
            statuses: ['stun'],
            img: 'systems/neph5e/assets/icons/svg/daze.svg',
            sentence: 'NEPHILIM.estDesoriente',
            duration: {
                rounds: 1
            }
        }
    }

    static get IMMOBILISE() {
        return {
            name: 'Restrained',
            statuses: ['restrain'],
            img: 'systems/neph5e/assets/icons/svg/net.svg',
            sentence: 'NEPHILIM.estImmobilise',
            duration: {
                seconds: 1
            }
        }
    }

    static get PROJETE() {
        return {
            name: 'Prone',
            statuses: ['prone'],
            img: 'systems/neph5e/assets/icons/svg/falling.svg',
            sentence: 'NEPHILIM.estProjete',
            duration: {
                seconds: 1
            }
        }
    }

    static get MORT() {
        return {
            name: 'Dead',
            statuses: ['dead'],
            img: 'systems/neph5e/assets/icons/svg/skull.svg',
            duration: {
                seconds: 1
            }
        }
    }

    /**
     * @returns all effects.
     */
    static effects() {
        return [ActiveEffects.DESORIENTE, ActiveEffects.IMMOBILISE, ActiveEffects.PROJETE, ActiveEffects.MORT];
    }

    /**
     * [V14] Le champ `restrained` a ete retire de l'objet rendu. Il valait
     * exactement `actor.immobilise` (meme appel isActive(actor, IMMOBILISE)) et
     * n'etait lu que par les trois initializeRoll de Naturelle, Melee et
     * Distance -- lesquels ne sont construits que par NephilimActor.rollWeapon,
     * qui a deja refuse le jet sur `this.immobilise`. La garde y etait donc
     * inatteignable et le champ sans lecteur. L'immobilisation se lit desormais
     * sur l'acteur, source unique.
     *
     * @param actor  The actor object.
     * @param target The targeted actor object.
     * @returns all actor effects.
     */
    static effectsOf(actor, target) {
        return {
            foeOnGround: ActiveEffects.isActive(target, ActiveEffects.PROJETE),
            onGround: ActiveEffects.isActive(actor, ActiveEffects.PROJETE),
            stunned: ActiveEffects.isActive(actor, ActiveEffects.DESORIENTE)
        }
    }

    /**
     * @param effect An ActiveEffect document.
     * @returns true if it is a state: one of the system's, or a status effect.
     */
    static estEtat(effect) {
        return effect.statuses.size > 0 || ActiveEffects.effects().some(e => e.name === effect.name);
    }

    /**
     * L'origine le dit, même quand Foundry recopie l'incarnation dans le token.
     * @param effect An ActiveEffect document.
     * @returns true if this state was set on the actor of an unlinked token, not on the token.
     */
    static herite(effect) {
        const modele = effect.acteur?.token?.baseActor;
        return modele != null && effect.origin === modele.uuid && ActiveEffects.estEtat(effect);
    }

    /**
     * @param name The name of the active effect.
     * @returns the active effect.
     */
    static get(name) {
        return ActiveEffects.effects().find(e => e.name === name);
    }

    /**
     * Un état est le même qu'il soit posé par la fiche ou par le HUD du jeton : ils partagent son
     * statut. Le nom ne sert plus que pour les effets posés sans statut.
     * @param document An ActiveEffect document.
     * @param effect   The state, one of the effects above.
     * @returns true if the document is this state.
     */
    static correspond(document, effect) {
        return document.name === effect.name || effect.statuses.some(s => document.statuses.has(s));
    }

    /**
     * @param actor  The actor object to watch.
     * @param effect The object effect to watch.
     * @returns true if the effect is active for the specified actor.
     */
    static isActive(actor, effect) {
        return actor != null && actor.appliedEffects.some(e => ActiveEffects.correspond(e, effect));
    }

    /**
     * @param actor  The actor object from which to delete the effect.
     * @param effect The effect object to remove, whoever set it.
     */
    static async delete(actor, effect) {
        for (const object of actor.appliedEffects.filter(e => ActiveEffects.correspond(e, effect))) {
            await object.delete();
        }
    }

    /**
     * Le document qui porte les états d'un acteur : l'incarnation courante d'une figure (ses
     * effets s'appliquent à la figure, ceux des autres incarnations non, voir
     * EffetsV5), l'acteur lui-même sinon.
     * @param actor The actor object.
     * @returns the current incarnation of a figure, null if it has none; the actor otherwise.
     */
    static porteur(actor) {
        if (actor == null) return null;
        const incarnations = new IncarnationsV5(actor);
        return incarnations.porte ? incarnations.incarnation(incarnations.courante) : actor;
    }

    /**
     * Pose un état. Celui d'une figure va à son incarnation courante ; sans elle, aucun.
     * @param actor  The actor object to which to add the effect.
     * @param effect The effect to add.
     */
    static async add(actor, effect) {
        const porteur = ActiveEffects.porteur(actor);
        if (porteur == null) return;
        const status = CONFIG.statusEffects[effect.statuses[0]];
        const object = foundry.utils.mergeObject(effect, {
            name: status ? game.i18n.localize(status.name) : effect.name,
            origin: actor.uuid,
            disabled: false});
        // L'effet d'un item ne s'applique à son acteur que s'il est transféré
        if (porteur !== actor) object.transfer = true;
        await porteur.createEmbeddedDocuments("ActiveEffect", [object]);
    }

    /**
     * @param actor  The actor object to which to toggle the effect.
     * @param effect The effect to toggle.
     */
    static async toggle(actor, effect) {
        const active = ActiveEffects.isActive(actor, effect);
        await ActiveEffects.delete(actor, effect);
        if (active === false) {
            await ActiveEffects.add(actor, effect);
        }
    }

    /**
     * @param actor  The actor objet from which to activate the effect.
     * @param effect The effect to activate.
     */
    static async activate(actor, effect) {
        const active = ActiveEffects.isActive(actor, effect);
        if (active === false) {
            await ActiveEffects.add(actor, effect);
        }
    }

    /**
     * @param actor  The actor objet from which to deactivate the effect.
     * @param effect The effect to deactivate.
     */
    static async deactivate(actor, effect) {
        const active = ActiveEffects.isActive(actor, effect);
        if (active === true) {
            await ActiveEffects.delete(actor, effect);
        }
    }

}