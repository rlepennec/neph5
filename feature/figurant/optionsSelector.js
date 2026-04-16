import { Constants } from "../../module/common/constants.js"

export class OptionsSelector extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {

    constructor(options = {}) {
        super(options);
        this.sheet = null;
    }

    static DEFAULT_OPTIONS = {
        classes: ['nephilim'],
        position: {
            width: 600,
            height: 600
        },
        window: {
            resizable: true,
            title: 'Nephilim form'
        },
        tag: "form",
        form: {
            handler: OptionsSelector.#onSubmit,
            closeOnSubmit: true,
            submitOnChange: false
        },
        document: null,
    }

    static PARTS = {
        form: {
            template: `systems/neph5e/feature/figurant/options.hbs`,
        }
    }

    /**
     * @param {*} event    The event to handle.
     * @param {*} form     The form to use.
     * @param {*} formData 
     */
    static async #onSubmit(event, form, formData) {
        event.preventDefault();
        await this.sheet.setOptions(formData.get("theme"), formData.get("degatAutomatique"));
    }

    /**
     * @param {*} sheet The sheet to register. 
     * @returns the instance.
     */
    withSheet(sheet) {
        this.sheet = sheet;
        return this;
    }

    /** 
     * @override
     * @protected
     */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.themes = {
            current: this.sheet.document.system.options.theme,
            all: Constants.THEMES
        };
        context.degatAutomatique = this.sheet.document.system.options.degatAutomatique;
        return context;
    }

}