import { Version } from "../../module/common/version.js";

export class Laboratoire {

    /**
     * The constructs.
     */
    static CORNUE = 'cornue';
    static CREUSET = 'creuset';
    static ATHANOR = 'athanor';
    static ALUDEL = 'aludel';
    static ALAMBIC = 'alambic';

    /**
     * The substances.
     */
    static AMBRE = 'ambre';
    static LIQUEUR = 'liqueur';
    static METAL = 'metal';
    static POUDRE = 'poudre';
    static VAPEUR = 'vapeur';
    static SUBSTANCES = [Laboratoire.AMBRE, Laboratoire.LIQUEUR, Laboratoire.METAL, Laboratoire.POUDRE, Laboratoire.VAPEUR];

    /**
     * The construct of each substance.
     */
    static CONSTRUCTS = new Map([
        [Laboratoire.AMBRE, Laboratoire.CORNUE],
        [Laboratoire.LIQUEUR, Laboratoire.ALAMBIC],
        [Laboratoire.METAL, Laboratoire.CREUSET],
        [Laboratoire.POUDRE, Laboratoire.ATHANOR],
        [Laboratoire.VAPEUR, Laboratoire.ALUDEL]
    ]);

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
        return this.actor.alchimie.constructs[construct].active;
    }

    /**
     * @param actor The actor object for which to retrieve the laboratory.
     * @returns the laboratories.
     */
    static getAll(actor) {
        const all = [];
        for (let sid of actor.alchimie.laboratoires) {
            const _actor = game.actors.find(i => i.sid === sid);
            if (_actor != null) {
                all.push({
                    id: _actor.sid,
                    name: _actor.name,
                    active: actor.alchimie.courant === _actor.sid
                });
            }
        }
        return all;
    }

    /**
     * Gets the construct associated with the specified substance.
     * @param substance The substance of the construct to get.
     * @returns the construct.
     */
    getConstruct(substance) {
        const construct = Laboratoire.CONSTRUCTS.get(substance);
        return construct == null ? undefined : this.actor.alchimie.constructs[construct];
    }

    /**
     * @param element The element for which to retrieve the max MP.
     * @returns the maximum number of materiae primae.
     */
    getMaxBaseMP(element) {
        return this.actor.science('oeuvreAuNoir') +
            this.actor.science('oeuvreAuBlanc') +
            this.actor.science('oeuvreAuRouge') +
            this.actor.kas[element];
    }

}