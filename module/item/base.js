import { CustomHandlebarsHelpers } from "../common/handlebars.js";

const { api, sheets } = foundry.applications;

//const { HandlebarsApplicationMixin } = foundry.applications.api;
//const { ApplicationV2 } = foundry.applications.api;

//export class NephilimItemSheet extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {
//export class NephilimItemSheet extends HandlebarsApplicationMixin(ApplicationV2) {
//export class NephilimItemSheet extends foundry.ApplicationV2.sheets.i {


const { HandlebarsApplicationMixin } = foundry.applications.api
const { ItemSheetV2 } = foundry.applications.sheets

export class NephilimItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {

    static DEFAULT_OPTIONS = {
        classes: ["nephilim", "sheet", "item"],
        position: {
            height: 650,
            width: 400,
        },
        form: {
            //handler: NephilimItemSheet.#onSubmitForm,
            closeOnSubmit: true,
            submitOnChange: true,
        },
        editable: true,
        tag: "form",
        window: {
            resizable: true,
        },
    }

    /**
     * @constructor
     * @param  {...any} args
     */
    constructor(...args) {
        super(...args);
        this.embeddedData = {};
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        const context = await super._prepareContext(options)
        context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
            this.document.system.description,
            {
                secrets: this.document.isOwner,
                relativeTo: this.document
            }
        )
        return context
    }

}