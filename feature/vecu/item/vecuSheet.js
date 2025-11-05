import { NephilimItemSheet } from "../../../module/item/nephilimItemSheet.js";

export class VecuSheet extends NephilimItemSheet {

    static #ID = 'vecu';

    static DEFAULT_OPTIONS = {
        id: this.#ID,
        classes: [this.#ID],
        position: {
            height: 500,
            width: 590,
        },
    }

    static PARTS = {
        main: {
            template: `systems/neph5e/feature/${this.#ID}/item/${this.#ID}Sheet.html`,
        }
    }

   // async _onDrop(event) {
    //    event.preventDefault();
    //    super._onDrop(event);
        //console.log(event);
        /*
        const drop = await NephilimItemSheet.droppedItem(event.originalEvent);
        if (drop?.type === "competence") {
            await this.item.updateItemRefs(drop.system, this.item.system.competences, "system.competences");
        } else if (drop?.type === "periode") {
            await this.item.update({ ['system.periode']: drop.sid });
        }
        */
    //}

}