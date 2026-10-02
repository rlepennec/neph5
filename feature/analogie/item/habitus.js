import { DocumentIdentifier } from "../../../module/common/documentIdentifier.js";
import { Version } from "../../../module/common/version.js";
import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";
import { HabitusDataModel } from "./habitus.mjs";

export class HabitusSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        // Taille d'ouverture : voir module/item/positions.js (elle depend du style).
        classes: ["vk-habitus"]
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/analogie/item/habitus.html`,
        }
    }

    /**
     * Applique le skin du Ka sur la fenêtre (le bandeau est hors de .item-root).
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
                cercles: super.cerclesOf('analogie'),
                elements: HabitusDataModel.defineSchema().element.choices
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
            case 'science':
                await this.document.deleteReference(identifier.fsid, Version.data(this.document, this.version).voies, Version.path(this.document, 'voies', this.version));
                break;
        }
    }

    /**
     * This function catches the drop on an formule. It can be
     *   - an other formule, that is a variante
     *   - a catalyseur
     * @param event The drop event.
     */
    async _onDrop(event, document) {
        event.preventDefault();
        switch (document.type) {
            case "science":
                await this.document.updateItemRefs(document.system, Version.data(this.document, this.version).voies, Version.path(this.document, 'voies', this.version));
                break;
        }
    }

    /**
     * @override
     */
    async _onSubmit(event, form, formData) {

        // Les voies appartiennent à la version affichée : les clefs du formulaire portent
        // son préfixe, celui-là même que le gabarit a posé.
        const data = Version.data(this.document, this.version);
        const prefixe = Version.prefix(this.document, this.version);

        // Update voies
        let size = data.voies == null ? 0 : data.voies.length;
        const voies = [];
        for (let index = 0; index < size; index++) {
            const name = prefixe + ".voies.[" + index + "]";
            voies.push(formData.object[name]);
            delete formData.object[name];
        }
        formData.object[prefixe + ".voies"] = voies;

        // Update object
        await this.document.update(formData.object);
    }

}