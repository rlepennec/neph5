export class CombatHistory {

    /**
     * Constructor.
     */
    constructor() {
        this.manoeuvers = [];
    }

    /**
     * @param manoeuver The manoeuver to watch.
     * @returns true if the manoeuver is allowed according to the history.
     */
    isAllowed(manoeuver) {

        // Any manoeuver is allowed since no manoeuver has been done.
        if (this.manoeuvers.length === 0) return true;

        // Only the same exclusive manoeuver can be done.
        if (manoeuver.exclusive === true) {
            if (this.manoeuver.find(a.id !== manoeuver.id) != null) {
                return false;
            } else {
                return this.manoeuvers.length < manoeuver.number;
            }
        }

        // An exlusive manoeuver has already be done.
        if (this.manoeuvers.find(a => a.exclusive === true) != null) {
            return false;
        }

        // 
        //if (manoeuver.)
        //this.manoeuvers.find(a => a.id === action.id)


        

    }

}