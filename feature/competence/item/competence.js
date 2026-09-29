import { CompetenceDataModel } from "./competence.mjs";
import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";
import { Version } from "../../../module/common/version.js";

export class CompetenceSheet extends NephilimItemSheet {

    // Taille d'ouverture : voir module/item/positions.js (elle depend du style).

    /**
     * La compétence n'est pas éditable lorsqu'elle est ouverte depuis un acteur.
     * @override
     */
    get editableFromActor() {
        return false;
    }


    static PARTS = {
        main: {
            template: `systems/neph5e/feature/competence/item/competence.html`,
        }
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        // L'élément appartient désormais à la v5 : on lit ses choix là où le schéma les
        // déclare plutôt que de les redire ici.
        return {
            ...await super._prepareContext(options),
            context: {
                elements: CompetenceDataModel.defineSchema().versions.fields.v5.fields.element.choices,
            }
        }
    }

    /**
     * Le bandeau de la fenêtre est hors de .item-root : on applique le skin
     * du Ka sur la fenêtre elle-même pour qu'il en hérite les variables.
     * @override
     */
    async _onRender(context, options) {
        await super._onRender(context, options);
        // Le Ka dépend de la version affichée, et peut n'être pas défini : une version que
        // le modèle ne décrit pas encore n'a pas d'élément, donc pas de skin.
        this.applySkin(Version.data(this.document, this.version).element);
    }

}