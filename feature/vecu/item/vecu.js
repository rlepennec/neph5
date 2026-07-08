import { Constants } from "../../../module/common/constants.js";
import { DocumentIdentifier } from "../../../module/common/documentIdentifier.js";
import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";
import { Mnemos } from "./mnemos.js";

export class VecuSheet extends NephilimItemSheet {

static DEFAULT_OPTIONS = {
        position: {
            width: 560,
            height: 500
        },
        actions: {
            addMnemos: VecuSheet._onAddMnemos,
            editMnemos: VecuSheet._onEditMnemos,
            deleteMnemos: VecuSheet._onDeleteMnemos
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/vecu/item/vecu.html`,
        }
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                elements: Constants.ELEMENTS
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
            case 'competence':
                await this.document.deleteReference(identifier.fsid, this.document.system.competences, "system.competences");
                break;
        }
    }

    /**
     * This function catches the drop on a periode. The dropped item can be
     *   - a periode
     *   - a competence
     * @param event    The drop event.
     * @param document The document identifier which has been dropped.
     */
	async _onDrop(event, document) {
        event.preventDefault();
        switch (document.type) {
            case "competence":
                await this.document.updateItemRefs(document.system, this.document.system.competences, "system.competences");
                break;
            case "periode":
                await this.document.updateItemRef('periode', document.sid);
                break;
        }
    }

    /**
     * Supprime un mnémos de la liste.
     */
    static async _onDeleteMnemos(event, target) {
        const index = target.closest('[data-item-id]')?.dataset.itemId;
        const system = foundry.utils.duplicate(this.document.system);
        system.mnemos.splice(Number(index), 1);
        await this.document.update({ system: system });
        this.document.sheet.render(true);
    }

    /**
     * Ouvre le dialogue d'ajout d'un mnémos.
     */
    static async _onAddMnemos(event, target) {
        new Mnemos(this.document.parent, this.document).render(true);
    }

    /**
     * Ouvre le dialogue d'édition d'un mnémos.
     */
    static async _onEditMnemos(event, target) {
        const index = target.closest('[data-item-id]')?.dataset.itemId;
        new Mnemos(this.document.parent, this.document, Number(index)).render(true);
    }

    /**
     * @override
     */
    async _onSubmit(event, form, formData) {

        // Update competences
        let size = this.document.system.competences.length;
        const competences = [];
        for (let index = 0; index < size; index++) {
            const name = "system.competences.[" + index + "]";
            competences.push(formData.object[name]);
            delete formData.object[name];
        }
        formData.object["system.competences"] = competences;

        // Update mnemos
        if (this.document.system.mnemos != null) {
            size = this.document.system.mnemos.length;
            const mnemos = [];
            for (let index = 0; index < size; index++) {
                const key = "system.mnemos.[" + index + "].";
                mnemos.push({
                    name: formData.object[key + "name"],
                    degre: formData.object[key + "degre"],
                    description: formData.object[key + "description"],
                });
                delete formData.object[key + "name"];
                delete formData.object[key + "degre"];
                delete formData.object[key + "description"];
            }
            formData.object["system.mnemos"] = mnemos;
        }

        // Update object
        await this.document.update(formData.object);
    }

}