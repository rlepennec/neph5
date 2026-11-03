import { SimpleFeature } from "../../../core/regles/v5/simpleFeature.js";
import { IncarnationsV5 } from "../../../incarnation/regles/v5/incarnations.js";

export class Magie extends SimpleFeature {

    /**
     * La voie magique se dépose sur la fiche, dans l'onglet magie : elle devient celle de
     * l'incarnation courante (voir IncarnationsV5.changerVoie). Ailleurs, le dépôt est ignoré.
     * @Override
     */
    async drop() {
        if (this.actor.sheet?.tabGroups?.primary !== 'magie') return;
        await new IncarnationsV5(this.actor).changerVoie(this.sid, 'magie');
    }

}