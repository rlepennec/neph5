import { Constants } from "../../../module/common/constants.js";
import { DocumentIdentifier } from "../../../module/common/documentIdentifier.js";
import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class HabitusSheet extends NephilimItemSheet {

    static DEFAULT_OPTIONS = {
        classes: ["vk-habitus"],
        position: {
            width: 950,
            height: 720
        }
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/analogie/item/habitus.html`,
        }
    }

    /**
     * Applique le skin du Ka sur la fenêtre (le bandeau est hors de .item-root).
     * @override
     */
    async _onRender(context, options) {
        await super._onRender(context, options);
        this.element.classList.remove(...Constants.ELEMENTS.map(e => `skin-${e}`));
        const element = this.document.system.element;
        if (element) this.element.classList.add(`skin-${element}`);
    }

    /** 
     * @override
     */
    async _prepareContext(options) {
        return {
            ...await super._prepareContext(options),
            context: {
                cercles: super.cerclesOf('analogie'),
                elements: Constants.ELEMENTS_CHOIX
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
            case 'science':
                await this.document.deleteReference(identifier.fsid, this.document.system.voies, "system.voies");
                break;
        }
    }

    /**
     * This function catches the drop on an formule. It can be
     *   - an other formule, that is a variante
     *   - a catalyseur
     * @param event The drop event.
     */
    async _onDrop(event, document) {
        event.preventDefault();
        switch (document.type) {
            case "science":
                await this.document.updateItemRefs(document.system, this.document.system.voies, "system.voies");
                break;
        }
    }

    /**
     * @override
     */
    async _onSubmit(event, form, formData) {

        // Update voies
        let size = this.document.system.voies == null ? 0 : this.document.system.voies.length;
        const voies = [];
        for (let index = 0; index < size; index++) {
            const name = "system.voies.[" + index + "]";
            voies.push(formData.object[name]);
            delete formData.object[name];
        }
        formData.object["system.voies"] = voies;

        // Update object
        await this.document.update(formData.object);
    }

}