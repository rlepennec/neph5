import { Melee } from "./melee.js";

export class Desarmement extends Melee {

    /**
     * The identifier of the action.
     */
    static id = 'desarmement';

    /**
     * The name of the action.
     */
    static name = 'Désarmement';

    /**
     * The tooltip of the action.
     */
    static tooltip = "Désarme l'adversaire";

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
    static effects = [
        {
            id: "desarme"
        }
    ];

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
    static impact = null;

    /**
     * @Override
     */
    sentence() {
        return "désarme " + this.target.name;
    }

}