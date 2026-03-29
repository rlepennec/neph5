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

}