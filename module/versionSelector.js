import { DocumentTools } from "./documentTools.js"

export class VersionSelector extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {

    constructor(options = {}) {
        super(options);
        this.sheet = null;
        this.version = null;
        this.versions = null;
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
            handler: VersionSelector.#onSubmit,
            closeOnSubmit: true,
            submitOnChange: false
        },
        document: null,
    }

    static PARTS = {
        form: {
            template: `systems/neph5e/templates/version-selector.hbs`,
        }
    }

    /**
     * @param {*} event    The event to handle.
     * @param {*} form     The form to use.
     * @param {*} formData 
     */
    static async #onSubmit(event, form, formData) {
        event.preventDefault();
        this.sheet.setVersion(formData.get("version"));
    }

    /**
     * @param {*} sheet The sheet to register. 
     * @returns the instance.
     */
    withSheet(sheet) {
        this.sheet = sheet;
        this.version = sheet.version;
        this.versions = DocumentTools.getVersions(sheet.document);
        return this;
    }

    /** 
     * @override
     * @protected
     */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.versions = {
            current: this.version,
            all: this.versions
        };
        return context;
    }

}