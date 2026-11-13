import { DocumentIdentifier } from "../../../common/documentIdentifier.js";
import { FeatureBuilder } from "../../../../feature/core/regles/v5/featureBuilder.js";
import { IncarnationsV5 } from "../../../../feature/incarnation/regles/v5/incarnations.js";
import { NephilimActorSheet } from "../../nephilimActorSheet.js";
import { NephilimItem } from "../../../item/nephilimItem.js";
import { VecuDataModel } from "../../../../feature/vecu/item/vecu.mjs";

/**
 * La fiche d'acteur des règles v5, base des fiches de figure, de figurant et de fraternité : ce
 * que la fiche commune (NephilimActorSheet) ne sait pas des règles.
 */
export class FicheActeurV5 extends NephilimActorSheet {

    static VERSION = 'v5';

    /**
     * @override
     */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const regles = this.document.regles;
        // Les Ka : ceux de l'incarnation courante pour une figure (voir ActeurV5.kas). Les
        // gabarits les lisent ici, et non dans data : ils ne sont plus portés par l'acteur.
        context.ka = regles.kas;
        // Les bonus de même : ceux de l'incarnation courante pour une figure
        context.bonus = regles.bonus;
        // Les blessures de même : celles de l'incarnation courante pour une figure
        context.blessures = regles.blessures;
        // Le laboratoire de même : celui de l'incarnation courante pour une figure
        context.alchimie = regles.alchimie;
        // Les voyages akashiques de même
        context.akasha = regles.akasha;
        return context;
    }

    /**
     * @override
     * Ouvre la fiche d'un document référencé. Pour un item embarqué dans cet acteur,
     * on passe par sa feature plutôt que par sheet.render() : c'est elle qui fournit
     * les données du contexte acteur (chronologie des périodes, degré, readOnly).
     * Sans cela, la fiche s'ouvre sans ces informations.
     *
     * Tous les items n'ont pas de feature : une arme, une armure n'en ont pas, rien ne vient
     * donc enrichir leur fiche, et elle s'ouvre telle quelle comme n'importe quel document
     * référencé.
     */
    async _onOpenLink(event, target) {
        const identifier = new DocumentIdentifier(target);
        const document = identifier.toDocument();
        if (document?.isEmbedded === true && document.parent === this.document) {
            const feature = new FeatureBuilder(this.document)
                .withScope("actor")
                .withEmbeddedItem(identifier.id)
                .withOriginalItem(identifier.sid)
                .create();
            if (feature != null) {
                return await feature.editEmbeddedItem();
            }
        }
        await super._onOpenLink(event, target);
    }

    /**
     * @override
     * Une arme, une armure appartiennent à l'incarnation courante (voir IncarnationsV5).
     */
    static async _onDropItem(event, document) {
        event.preventDefault();
        const data = document.toObject();
        NephilimItem.initializeEmbedded(data);
        // Un vécu déposé repart du degré 0
        if (data.type === 'vecu') VecuDataModel.initializeEmbedded(data);
        if (!new IncarnationsV5(this.document).lierEquipement(data)) {
            ui.notifications.warn(game.i18n.localize("NEPHILIM.equipementSansIncarnation"));
            return;
        }
        await this.document.createEmbeddedDocuments("Item", [data]);
    }

}
