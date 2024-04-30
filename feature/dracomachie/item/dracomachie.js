import { NephilimItemSheet } from "../../../module/item/base.js";

export class DracomachieSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getOriginalData() {
        return {
            cercles: super.cerclesOf('dracomachie')
        }
    }

    /** 
     * @override
     */
	static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 560,
            height: 600,
            classes: ["nephilim", "sheet", "item"],
            resizable: true,
            scrollY: [".tab.description"],
            tabs: [{navSelector: ".sheet-navigation", contentSelector: ".article-body", initial: "description"}]
      });
    }

    /** 
     * @override
     */
    get template() {
        return `systems/neph5e/feature/dracomachie/item/dracomachie.html`;
    }

    /**
     * @override
     */
    _updateObject(event, formData) {

        // Set element for passes
        if (formData["system.cercle"] === "dracomachie@passes" || formData["system.cercle"] === "dracomachie@charmes") {
            formData['system.element'] = "choix"
        } else {
            formData['system.-=element'] = null;
            formData['system.-=degre'] = null;
        }

        // Update object
        super._updateObject(event, formData);
    }

}