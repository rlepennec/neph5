import { SimpleFeature } from "../../../core/simpleFeature.js";
import { Incarnations } from "../../../incarnation/incarnations.js";

export class Magie extends SimpleFeature {

    /**
     * La voie magique se dépose sur la fiche, dans l'onglet magie : elle devient celle de
     * l'incarnation courante (voir Incarnations.changerVoie). Ailleurs, le dépôt est ignoré.
     * @Override
     */
    async drop() {
        if (this.actor.sheet?.tabGroups?.primary !== 'magie') return;
        await new Incarnations(this.actor).changerVoie(this.sid, 'magie');
    }

}