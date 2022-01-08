import { Unarmed } from "./unarmed.js";

export class Frappe extends Unarmed {

    /**
     * The identifier of the action.
     */
    static id = 'frappe';

    /**
     * The tooltip of the action.
     */
    static tooltip = "Une frappe à main nue";

    /**
     * Indicates others actions can't be performed.
     */
    static exclusive = false;

    /**
     * Indicates the number of this action which can be performed.
     */
    static occurence = 1;

    /**
     * The effects produced by the action.
     */
    static effects = [];

    /**
     * The attack modifier.
     */
    static attack = 0;

    /**
     * The defense modifier.
     */
    static defense = 0;

    /**
     * The impact modifier.
     */
    static impact = 0;

    /**
     * @Override
     */
    sentence() {
        return "porte une frappe à main nue sur " + this.target.name;
    }

    /**
     * @Override
     */
    impact() {
        return 1 + this.constructor.impact + this.actor.data.data.bonus.dommage;
    }

    /**
     * @Override
     * 
     * To be allowed a frappe action must validate the following assertions:
     *  - The history of the round allows this action
     *  - Exactly one target has been selected
     *  - The token is not immobilized
     */
    allowed() {
        return this.token.combatant.getAllowedActionFromHistory(this) &&
            this.target != null &&
            this.immobilized() === false;
    }

}