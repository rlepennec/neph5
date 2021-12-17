import { Unarmed } from "./unarmed.js";
import { Game } from "../../common/game.js";

export class Projeter extends Unarmed {

    /**
     * The identifier of the action.
     */
    static id = 'projeter';

    /**
     * The name of the action.
     */
    static name = 'Projeter';

    /**
     * The tooltip of the action.
     */
    static tooltip = "A terre, 1 dommage en ignorant les protections";

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
            id: "projete"
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
    static impact = 0;

    /**
     *  @Override
     */
    sentence() {
        return "porte une projection sur " + this.target.name;
    }

    /**
     * @Override
     */
    impact() {
        return 0;
    }

    /**
     * @Override
     * 
     * To be allowed a frappe action must validate the following assertions:
     *  - The history of the round allows this action
     *  - Exactly one target has been selected
     *  - The token is not immobilized
     *  - The target is not on the ground
     */
    allowed() {

        return super.allowed() && !this.effectIsActiveOnTarget(Game.effects.projete);

    }

}