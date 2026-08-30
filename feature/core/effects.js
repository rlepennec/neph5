export class ActiveEffects {

    static get DESORIENTE() {
        return {
            name: 'Stunned',
            img: 'systems/neph5e/assets/icons/svg/daze.svg',
            duration: {
                rounds: 1
            }
        }
    }

    static get IMMOBILISE() {
        return {
            name: 'Restrained',
            img: 'systems/neph5e/assets/icons/svg/net.svg',
            duration: {
                seconds: 1
            }
        }
    }

    static get PROJETE() {
        return {
            name: 'Prone',
            img: 'systems/neph5e/assets/icons/svg/falling.svg',
            duration: {
                seconds: 1
            }
        }
    }

    static get MORT() {
        return {
            name: 'Dead',
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
     * @param name The name of the active effect.
     * @returns the active effect.
     */
    static get(name) {
        return ActiveEffects.effects().find(e => e.name === name);
    }

    /**
     * @param actor  The actor object to watch.
     * @param effect The object effect to watch.
     * @returns true if the effect is active for the specified actor.
     */
    static isActive(actor, effect) {
        return actor != null && actor.appliedEffects.find(e => e.name === effect.name) != null;
    }

    /**
     * @param actor  The actor object from which to delete the effect.
     * @param effect The effect object to remove.
     */
    static async delete(actor, effect) {
        const object = actor.appliedEffects.find(e => e.name === effect.name);
        if (object) await object.delete();
    }

    /**
     * @param actor  The actor object to which to add the effect.
     * @param effect The effect to add.
     */
    static async add(actor, effect) {
        const object = foundry.utils.mergeObject(effect, {
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