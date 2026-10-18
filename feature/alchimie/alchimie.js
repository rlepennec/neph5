import { SimpleFeature } from "../core/simpleFeature.js";
import { Incarnations } from "../../feature/incarnation/incarnations.js";

export class Alchimie extends SimpleFeature {

    /**
     * Constructor.
     * @param actor The actor which performs the action.
     */
    constructor(actor, item) {
        super(actor);
    }

    /**
     * La voie alchimique se dépose sur la fiche, dans l'onglet alchimie : elle devient celle de
     * l'incarnation courante (voir Incarnations.changerVoie). Ailleurs, le dépôt est ignoré.
     * @Override
     */
    async drop() {
        if (this.actor.sheet?.tabGroups?.primary !== 'alchimie') return;
        await new Incarnations(this.actor).changerVoie(this.sid, 'alchimie');
    }

}