import { CustomHandlebarsHelpers } from "../../../module/common/handlebars.js";
import { NephilimItemSheet } from "../../../module/item/base.js";

export class TekhneSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getData() {
        const data = super.getData();
        data.cercles = CustomHandlebarsHelpers.cerclesOf('tekhne', true);
        return data;
    }

    /** 
     * @override
     */
	static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 560,
            height: 600,
            classes: ["nephilim", "sheet", "item"],
            resizable: true,
            scrollY: [".tab.description"],
            tabs: [{navSelector: ".tabs", contentSelector: ".sheet-body", initial: "description"}]
      });
    }

    /** 
     * @override
     */
    get template() {
        return `systems/neph5e/feature/coupe/item/tekhne.html`;
    }

}