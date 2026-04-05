import { CustomHandlebarsHelpers } from "../../../module/common/handlebars.js";
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
                elements: FormuleDataModel.defineSchema().elements.options.choices,
                elementsGS: ['quintessence', 'quintuple'],
                cercles: super.cerclesOf2('alchimie'),
                substances: FormuleDataModel.defineSchema().substance.choices,
                catalyseurs: game.settings.get('neph5e', 'catalyseurs')
            }
        }
    }

    /**
     * @override
     */
    activateListeners(html) {
        super.activateListeners(html);
        html.find('.item-drop-target').on("drop", this._onDrop.bind(this));
        html.find('.delete-variante').click(this._onDeleteVariante.bind(this));
        html.find('.edit-variante').click(this._onEditVariante.bind(this));
        html.find('.delete-catalyseur').click(this._onDeleteCatalyseur.bind(this));
    }

    /**
     * This function catches the drop on an formule. It can be
     *   - an other formule, that is a variante
     *   - a catalyseur
     * @param event The drop event.
     */
    async _onDrop(event) {
        event.preventDefault();
        const drop = await NephilimItemSheet.droppedItem(event.originalEvent);
        if (drop.type === "formule") {
            await this.item.updateItemRefs(drop.system, this.item.system.variantes, "system.variantes");
        }
        if (drop.type === "catalyseur") {
            await this.item.updateItemRefs(drop.system, this.item.system.catalyseurs, "system.catalyseurs");
        }
    }

    /**
     * This function catches the deletion of a catalyseur.
     */
     async _onDeleteCatalyseur(event) {
        const li = $(event.currentTarget).closest(".item");
        const id = li.data("item-id");
       await this.item.deleteItemRefs(event, this.item.system.catalyseurs, "system.catalyseurs");
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
     * This function catches the deletion of a variante.
     */
    async _onDeleteVariante(event) {
        const li = $(event.currentTarget).closest(".item");
        const type = li.data("item-type");
        const id = li.data("item-id");
        await this.item.deleteItemRefs(event, this.item.system.variantes, "system.variantes");
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