import { AbstractDialog } from "../core/abstractDialog.js";

export class EphemerideDialog extends AbstractDialog {

    /**
     * Constructor.
     */
    constructor() {
        super(null);
        this.data = {};
    }

    /**
     * @override
     */
    getData(options) {
        const data = duplicate(this.data);
        return data;
    }

    /**
     * @returns the default options to manage the dialog.
     */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["nephilim", "sheet"],
            template: "systems/neph5e/feature/ephemeride/ephemeride.hbs",
            width: 500,
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