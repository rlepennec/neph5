import { AbstractDialog } from "../core/abstractDialog.js";

export class RechercheDialog extends AbstractDialog {

    /**
     * Constructor.
     */
    constructor() {
        super(null);
    }

    /**
     * @override
     */
    getData(options) {
        return {
            isGM: game.user.isGM
        }
    }

    /**
     * @returns the default options to manage the dialog.
     */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["nephilim", "sheet"],
            template: "systems/neph5e/feature/recherche/recherche.hbs",
            width: 1030,
            height: "auto",
            choices: {},
            allowCustom: true,
            minimum: 0,
            maximum: null,
            closeOnSubmit: false,
            resizable: true
        });
    }

}