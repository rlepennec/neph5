import { Ranged } from "./ranged.js";

export class Tirer extends Ranged {

    /**
     * The identifier of the action.
     */
    static id = 'tirer';

    /**
     * The tooltip of the action.
     */
    static tooltip = "Utilise 1 munition";

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
    static attack = -1;

    /**
     * The defense modifier.
     */
    static defense = 0;

    /**
     * The impact modifier.
     */
    static impact = 0;

    /**
     * The minimum number of ammunitions.
     */
    static required = 1;

    /**
     * The number of ammunitions to use.
     */
    static used = 1;

    /**
     * @Override
     */
    sentence() {
        return "tire sur " + this.target.name + " avec " + this.weapon.name;
    }

}