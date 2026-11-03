import { SimpleFeature } from "../../../core/regles/v5/simpleFeature.js";
import { IncarnationsV5 } from "../../../incarnation/regles/v5/incarnations.js";

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
     * l'incarnation courante (voir IncarnationsV5.changerVoie). Ailleurs, le dépôt est ignoré.
     * @Override
     */
    async drop() {
        if (this.actor.sheet?.tabGroups?.primary !== 'alchimie') return;
        await new IncarnationsV5(this.actor).changerVoie(this.sid, 'alchimie');
    }

}