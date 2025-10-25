import { CustomHandlebarsHelpers } from "../common/handlebars.js";

const { api, sheets } = foundry.applications;

export class NephilimItemSheet extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {

    static DEFAULT_OPTIONS = {
        classes: ["nephilim", "sheet", "item"],
        position: {
            height: 590,
            width: 400,
        },
        form: {
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
        console.log("_prepareContext");
        const context = await super._prepareContext(options);
        context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
            this.document.system.description,
            {
                secrets: game.user.isGM,
                relativeTo: this.document
            }
        )
        return context;
    }

}