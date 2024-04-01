import { AbstractFeature } from "../core/abstractFeature.js";

export class AbstractFocus extends AbstractFeature {

    /**
     * Constructor.
     * @param actor   The actor which owns the focus.
     */
    constructor(actor) {
        super(actor);
    }

    /**
     * @param item The original or embedded item object, purpose of the action.
     * @returns the instance.
     */
    withItem(item) {
        if (item.actor == null) {
            return this.withOriginalItem(item);
        } else {
            return this.withEmbeddedItem(item);
        }
    }

    /**
     * @param item The original item object, purpose of the action.
     * @returns the instance.
     */
    withOriginalItem(item) {
        this.item = item;
        this.embedded = this.actor.items.find(i => i.sid === item.sid);
        return this;
    }

    /**
     * @param item The embedded item object, purpose of the action.
     * @returns the instance.
     */
    withEmbeddedItem(item) {
        this.embedded = item;
        this.item = game.items.find(i => i.sid === item.sid);
        return this;
    }

    /**
     * @param periode The system identifier of the periode to registrer.
     * @returns the instance.
     */
    withPeriode(periode) {
        this.periode = periode;
        return this;
    }

    /**
     * @Override
     */
    get uncastable() {
        return this.rawDegre < -99;
    }

    /**
     * @Override
     */
    get degre() {
        const degre = this.rawDegre;
        return degre < -99 ? 0 : degre;
    }

    /**
     * @return the degre, < 99 if uncastable.
     */
    get rawDegre() {
        return 0;
    }

    /**
     * @return 
     */
    get focusError() {
        switch(this.rawDegre) {
            case 100:
                return 'NEPH5E.erreur.internal'; // Erreur interne
            case 101:
                return 'NEPH5E.erreur.connu';    // Focus non dechiffré
            case 102:
                return 'NEPH5E.erreur.focus';    // Pas le focus necessaire
            case 103:
                return 'NEPH5E.erreur.magie';    // Pas le cercle de magie necessaire
            case 104:
                return 'NEPH5E.erreur.science';  // Voie de magie non compatible
            case 105:
                return 'NEPH5E.erreur.ka';       // Pas de Ka element necessaire
            case 106:
                return 'NEPH5E.erreur.sephirah'; // Pas la sephirah necessaire
            case 107:
                return 'NEPH5E.erreur.alchimie'; // Pas le cercle de alchimique necessaire
            case 108:
                return 'NEPH5E.erreur.constructActif';    // Pas le construct actif
            case 109:
                return 'NEPH5E.erreur.constructCercle';    // Pas le construct au cercle requis
            case 110:
                return 'NEPH5E.erreur.materiaePrimae';    // Pas les materiae primae necessaire
            case 111:
                return 'NEPH5E.erreur.constructKa';    // Pas les Ka du construct
            default:
                return 'NEPH5E.erreur.internal'; // Erreur interne
        }
    }


    /**
     * @return true if the focus can't be cast.
     */
    get uncastable() {
        return this.degre === 0;
    }

    /**
     * @Override
     */
    get purpose() {
        return this.item;
    }

    /**
     * @Override
     */
    async delete() {
        await this.deleteEmbeddedItem(this.sid);
    }

    /**
     * @Override
     */
    async drop() {

        // A periode must be defined
        if (this.periode == null) {
            return;
        }

        // The focus must not be defined for the current periode.
        if (this.actor.items.find(i => i.sid === this.item.sid && i.system.periode === this.embedded.periode) != null) {
            return;
        }

        // Retrieve the previous focus item if already defined.
        const previous = this.actor.items.find(i => i.sid === this.item.sid);

        // Create a new focus or move the focus to the new periode.
        await this._createEmbeddedItem(previous);

    }

    /**
     * Create a new embedded focus item or move it to the new periode.
     * @param previous The previous periode item.
     */
    async _createEmbeddedItem(previous) {
        throw new Error("AbstractFocus._createEmbeddedItem not implemented");
    }

}