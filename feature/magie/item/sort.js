import { DocumentIdentifier } from "../../../module/common/documentIdentifier.js";
import { Version } from "../../../module/common/version.js";
import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";
import { SortDataModel } from "./sort.mjs";

export class SortSheet extends NephilimItemSheet {

    // Taille d'ouverture : voir module/item/positions.js (elle depend du style).

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/magie/item/sort.html`,
        }
    }

    /**
     * @override
     */
    async _onRender(context, options) {
        await super._onRender(context, options);
        this.applySkin(Version.data(this.document, this.version).element);
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                elements: SortDataModel.defineSchema().element.choices,
                cercle: Version.data(this.document, this.version).cercle,
                cercles: super.cerclesOf('magie')
            }
        }
    }

    /**
     * @override
     */
    async _onDelete(event, target) {
        const identifier = new DocumentIdentifier(target);
        const document = identifier.toDocument();
        switch (document.type) {
            case 'magie':
                await this.document.deleteReference(identifier.fsid, Version.data(this.document, this.version).voies, Version.path(this.document, 'voies', this.version));
                break;
        }
    }

    /**
     * This function catches the drop voie on a sort.
     * @param event The drop event.
     */
    async _onDrop(event, document) {
        event.preventDefault();
        switch (document.type) {
            case "magie":
                await this.document.updateItemRefs(document.system, Version.data(this.document, this.version).voies, Version.path(this.document, 'voies', this.version));
                break;
        }
    }

    /**
     * @override
     */
    async _onSubmit(event, form, formData) {

        // Les champs du sort appartiennent à la version affichée : les clefs du formulaire
        // portent son préfixe, celui-là même que le gabarit a posé.
        const data = Version.data(this.document, this.version);
        const prefixe = Version.prefix(this.document, this.version);

        // Update voies
        if (formData.object[prefixe + ".cercle"] === "basseMagie") {
            formData.object[prefixe + ".voies"] = [];
        } else {
            let size = data.voies == null ? 0 : data.voies.length;
            const voies = [];
            for (let index = 0; index < size; index++) {
                const name = prefixe + ".voies.[" + index + "]";
                voies.push(formData.object[name]);
                delete formData.object[name];
            }
            formData.object[prefixe + ".voies"] = voies;
        }

        // Update syntaxe & incantation
        if (formData.object[prefixe + ".cercle"] !== "grandSecret") {
            formData.object[prefixe + '.syntaxe'] = new foundry.data.operators.ForcedDeletion();
            formData.object[prefixe + '.incantation'] = new foundry.data.operators.ForcedDeletion();
        }

        // Update object
        await this.document.update(formData.object);
    }

}