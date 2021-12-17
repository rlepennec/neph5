import { Melee } from "./melee.js";

export class Rapide extends Melee {

    /**
     * The identifier of the action.
     */
    static id = 'rapide';

    /**
     * The name of the action.
     */
    static name = 'Rapide';

    /**
     * The tooltip of the action.
     */
    static tooltip = "Deux attaques";

    /**
     * Indicates others actions can't be performed.
     */
    static exclusive = false;

    /**
     * Indicates the number of this action which can be performed.
     */
    static occurence = 2;

    /**
     * The effects produced by the action.
     */
    static effects = [];

    /**
     * The attack modifier.
     */
    static attack = -2;

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
        return "porte une attaque rapide sur " + this.target.name + " avec " + this.weapon.name;
    }

}