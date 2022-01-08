import { Unarmed } from "./unarmed.js";
import { Game } from "../../common/game.js";

export class Immobiliser extends Unarmed {

    /**
     * The identifier of the action.
     */
    static id = 'immobiliser';

    /**
     * The tooltip of the action.
     */
    static tooltip = "1 dommage par round d'immobilisation";

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
    static effects = [
        {
            id: "immobilise"
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
     * @Override
     */
    sentence() {
        return "porte une immobilisation sur " + this.target.name;
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
     *  - The target is not immobilized
     */
    allowed() {

        return super.allowed() && !this.effectIsActiveOnTarget(Game.effects.immobilise);

    }

}