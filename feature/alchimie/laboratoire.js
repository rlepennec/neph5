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
        return Version.data(this.actor).alchimie.constructs[construct].active;
    }

    /**
     * @param actor The actor object for which to retrieve the laboratory.
     * @returns the laboratories.
     */
    static getAll(actor) {
        const all = [];
        for (let sid of Version.data(actor).alchimie.laboratoires) {
            const _actor = game.actors.find(i => i.sid === sid);
            if (_actor != null) {
                all.push({
                    id: _actor.sid,
                    name: _actor.name,
                    active: Version.data(actor).alchimie.courant === _actor.sid
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
        switch (substance) {
            case Laboratoire.AMBRE:
                return Version.data(this.actor).alchimie.constructs.cornue;
            case Laboratoire.LIQUEUR:
                return Version.data(this.actor).alchimie.constructs.alambic;
            case Laboratoire.METAL:
                return Version.data(this.actor).alchimie.constructs.creuset;
            case Laboratoire.POUDRE:
                return Version.data(this.actor).alchimie.constructs.athanor;
            case Laboratoire.VAPEUR:
                return Version.data(this.actor).alchimie.constructs.aludel;
        }
    }

    /**
     * @param element The element for which to retrieve the max MP.
     * @returns the maximum number of materiae primae.
     */
    getMaxBaseMP(element) {
        return this.actor.science('oeuvreAuNoir') +
            this.actor.science('oeuvreAuBlanc') +
            this.actor.science('oeuvreAuRouge') +
            Version.data(this.actor).ka[element];
    }

}