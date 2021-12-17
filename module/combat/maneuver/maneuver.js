import { Action } from "../action.js";

export class Maneuver extends Action {

    /**
     * The type of the action.
     */
    static type = Action.Types.maneuver.id;

    /**
     * Indicates a target must be selected.
     */
    static targeted = false;

}