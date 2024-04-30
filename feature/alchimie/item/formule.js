import { CustomHandlebarsHelpers } from "../../../module/common/handlebars.js";
import { Game } from "../../../module/common/game.js";
import { NephilimItemSheet } from "../../../module/item/base.js";

export class FormuleSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getOriginalData() {
        return {
            elements: Game.pentacle.elements,
            elementsGS: {
                quintessence: "NEPH5E.quintessence",
                quintuple:    "NEPH5E.quintuple"
            },
            cercles: super.cerclesOf('alchimie'),
            substances: Game.alchimie.substances,
            catalyseurs: game.settings.get('neph5e', 'catalyseurs')
        }
    }

    /** 
     * @override
     */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 650,
            height: 500,
            classes: ["nephilim", "sheet", "item"]
        });
    }

    /** 
     * @override
     */
    get template() {
        return `systems/neph5e/feature/alchimie/item/formule.html`;
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
    _updateObject(event, formData) {

        // Update elements
        const fst = formData["system.elements.[0]"];
        const elements = fst == null ? this.item.system.elements : [];
        if (fst != null) {
            const snd = formData["system.elements.[1]"];
            elements.push(fst);
            delete formData["system.elements.[0]"];
            if (formData["system.cercle"] === "oeuvreAuBlanc") {
                elements.push(snd);
                delete formData["system.elements.[1]"];
            }
        }
        formData["system.elements"] = elements;

        // Update catalyseurs
        let size = this.item.system.catalyseurs == null ? 0 : this.item.system.catalyseurs.length;
        const catalyseurs = [];
        for (let index = 0; index < size; index++) {
            const name = "system.catalyseurs.[" + index + "]";
            catalyseurs.push(formData[name]);
            delete formData[name];
        }
        formData["system.catalyseurs"] = catalyseurs;

        // Update variantes
        size = this.item.system.variantes == null ? 0 : this.item.system.variantes.length;
        const variantes = [];
        for (let index = 0; index < size; index++) {
            const name = "system.variantes.[" + index + "]";
            variantes.push(formData[name]);
            delete formData[name];
        }
        formData["system.variantes"] = variantes;

        // Update echec & maladresse
        if (formData["system.cercle"] !== "oeuvreAuRouge") {
            formData['system.-=echec'] = null;
            formData['system.-=maladresse'] = null;
        }

        // Update object
        super._updateObject(event, formData);
    }

}