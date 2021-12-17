import { Melee } from "./melee.js";

export class Force extends Melee {

    /**
     * The identifier of the action.
     */
    static id = 'force';

    /**
     * The name of the action.
     */
    static name = 'Force';

    /**
     * The tooltip of the action.
     */
    static tooltip = "Pas de défense";

    /**
     * Indicates others actions can't be performed.
     */
    static exclusive = true;

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
    static attack = 3;

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
        return "porte une attaque en force sur " + this.target.name + " avec " + this.weapon.name;
    }

}