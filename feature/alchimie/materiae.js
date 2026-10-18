import { AbstractFeature } from "../core/abstractFeature.js";
import { Incarnations } from "../../feature/incarnation/incarnations.js";
import { Version } from "../../module/common/version.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { SimpleFeature } from "../core/simpleFeature.js";

/**
 * Une materia : un stock de materiae primae d'un élément.
 *
 * Le stock se transmet d'une incarnation à l'autre. Chaque incarnation qui l'a déposé ou
 * modifié en a son exemplaire, qui porte la VARIATION de quantité de son époque, positive ou
 * négative ; le stock affiché est la somme des variations de l'incarnation courante et des
 * antérieures actives (voir Incarnations.stock).
 */
export class Materiae extends SimpleFeature {

    /**
     * Déposée dans l'onglet, la materia apparaît à l'époque courante avec une variation de 0 :
     * le stock ne change pas (une nouvelle materia apparaît donc à 0). Déjà déposée à cette
     * époque, rien ne change.
     * @Override
     */
    async drop() {
        const incarnations = new Incarnations(this.actor);
        const materia = new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of a materiae")
            .withData("quantite", 0)
            .withoutData('description', 'element');
        if (incarnations.porte) {
            if (incarnations.courante == null) return;
            materia.withIncarnation(incarnations.courante);
        }
        await materia.create();
    }

    /**
     * @Override
     */
    getEmbeddedData() {
        return {
            readOnly: true
        }
    }

    /**
     * Les materiae à afficher : celles dont le stock est positif, et celles déposées ou
     * modifiées à l'époque courante (voir Incarnations.stocks). La quantité affichée est le
     * stock ; l'exemplaire est celui de l'époque courante, que la corbeille supprime.
     * @returns the data used to display the actor item.
     */
    static getAll(actor) {
        const items = [];
        for (const { sid, stock, propre } of new Incarnations(actor).stocks('materiae')) {
            const original = AbstractFeature.original(sid);
            if (original == null) continue;
            items.push({
                original: {
                    id: original.id,
                    sid: original.sid,
                    name: original.name,
                    element: Version.data(original).element
                },
                embedded: {
                    id: propre?.id ?? null,
                    quantite: stock
                }
            });
        }
        return items;
    }

}