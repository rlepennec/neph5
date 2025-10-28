import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class CompetenceSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        id: "competence",
        classes: ["nephilim", "sheet", "item", "competence"],
        position: {
            height: 500,
            width: 590,
        },
        form: {
            closeOnSubmit: false,
            submitOnChange: true,
        },
        editable: true,
        tag: "form",
        window: {
            resizable: true,
        },
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/competence/item/competenceSheet.html`,
        }
    }

}