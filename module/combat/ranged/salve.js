import { Ranged } from "./ranged.js";

export class Salve extends Ranged {

    /**
     * The identifier of the action.
     */
    static id = 'salve';

    /**
     * The tooltip of the action.
     */
    static tooltip = "Utilise 3 munitions";

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
    static attack = -3;

    /**
     * The defense modifier.
     */
    static defense = 0;

    /**
     * The impact modifier.
     */
    static impact = 2;

    /**
     * The minimum number of ammunitions.
     */
    static required = 3;

    /**
     * The minimum number of ammunitions.
     */
    static required = 3;

    /**
     * The number of ammunitions to use.
     */
    static used = 3;

    /**
     * @Override
     */
    sentence() {
        return "tire en salve sur " + this.target.name + " avec " + this.weapon.name;
    }

}