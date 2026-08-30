import { Competence } from "../../competence/competence.js";
import { Vecu } from "../../vecu/vecu.js";

export class Combat {

    /**
     * Constructor.
     * @param actor   The actor object which performs the combat.
     * @param attack  The initial attack, purpose of the action.             
     */
    constructor(actor) {
        this.actor = actor;
    }

    /**
     * @param item The embedded vecu or competence. 
     * @returns the degre of the vecu or the competence, 0 if not owned.
     */
    degreOf(item) {
        if (item == null) {
            return 0;
        }
        switch (this.actor.type) {
            case 'figure':
                switch (item?.type) {
                    case 'competence':
                        return new Competence(this.actor, item).degre;
                    case 'vecu':
                        const vecu = this.actor.items.find(i => i.sid === item.sid);
                        return vecu == null ? 0 : new Vecu(this.actor, 'actor').withItem(vecu).degre;
                    default:
                        return 0;
                }
            case 'figurant':
                if (item?.name === 'Menace') {
                    return this.actor.system.menace;
                }
        }
    }

}