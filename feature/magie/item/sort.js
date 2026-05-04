import { DocumentIdentifier } from "../../../module/common/documentIdentifier.js";
import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";
import { SortDataModel } from "./sort.mjs";

export class SortSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        position: {
            width: 560,
            height: 500
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/magie/item/sort.html`,
        }
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                elements: SortDataModel.defineSchema().element.choices,
                cercles: super.cerclesOf('magie')
            }
        }
    }

    /**
     * @override
     */
    async _onDelete(event, target) {
        const identifier = new DocumentIdentifier(target);
        const document = identifier.toDocument();
        switch (document.type) {
            case 'magie':
                await this.document.deleteReference(identifier.fsid, this.document.system.voies, "system.voies");
                break;
        }
    }

    /**
     * This function catches the drop voie on a sort.
     * @param event The drop event.
     */
    async _onDrop(event, document) {
        event.preventDefault();
        switch (document.type) {
            case "magie":
                await this.document.updateItemRefs(document.system, this.document.system.voies, "system.voies");
                break;
        }
    }






    /**
     * @override
     */
    activateListeners(html) {
        super.activateListeners(html);
        html.find('.item-drop-target').on("drop", this._onDrop.bind(this));
        html.find('.delete-voie').click(this._onDelete.bind(this));
    }

    /**
     * @override
     */
    async _onSubmit(event, form, formData) {

        // Update voies
        if (formData.object["system.cercle"] === "basseMagie") {
            formData.object["system.voies"] = [];
        } else {
            let size = this.document.system.voies == null ? 0 : this.document.system.voies.length;
            const voies = [];
            for (let index = 0; index < size; index++) {
                const name = "system.voies.[" + index + "]";
                voies.push(formData.object[name]);
                delete formData.object[name];
            }
            formData.object["system.voies"] = voies;
        }

        // Update syntaxe & incantation
        if (formData.object["system.cercle"] !== "grandSecret") {
            formData.object['system.syntaxe'] = new foundry.data.operators.ForcedDeletion();
            formData.object['system.incantation'] = new foundry.data.operators.ForcedDeletion();
        }

        // Update object
        await this.document.update(formData.object);
    }

}