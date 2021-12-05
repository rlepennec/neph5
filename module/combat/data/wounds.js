import { Game } from "../../common/game.js";
import { Status } from "./status.js";

export class Wounds {

    /**
     * Constructor.
     * @param combatant The combatant for which to manage the wounds.
     */
    constructor(combatant) {
        this.combatant = combatant;
    }

    /**
     * Gets the specified wound value.
     * @param wound The wound to set.
     * @param type  'physique' or 'magique'
     * @returns the wound value.
     */
    get(wound, type) {
        if (type === 'physique') {
            return this.combatant.actor.data.data.dommage.physique[wound.id];
        }
        if (type === 'magique') {
            return this.combatant.actor.data.data.dommage.magique[wound.id];
        }
        return null;
    }

    /**
     * Sets the specified wound value.
     * @param wound The wound to set.
     * @param value The value to set.
     * @param type  'physique' or 'magique'
     * @returns the instance.
     */
    async set(wound, value, type) {

        if (type === 'physique') {
            const physique = duplicate(this.combatant.actor.data.data.dommage.physique);
            const mortelle = physique[Game.wounds.mortelle.id];
            physique[wound.id] = value;
            await this.combatant.actor.update({['data.dommage.physique']: physique});
            if (wound === Game.wounds.mortelle && mortelle != value) {
                await this.applyMortal();
            }
        } 

        if (type === 'magique') {
            const magique = duplicate(this.combatant.actor.data.data.dommage.magique);
            const mortelle = magique[Game.wounds.mortelle.id];
            magique[wound.id] = value;
            await this.combatant.actor.update({['data.dommage.magique']: magique});
            if (wound === Game.wounds.mortelle && mortelle != value) {
                //await this.applyMortal();
            }
        }

        return this;
    }

    /**
     * @returns the wounds modifier.
     */
    getModifier(type) {
        let modifier = 0;
        for (const w in Game.wounds) {
            const wound = Game.wounds[w];
            if (this.get(wound, type)) {
                modifier = modifier + wound.modifier;
            }
        }
        return modifier;
    }

    /**
     * Applies the specified amount of damages.
     * @param damages The damages to apply.
     * @param type    'physique' or 'magique'
     * @returns the most serious injury.
     */
    async applyDamages(damages, type) {

        // Initialization
        let currentDamages = damages;
        let baseDommage = type === 'physique' ? this.combatant.actor.data.data.dommage.physique : this.combatant.actor.data.data.dommage.magique;

        // No damages to apply
        if (damages === 0) {
            return null;
        }

        // Apply damages to choc
        // Quand 3 cases, encaisse 1, 4 encaisse 2, etc...
        const chocEncaissable = baseDommage.cases - 2;

        const currentChoc = this.get(Game.wounds.choc, type);
        const availableChoc = baseDommage.cases - currentChoc;
        if (currentDamages > 0 && availableChoc > 0) {

            // Dommage a appliquer: se base sur 
            // - chocEncaissable qui est le max de cases encaissable
            // - availableChoc qui est le nombre de cases courante
            // - currentDamages impact
            // chocEncaisse = Min(chocEncaissable, availableChoc)
            const chocEncaisse = Math.min(currentDamages, chocEncaissable, availableChoc);

            await this.set(Game.wounds.choc, currentChoc + chocEncaisse, type);
            currentDamages = Math.max(0, currentDamages - chocEncaisse);
            if (currentDamages === 0) {
                return Game.wounds.choc;
            }
        } 

        // Apply damages to blessure mineure
        if (currentDamages > 0 && !this.get(Game.wounds.mineure, type)) {
            await this.set(Game.wounds.mineure, true, type);
            currentDamages = Math.max(0, currentDamages - 2);
            if (currentDamages === 0) {
                return Game.wounds.mineure;
            }
        }

        // Apply damages to blessure serieuse
        if (currentDamages > 0 && !this.get(Game.wounds.serieuse, type)) {
            await this.set(Game.wounds.serieuse, true, type);
            currentDamages = Math.max(0, currentDamages - 4);
            if (currentDamages === 0) {
                return Game.wounds.serieuse;
            }
        }

        // Apply damages to blessure grave
        if (currentDamages > 0 && !this.get(Game.wounds.grave, type)) {
            await this.set(Game.wounds.grave, true, type);
            currentDamages = Math.max(0, currentDamages - 6);
            if (currentDamages === 0) {
                return Game.wounds.grave;
            }
        }

        // Apply damages to blessure mortelle
        if (!this.get(Game.wounds.mortelle, type)) {
            await this.set(Game.wounds.mortelle, true, type);
        }
        await this.set(Game.wounds.mortelle, true, type);
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
        const token = game.canvas.tokens.get(this.combatant.data.tokenId);
        await token.toggleEffect(effect, {overlay: true, active: true});

    }

}