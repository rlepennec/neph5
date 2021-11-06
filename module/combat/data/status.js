import { Improvements } from "./improvements.js";
import { Effects } from "./effects.js";
import { Wounds } from "./wounds.js";
import { Protection } from "./protection.js";
import { Unarmed } from "./unarmed.js";
import { Melee } from "./melee.js";
import { Ranged } from "./ranged.js";
import { Messages } from "./messages.js";
import { History } from "./history.js";

export class Status {

    /**
     * Constructor.
     * @param combatant The combatant for which to manage the status.
     */
    constructor(combatant) {
        this.improvements = new Improvements(combatant);
        this.effects = new Effects(combatant);
        this.wounds = new Wounds(combatant);
        this.protection = new Protection(combatant);
        this.unarmed = new Unarmed(combatant);
        this.melee = new Melee(combatant);
        this.ranged = new Ranged(combatant);
        this.messages = new Messages(combatant);
        this.history = new History(combatant);
    }

    /**
     * @returns the initial combat combatant property.
     */
    static create() {
        return {
            improvements: Improvements.create(),
            effects: Effects.create(),
            protection: Protection.create(),
            unarmed: Unarmed.create(),
            melee: Melee.create(),
            ranged: Ranged.create(),
            messages: Messages.create(),
            history: History.create()
        }
    }

    /**
     * @returns the json data object used to render templates.
     */
    getData() {
        return {
            improvements: this.improvements.getRenderData(),
            effects: this.effects.getRenderData(),
            protections: this.protection.getRenderData(),
            unarmed: this.unarmed.getRenderData(),
            melee: this.melee.getRenderData(),
            ranged: this.ranged.getRenderData(),
            wounds: this.wounds.getRenderData(),
        }
    }

    /**
     * Refreshes the combatant data according to the current turn and the current round.
     * Following data must be refreshed:
     * - history: clears the history of the round at the beginning of each round.
     * - effects: removes expired effects.
     * @returns the instance.
     */
    async refresh() {
        await this.effects.refresh();
        await this.history.refresh();
    }

    /**
     * Clears status.
     * @returns the instance.
     */
    async clear() {
        await this.effects.clear();
    }

}