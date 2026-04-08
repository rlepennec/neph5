import { Constants } from "../../../module/common/constants.js";
import { CustomHandlebarsHelpers } from "../../../module/common/handlebars.js";
import { DocumentIdentifier } from "../../../module/common/documentIdentifier.js";
import { FormuleDataModel } from "./formule.mjs";
import { NephilimItemSheet } from "../../../module/item/base.js";

export class FormuleSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 650,
            height: 500
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/alchimie/item/formule.html`,
        }
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                elements: Constants.ELEMENTS,
                elementsGS: Constants.ELEMENTS_GRAND_OEUVRE,
                cercles: super.cerclesOf('alchimie'),
                substances: FormuleDataModel.defineSchema().substance.choices,
                catalyseurs: game.settings.get('neph5e', 'catalyseurs')
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
            case 'formule':
                await this.document.deleteReference(identifier.fsid, this.document.system.variantes, "system.variantes");
                break;
            case "catalyseur":
                await this.document.deleteReference(identifier.fsid, this.document.system.catalyseurs, "system.catalyseurs");
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
            case "formule":
                await this.document.updateItemRefs(document.system, this.document.system.variantes, "system.variantes");
                break;
            case "catalyseur":
                await this.document.updateItemRefs(document.system, this.document.system.catalyseurs, "system.catalyseurs");
                break;
        }
    }

    /**
     * The function opens the sheet of the variante.
     * @param {*} event 
     */
    async _onEditVariante(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const item = CustomHandlebarsHelpers.getItem(id);
        await item.sheet.render(true);
    }

    /**
     * @override
     */
    async _onSubmit(event, form, formData) {

        // Update elements
        const fst = formData.object["system.elements.[0]"];
        const elements = fst == null ? this.document.system.elements : [];
        if (fst != null) {
            const snd = formData.object["system.elements.[1]"];
            elements.push(fst);
            delete formData.object["system.elements.[0]"];
            if (formData.object["system.cercle"] === "oeuvreAuBlanc") {
                elements.push(snd);
                delete formData.object["system.elements.[1]"];
            }
        }
        formData.object["system.elements"] = elements;

        // Update catalyseurs
        let size = this.document.system.catalyseurs == null ? 0 : this.document.system.catalyseurs.length;
        const catalyseurs = [];
        for (let index = 0; index < size; index++) {
            const name = "system.catalyseurs.[" + index + "]";
            catalyseurs.push(formData.object[name]);
            delete formData.object[name];
        }
        formData.object["system.catalyseurs"] = catalyseurs;

        // Update variantes
        size = this.document.system.variantes == null ? 0 : this.document.system.variantes.length;
        const variantes = [];
        for (let index = 0; index < size; index++) {
            const name = "system.variantes.[" + index + "]";
            variantes.push(formData.object[name]);
            delete formData.object[name];
        }
        formData.object["system.variantes"] = variantes;

        // Update echec & maladresse
        if (formData.object["system.cercle"] !== "oeuvreAuRouge") {
            formData.object['system.echec'] = new foundry.data.operators.ForcedDeletion();
            formData.object['system.maladresse'] = new foundry.data.operators.ForcedDeletion();
        }

        // Update object
        await this.document.update(formData.object);

    }

}