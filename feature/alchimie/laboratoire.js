export class Laboratoire {

    /**
     * The constructs.
     */
    static CORNUE = 'cornue';
    static CREUSET = 'creuset';
    static ATHANOR = 'athanor';
    static ALUDEL = 'aludel';
    static ALAMBIC = 'alambic';
    static CONSTRUCTS = [Laboratoire.CORNUE, Laboratoire.CREUSET, Laboratoire.ATHANOR, Laboratoire.ALUDEL, Laboratoire.ALAMBIC];

    /**
     * Constructor.
     * @param actor The actor which owns the laboratory.
     */
    constructor(actor) {
        this.actor = actor;
    }

    /**
     * @param construct The name of the construct to check.
     * @returns true if the construct is active.
     */
    isActive(construct) {
        return this.actor.system.alchimie.constructs[construct].active;
    }

    /**
     * @param actor The actor object for which to retrieve the laboratory.
     * @returns the laboratories.
     */
    static getAll(actor) {
        const all = [];
        for (let sid of actor.system.alchimie.laboratoires) {
            const _actor = game.actors.find(i => i.sid === sid);
            if (_actor != null) {
                all.push({
                    id: _actor.sid,
                    name: _actor.name,
                    active: actor.system.alchimie.courant === _actor.sid
                });
            }
        }
        return all;
    }

}