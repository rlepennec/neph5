import { NephilimActor } from "./nephilimActor.js"
import { NephilimMixinSheet } from "./nephilimSheetMixin.js"
import { Incarnations } from "../feature/incarnation/item/incarnations.js";

export class NephilimActorSheet extends NephilimMixinSheet(foundry.applications.api.DocumentSheetV2) {

    static get documentClass() {
        return NephilimActor;
    }

    static DEFAULT_OPTIONS = {
        classes: ["actor"]
    }

    /** 
     * @override
     */
    async _onDrops(event) {
        throw new Error("_onMove method must be implemented");
    }

    /** 
     * @override
     */
    async _onDrop(event, document) {

        if (document.actor === this.document) {

            switch(document.type) {
                case 'incarnation': {
                    console.log(event);
                    await new Incarnations(this.document).move(event, document);
                    break;
                }
            }

        } else {

            switch(document.type) {
                case 'vecu': {
                    await new Incarnations(this.document).add(document);
                    break;
                }
            }

        }

    }

}