import { Status } from "../combat/data/status.js";
import { Game } from "./game.js";
import { CustomHandlebarsHelpers } from "./handlebars.js";

export class NephilimCombatant extends Combatant {

    // @Override
    async _onCreate(data,options,user) {
        await super._onCreate(data, options, user);
        await this.setFlag("world", "combat", Status.create());
    }

    /**
     * Gets the intiiative modifier due to Ka eau.
     * @param value The value of the Ka eau
     * @returns the modifier.
     */
    static _getEauModifier(value) {
        if (value < 1) {
            return 0;
        } else {
            return Math.floor((value-1)/5);
        }
    }

    /**
     * @override
     * Defines the intiiative formula to roll dice in Foundry for the specified combatant.
     * @returns the formula.
     */
    _getInitiativeFormula() {

        const actor = this.actor;
        const status = new Status(this);

        // Initial modifier is made of wound and initiative modifiers
        let modifier = status.wounds.getModifier() + "+" + status.improvements.get(Game.improvements.initiative);

        if (this._actor.data.type === 'figure') {

            // Add eau
            modifier = modifier + "+" + NephilimCombatant._getEauModifier(actor.data.data.ka.eau);

            // Add agile or 3
            if (actor.data.data.simulacre.refid) {
                const simulacre = CustomHandlebarsHelpers.getActor(actor.data.data.simulacre.refid);
                modifier = simulacre.data.data.agile + "+" + modifier;
            } else {
                modifier = "3+" + modifier;
            }

        } else if (actor.data.type === 'simulacre') {

            // Add agile
            modifier = actor.data.data.agile + "+" + modifier;

        } else {

            // Add agile
            modifier = "3+" + modifier;

        }

        return "1d4+" + modifier.toString();
    }

 }