import { Game } from "../common/game.js";
import { Action } from "./action.js";

export class NephilimCombatant extends Combatant {

    /**
     * @override
     */
    async _onCreate(data, options, user) {
        const status = {
            effects: [],
            history: {
                round: null,
                attacks: [],
                defenses: [],
                exclusive: null
            }
        }
        await super._onCreate(data, options, user);
        await this.setFlag("world", "combat", status);
    }

    /**
     * @override
     */
    _getInitiativeFormula() {
        if (!this.actor) return "1d6";
        let malus = this.getWoundsModifier('physique');
        let bonus = this.actor.data.data.bonus.initiative;
        let ka = undefined;
        if (this.actor.data.data.ka.noyau > 0) {
            ka = this.actor.data.data.ka.noyau;
        } else if (this.actor.data.data.ka.eau > 0) {
            ka = 2 * this.actor.data.data.ka.eau;
        } else {
            for (let elt of ['soleil', 'orichalque', 'brume', 'air', 'feu', 'lune', 'terre']) {
                const val = this.actor.data.data.ka[elt];
                if (val !== undefined) {
                    ka = val;
                    break;
                }
            }
        }
        if (ka === undefined) {
            ka = 0;
        }
        let menace = this.actor.data.data.menace === undefined ? 0 : this.actor.data.data.menace;
        return "1d6" + 
            (malus === 0 ? "" : malus.toString()) +
            (bonus === 0 ? "" : "+" + bonus.toString()) +
            (ka === 0 ? "" : "+" + ka.toString()) +
            (menace === 0 ? "" : "+" + menace.toString());
    }

    /**
     * Sets the specified wound value.
     * @param wound The wound to set.
     * @param value The value to set.
     * @param type  'physique' or 'magique'
     * @returns the instance.
     */
    async setWound(wound, value, type) {
        const actor = this.actor;
        const base = type === 'physique' ? actor.data.data.dommage.physique : actor.data.data.dommage.magique;
        const damages = duplicate(base);
        const isMortal = damages[Game.wounds.mortelle.id] != value;
        damages[wound.id] = value;
        await actor.update({ ['data.dommage.' + type]: damages });
        if (wound === Game.wounds.mortelle && type === 'physique' && isMortal) {
            await this.applyMortal();
        }
        return this;
    }

    /**
     * Applies the specified amount of damages.
     * @param damages The damages to apply.
     * @param type    'physique' or 'magique'
     * @returns the most serious injury.
     */
    async applyDamages(damages, type) {

        // Initialization
        const actor = this.actor;
        let currentDamages = damages;
        let baseDommage = type === 'physique' ? actor.data.data.dommage.physique : actor.data.data.dommage.magique;

        // No damages to apply
        if (damages === 0) {
            return null;
        }

        // Apply damages to choc
        // Quand 3 cases, encaisse 1, 4 encaisse 2, etc...
        const chocEncaissable = baseDommage.cases - 2;

        const currentChoc = baseDommage[Game.wounds.choc.id];
        const availableChoc = baseDommage.cases - currentChoc;
        if (currentDamages > 0 && availableChoc > 0) {

            // Dommage a appliquer: se base sur 
            // - chocEncaissable qui est le max de cases encaissable
            // - availableChoc qui est le nombre de cases courante
            // - currentDamages impact
            // chocEncaisse = Min(chocEncaissable, availableChoc)
            const chocEncaisse = Math.min(currentDamages, chocEncaissable, availableChoc);

            await this.setWound(Game.wounds.choc, currentChoc + chocEncaisse, type);
            currentDamages = Math.max(0, currentDamages - chocEncaisse);
            if (currentDamages === 0) {
                return Game.wounds.choc;
            }
        }

        // Apply damages to blessure mineure
        if (currentDamages > 0 && !baseDommage[Game.wounds.mineure.id]) {
            await this.setWound(Game.wounds.mineure, true, type);
            currentDamages = Math.max(0, currentDamages - 2);
            if (currentDamages === 0) {
                return Game.wounds.mineure;
            }
        }

        // Apply damages to blessure serieuse
        if (currentDamages > 0 && !baseDommage[Game.wounds.serieuse.id]) {
            await this.setWound(Game.wounds.serieuse, true, type);
            currentDamages = Math.max(0, currentDamages - 4);
            if (currentDamages === 0) {
                return Game.wounds.serieuse;
            }
        }

        // Apply damages to blessure grave
        if (currentDamages > 0 && !baseDommage[Game.wounds.grave.id]) {
            await this.setWound(Game.wounds.grave, true, type);
            currentDamages = Math.max(0, currentDamages - 6);
            if (currentDamages === 0) {
                return Game.wounds.grave;
            }
        }

        // Apply damages to blessure mortelle
        if (!baseDommage[Game.wounds.mortelle.id]) {
            await this.setWound(Game.wounds.mortelle, true, type);
        }
        await this.setWound(Game.wounds.mortelle, true, type);
        return Game.wounds.mortelle;

    }

    /**
     * Applies the mortal wound to display visual effect.
     * @returns the instance.
     */
    async applyMortal() {

        // Add visual effect
        const effect = {
            icon: "icons/svg/skull.svg",
            id: "dead",
            label: "EFFECT.StatusDead"
        }
        const token = game.canvas.tokens.get(this.data.tokenId);
        await token.toggleEffect(effect, { overlay: true, active: true });

    }

    /**
     * @returns the wounds modifier.
     */
    getWoundsModifier(type) {
        return this.actor.getWoundsModifier(type);
    }

    /**
     * Indicates if the specified effect is active.
     * @param effect The effect to watch.
     * @returns true if the effect is active.
     */
    effectIsActive(effect) {
        return this.data.flags.world.combat.effects.find(e => e.id === effect.id) != undefined;
    }

    /**
     * Gets the roll associated to the specified effect.
     * @param effect The effect for which to get the roll.
     * @returns the roll.
     */
    getEffectRoll(effect) {
        if (this.effectIsActive(effect)) {
            const registered = this.data.flags.world.combat.effects.find(e => e.id === effect.id);
            return registered.roll;
        }
        return undefined;
    }

    /**
     * Sets the roll data to the specified active effect.
     * @param effect The effect for which to set the roll.
     * @param roll   Ther roll to set.
     * @return the instance.
     */
    async setEffectRoll(effect, roll) {
        if (this.effectIsActive(effect)) {
            const flags = duplicate(this.data.flags);
            const current = flags.world.combat.effects.find(e => e.id === effect.id);
            current.roll = roll;
            await this.update({ ['flags']: flags });
        }
        return this;
    }

    /**
     * Activates or deactivates the specified effect.
     * @param effect The effect to activate or deactivate.
     * @param active True to activate the effect.
     * @param duration The optional nummber of activation after the current round.
     * @returns the instance.
     */
    async setEffect(effect, active, duration) {
        return (active ? await this.activateEffect(effect, duration) : await this.deactivateEffect(effect));
    }

    /**
     * Activates the specified effect.
     * @param effect   The effect to activate.
     * @param duration The optional nummber of activation after the current round.
     * @returns this instance.
     */
    async activateEffect(effect, duration) {

        // Update the combatant flags
        const flags = duplicate(this.data.flags);
        const current = flags.world.combat.effects.find(e => e.id === effect.id);
        const now = game.combat.current.round;
        const toggle = current === undefined;
        if (toggle) {

            // Update the combatant flags
            flags.world.combat.effects.push({
                id: effect.id,
                start: now,
                duration: duration
            });

        } else {

            // Update the token flags
            current.start = game.combat.current.round;
            current.duration = duration;

        }

        // Update the flags first
        await this.update({ ['flags']: flags });

        // Update the status icon of the token
        if (toggle) {
            if (effect.status != undefined) {
                const token = game.canvas.tokens.get(this.data.tokenId);
                await token.toggleEffect(effect.status, { overlay: false });
            }
        }

        return this;

    }

    /**
     * Deactivates the specified effect.
     * @param effect The effect to deactivate.
     * @return the instance.
     */
    async deactivateEffect(effect) {

        // Check if the specified effect is active
        const flags = duplicate(this.data.flags);
        const pos = flags.world.combat.effects.findIndex(e => e.id === effect.id);
        if (pos != -1) {

            // Update flags
            flags.world.combat.effects.splice(pos, 1);
            await this.update({ ['flags']: flags });

            // Toggle status icon
            if (effect.status != undefined) {
                const token = game.canvas.tokens.get(this.data.tokenId);
                await token.toggleEffect(effect.status, { overlay: false });
            }

        }

        return this;

    }

    /**
     * Refreshes all effects by removing expired ones.
     * @returns the instance.
     */
    async refreshEffects() {
        const flags = duplicate(this.data.flags);
        const now = game.combat.current.round;
        flags.world.combat.effects.forEach(async function (e, index, array) {
            if (e.duration != null && e.start + e.duration < now) {

                // Update the combatant flags
                array.splice(index, 1);

                // Update the status icon of the token
                const status = Game.effects[e.id].status;
                if (status != undefined) {
                    const token = game.canvas.tokens.get(this.data.tokenId);
                    await token.toggleEffect(status, { overlay: false });
                }

            }
        });
        await this.update({ ['flags']: flags });
        return this;
    }

    /**
     * Indicates if the specified action is allowed according to the current history.
     *   - A exclusive action forbids other actions to be pushed.
     *   - An pushed attack forbids the other attacks to be pushed.
     *   - A non exclusive attack can be pushed with different non exclusive defenses.
     *   - An action can't not been pushed more than the occurence if defined.
     * @param action The action to test.
     * @returns true if the action is allowed.
     */
    getAllowedActionFromHistory(action) {

        // Initialization
        const attacks = this.data.flags.world.combat.history.attacks;
        const defenses = this.data.flags.world.combat.history.defenses;

        // Any action can be pushed if history is empty.
        if (attacks.length === 0 && defenses.length === 0) {
            return true;
        }

        // If the action is exclusive, only the same action is allowed. The history
        // is not empty, so the registered action must be compared.
        const exclusive = this.getExclusiveActionFromHistory();
        if (action.constructor.exclusive) {

            // Forbids to push two differents exclusive actions.
            if (exclusive != undefined && exclusive.id != action.constructor.id) {
                return false;
            }

            // Forbids to push more than the occurence id defined.
            return action.constructor.occurence === undefined || this.getHistorySizeOf(action) < action.constructor.occurence;

        }

        // The action is not exclusive. Forbids to push this action if an exclusive
        // action is already registered.
        if (exclusive != undefined) {
            return false;
        }

        // The action is an defense. Forbids to push more than the occurence id defined.
        if (action.constructor.type === Action.Types.defense.id) {
            return action.constructor.occurence === null || this.getHistorySizeOf(action) < action.constructor.occurence;
        }

        // The action is an attack. Forbids to push more than one attack.
        if (attacks.some(a => a.id != action.constructor.id)) {
            return false;
        }

        // Forbids to push more than the occurence id defined.
        return action.constructor.occurence === null || this.getHistorySizeOf(action) < action.constructor.occurence;

    }

    /**
     * Gets the number of the specified action.
     * @param action The action to check.
     * @returns the number of registration.
     */
    getHistorySizeOf(action) {

        // Retrieve the array in which to check the action
        const array = action.constructor.type === Action.Types.defense.id ?
            this.data.flags.world.combat.history.defenses :
            this.data.flags.world.combat.history.attacks;

        // Count the occurences of the action
        return array.filter(a => a.constructor.id != action.constructor.id).length;

    }

    /**
     * @returns the exclusive action or undefined.
     */
    getExclusiveActionFromHistory() {
        let exclusive = this.data.flags.world.combat.history.attacks.find(a => a.exclusive);
        if (exclusive === undefined) {
            exclusive = this.data.flags.world.combat.history.defenses.find(a => a.exclusive);
        }
        return exclusive;
    }

    /**
     * Pushes the specified action in the history.
     * @param action The action to push.
     * @returns the instance.
     */
    async pushActionInHistory(action) {

        // Retrieve the combat flags
        const flags = duplicate(this.data.flags);

        // Retrieve the array in which to push the action
        const array = action.type === Action.Types.defense.id ?
            flags.world.combat.history.defenses :
            flags.world.combat.history.attacks;

        // Push the action
        array.push(action);

        // Update and returns the updated combat flags
        await this.update({ ['flags']: flags });
        return this;

    }

    /**
     * Refreshes the history.
     */
    async refreshHistory() {

        // Initialization
        const flags = duplicate(this.data.flags);
        const now = game.combat.current.round;

        // Removes all the actions if the current round has expired
        if (flags.world.combat.history.round != now) {
            flags.world.combat.history.round = now;
            flags.world.combat.history.attacks = [];
            flags.world.combat.history.defenses = [];
        }

        // Update the combatant
        await this.update({ ['flags']: flags });
        return this;

    }

}