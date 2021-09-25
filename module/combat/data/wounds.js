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
     * @returns the initial wounds token property.
     */
    static create() {
        return {
            choc: 0,
            legere: false,
            serieuse: false,
            grave: false,
            mortelle: false
        };
    }

    /**
     * @returns the json data object used to render templates.
     */
    getRenderData() {
        return {
            choc: this.get(Game.wounds.choc),
            legere: this.get(Game.wounds.legere),
            serieuse: this.get(Game.wounds.serieuse),
            grave: this.get(Game.wounds.grave),
            mortelle: this.get(Game.wounds.mortelle)
        }
    }

    /**
     * Gets the specified wound value.
     * @param wound The wound to set. 
     * @returns the wound value.
     */
    get(wound) {
        return this.getOf(this.combatant.data.flags, wound);
    }

    /**
     * Gets the specified wound value for the specified flags.
     * @param flags The flags to check.
     * @param wound The wound to set. 
     * @returns the wound value.
     */
    getOf(flags, wound) {
        return flags.world.combat.wounds[wound.id];
    }

    /**
     * Sets the specified wound value.
     * @param wound The wound to set.
     * @param value The value to set. 
     * @returns the instance.
     */
    async set(wound, value) {
        const flags = duplicate(this.combatant.data.flags);
        const mortelle = flags.world.combat.wounds[Game.wounds.mortelle.id];
        flags.world.combat.wounds[wound.id] = value;
        await this.combatant.update({['flags']: flags});
        if (wound === Game.wounds.mortelle && mortelle != value) {
            await this.applyMortal();
        }
        return this;
    }

    /**
     * @returns the wounds modifier.
     */
    getModifier() {
        let modifier = 0;
        for (const w in Game.wounds) {
            const wound = Game.wounds[w];
            if (this.get(wound)) {
                modifier = modifier + wound.modifier;
            }
        }
        return modifier;
    }

    /**
     * Applies the specified amount of damages.
     * @param damages The damages to apply.
     * @returns the most serious injury.
     */
    async applyDamages(damages) {

        // Initialization
        let currentDamages = damages;

        // No damages to apply
        if (damages === 0) {
            return null;
        }

        // Apply damages to choc
        const status = new Status(this.combatant);
        const currentChoc = this.get(Game.wounds.choc);
        const availableChoc = 3 + status.improvements.get(Game.improvements.choc) - currentChoc;
        if (currentDamages > 0 && availableChoc > 0) {
            await this.set(Game.improvements.choc, currentChoc + 1);
            currentDamages = Math.max(0, currentDamages - 1);
            if (currentDamages === 0) {
                return Game.wounds.choc;
            }
        } 

        // Apply damages to blessure legere
        if (currentDamages > 0 && !this.get(Game.wounds.legere)) {
            await this.set(Game.wounds.legere, true);
            currentDamages = Math.max(0, currentDamages - 2);
            if (currentDamages === 0) {
                return Game.wounds.legere;
            }
        }

        // Apply damages to blessure serieuse
        if (currentDamages > 0 && !this.get(Game.wounds.serieuse)) {
            await this.set(Game.wounds.serieuse, true);
            currentDamages = Math.max(0, currentDamages - 4);
            if (currentDamages === 0) {
                return Game.wounds.serieuse;
            }
        }

        // Apply damages to blessure grave
        if (currentDamages > 0 && !this.get(Game.wounds.grave)) {
            await this.set(Game.wounds.grave, true);
            currentDamages = Math.max(0, currentDamages - 6);
            if (currentDamages === 0) {
                return Game.wounds.grave;
            }
        }

        // Apply damages to blessure mortelle
        if (!this.get(Game.wounds.mortelle)) {
            await this.set(Game.wounds.mortelle, true);
        }
        await this.set(Game.wounds.mortelle, true);
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