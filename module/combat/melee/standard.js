import { Melee } from "./melee.js";

export class Standard extends Melee {

    /**
     * The identifier of the action.
     */
    static id = 'standard';

    /**
     * The tooltip of the action.
     */
    static tooltip = "Une attaque standard";

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
        return "porte une attaque standard sur " + this.target.name + " avec " + this.weapon.name;
    }

}