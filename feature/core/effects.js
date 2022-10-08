export class ActiveEffects {

    static get DESORIENTE() {
        return {
            id: 'stun',
            label: 'EFFECT.StatusStunned',
            icon: 'icons/svg/daze.svg',
            duration: {
                rounds: 1
            },
            sentence: 'NEPH5E.estDesoriente'
        }
    }

    static get IMMOBILISE() {
        return {
            id: 'restrain',
            label: 'EFFECT.StatusRestrained',
            icon: 'icons/svg/net.svg',
            duration: {
                seconds: 1
            },
            sentence: 'NEPH5E.estImmobilise'
        }
    }

    static get PROJETE() {
        return {
            id: 'prone',
            label: 'EFFECT.StatusProne',
            icon: 'icons/svg/falling.svg',
            duration: {
                seconds: 1
            },
            sentence: 'NEPH5E.estProjete'
        }
    }

    static get MORT() {
        return {
            id: 'dead',
            label: 'EFFECT.StatusDead',
            icon: 'icons/svg/skull.svg',
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
     * 
     * @param actor  The actor object.
     * @param target The targeted actor object .
     * @returns all actor effects.
     */
    static effectsOf(actor, target) {
        return {
            foeOnGround: ActiveEffects.isActive(target, ActiveEffects.PROJETE),
            onGround: ActiveEffects.isActive(actor, ActiveEffects.PROJETE),
            stunned: ActiveEffects.isActive(actor, ActiveEffects.DESORIENTE),
            restrained: ActiveEffects.isActive(actor, ActiveEffects.IMMOBILISE)
        }
    }

    /**
     * @param id The identifier of the effect.
     * @returns the active effect.
     */
    static get(id) {
        return ActiveEffects.effects().find(e => e.id === id);
    }

    /**
     * @param actor  The actor object to watch.
     * @param effect The object effect to watch.
     * @returns true if the effect is active for the specified actor.
     */
    static isActive(actor, effect) {
        return actor != null && actor.effects.find(e => e.label === effect.label) != null;
    }

    /**
     * @param actor  The actor object from which to delete the effect.
     * @param effect The effect object to remove.
     */
    static async delete(actor, effect) {
        const ids = actor.effects.filter(e => e.label === effect.label).map(e => e.id);
        await actor.deleteEmbeddedDocuments("ActiveEffect", ids);
    }

    /**
     * @param actor  The actor object to which to add the effect.
     * @param effect The effect to add.
     */
    static async add(actor, effect) {
        const object = mergeObject(effect, {
            origin: actor.uuid,
            disabled: false});
        await actor.createEmbeddedDocuments("ActiveEffect", [object]);
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

}