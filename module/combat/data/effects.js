import { Game } from "../../common/game.js";

/**
 * The Effects class manages the combat effects about a token. The active effects
 * are stored in the token combat flags. The status icons are updated according to
 * the current effects.
 * The effects are defined in the Game class.
 */
export class Effects {

    /**
     * Constructor.
     * @param combatant The combatant for which to manage the effects.
     */
     constructor(combatant) {
        this.combatant = combatant;
    }

    /**
     * @returns the initial effects combatant property.
     */
    static create() {
        return [];
    }

    /**
     * @returns the json data object used to render templates.
     */
    getRenderData() {
        return {
            desoriente: this.isActive(Game.effects.desoriente),
            immobilise: this.isActive(Game.effects.immobilise),
            projete: this.isActive(Game.effects.projete)
        }
    }

    /**
     * Indicates if the specified effect is active.
     * @param effect The effect to watch.
     * @returns true if the effect is active.
     */
    isActive(effect) {
        return this.isActiveOn(this.combatant.data.flags, effect);
    }

    /**
     * Indicates if the specified effect is active for the specified flags.
     * @param flags  The flags to check.
     * @param effect The effect to watch.
     * @returns true if the effect is active.
     */
    isActiveOn(flags, effect) {
        return flags.world.combat.effects.find(e => e.id === effect.id) != undefined;
    }

    /**
     * Activates or deactivates the specified effect.
     * @param effect The effect to activate or deactivate.
     * @param active True to activate the effect.
     * @param duration The optional nummber of activation after the current round.
     * @returns the instance.
     */
    async set(effect, active, duration) {
        return (active ? await this.activate(effect, duration) : await this.deactivate(effect));
    }

    /**
     * Clears all effects.
     * @returns the instance.
     */
    async clear() {
        const flags = duplicate(this.combatant.data.flags);
        flags.world.combat.effects = [];
        await this.combatant.update({['flags']: flags});
        return this;
    }

    /**
     * Refreshes all effects by removing expired ones.
     * @returns the instance.
     */
    async refresh() {
        const flags = duplicate(this.combatant.data.flags);
        const now = game.combat.current.round;
        flags.world.combat.effects.forEach(async function(e, index, array) {
            if (e.duration != null && e.start + e.duration < now) {

                // Update the combatant flags
                array.splice(index, 1);

                // Update the status icon of the token
                const status = Game.effects[e.id].status;
                if (status != undefined) {
                    const token = game.canvas.tokens.get(this.combatant.data.tokenId);
                    await token.toggleEffect(status, {overlay: false});
                }

            }
        });
        await this.combatant.update({['flags']: flags});
        return this;
    }

    /**
     * Activates the specified effect.
     * @param effect   The effect to activate.
     * @param duration The optional nummber of activation after the current round.
     * @returns this instance.
     */
    async activate(effect, duration) {

        // Update the combatant flags
        const flags = duplicate(this.combatant.data.flags);
        const current = flags.world.combat.effects.find(e => e.id === effect.id);
        const now = game.combat.current.round;
        if (current === undefined) {

            // Update the combatant flags
            flags.world.combat.effects.push({
                id: effect.id,
                start: now,
                duration: duration
            });

            // Update the status icon of the token
            if (effect.status != undefined) {
                const token = game.canvas.tokens.get(this.combatant.data.tokenId);
                await token.toggleEffect(effect.status, {overlay: false});
            }

        } else {

            // Update the token flags
            current.start = game.combat.current.round;
            current.duration = duration;

        }

        await this.combatant.update({['flags']: flags});
        return this;

    }

    /**
     * Sets the roll data to the specified active effect.
     * @param effect The effect for which to set the roll.
     * @param roll   Ther roll to set.
     * @return the instance.
     */
    async setRoll(effect, roll) {
        if (this.isActive(effect)) {
            const flags = duplicate(this.combatant.data.flags);
            const current = flags.world.combat.effects.find(e => e.id === effect.id);
            current.roll = roll;
            await this.combatant.update({['flags']: flags});
        }
        return this;
    }

    /**
     * Gets the roll associated to the specified effect.
     * @param effect The effect for which to get the roll.
     * @returns the roll.
     */
    getRoll(effect) {
        return this.getRollOf(this.combatant.data.flags, effect);
    }

    /**
     * Gets the roll associated to the specified effect for the specified flags.
     * @param flags  The flags to check.
     * @param effect The effect for which to get the roll.
     * @returns the roll.
     */
    getRollOf(flags, effect) {
        if (this.isActiveOn(flags, effect)) {
            const registered = flags.world.combat.effects.find(e => e.id === effect.id);
            return registered.roll;
        }
        return undefined;
    }

    /**
     * Deactivates the specified effect.
     * @param effect The effect to deactivate.
     * @return the instance.
     */
    async deactivate(effect) {

        // Check if the specified effect is active
        const flags = duplicate(this.combatant.data.flags);
        const pos = flags.world.combat.effects.findIndex(e => e.id === effect.id);
        if (pos != -1) {

            // Update flags
            flags.world.combat.effects.splice(pos, 1);
            await this.combatant.update({['flags']: flags});

            // Toggle status icon
            if (effect.status != undefined) {
                const token = game.canvas.tokens.get(this.combatant.data.tokenId);
                await token.toggleEffect(effect.status, {overlay: false});
            }

        }

        return this;

    }

}