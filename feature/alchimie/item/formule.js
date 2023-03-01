import { NephilimItemSheet } from "../../../module/item/base.js";
import { CustomHandlebarsHelpers } from "../../../module/common/handlebars.js";
import { Game } from "../../../module/common/game.js";
import { Science } from "../../science/science.js";

export class FormuleSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getData() {
        const data = super.getData();
        data.elements = Game.pentacle.elements;
        data.cercles = Science.cerclesOf('alchimie');
        data.substances = Game.alchimie.substances;
        data.catalyseurs = game.settings.get('neph5e', 'catalyseurs');
        return data;
    }

    /** 
     * @override
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
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
        const elements = [];
        const fst = formData["system.elements.[0]"];
        const snd = formData["system.elements.[1]"];
        elements.push(fst);
        delete formData["system.elements.[0]"];
        if (formData["system.cercle"] === "oeuvreAuBlanc") {
            elements.push(snd);
            delete formData["system.elements.[1]"];
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

        // Update object
        super._updateObject(event, formData);
    }

    static async onEdit(event, actor) {

        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const id = li.data("item-id");
        const item = CustomHandlebarsHelpers.getItem(id);

        // Create the dialog panel to display.
        const html = await renderTemplate("systems/neph5e/templates/item/formule.html", {
            item: item,
            system: item.system,
            debug: game.settings.get('neph5e', 'debug'),
            catalyseurs: game.settings.get('neph5e', 'catalyseurs'),
            elements: Game.pentacle.elements,
            cercles: Game.alchimie.cercles,
            substances: Game.alchimie.substances,
            difficulty: item.difficulty(actor)
        });

        // Display the action panel
        await new Dialog({
            title: game.i18n.localize('ITEM.TypeFormule'),
            content: html,
            buttons: {},
            default: null,
            close: () => {}

        }, {
            width: 600,
            height: 500
        }).render(true);

    }
}