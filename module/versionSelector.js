import { DocumentTools } from "./documentTools.js"

export class VersionSelector extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {

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

    static async #onSubmit(event, form, formData) {
        event.preventDefault();
        //await game.settings.set("mon-module", "optionSelectionnee", formData.get("option"));
        console.log(formData);
        console.log(formData.get("version"));
        this.sheet.setVersion(formData.get("version"));
    }

    withSheet(sheet) {
        this.sheet = sheet;
        this.version = sheet.version;
        this.versions = DocumentTools.getVersions(sheet.document);
        return this;
    }

    /*
    get document() {
        return this.options.document
    }
        */

    /** 
     * @override
     */
    /*
    async _renderFrame(options) {
        console.log("_renderFrame");
    }
        */


    /** 
     * @override
     */
    /*
    async _onRender(context, options) {
        console.log("_onRender");
    }
        */


    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            versions: {
                current: this.version,
                all: this.versions
            }
        }
    }

}