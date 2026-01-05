import { Tools } from "../common/tools.js"

export class DocumentTools {

    static async update(document, updates) {
        if (Tools.isObjectNotEmpty(updates)) {
            await document.update(updates);
        }
    }

    static getField(document, field, defaultValue) {
        return Tools.getObjectPropertyFromPath(document, field.fieldPath, defaultValue);
    }

    static async droppedDocument(event) {

        // Retrieve the dropped data id and type from the event
        let data = null;
        if (event.dataTransfer != null) {
            try {
                data = JSON.parse(event.dataTransfer.getData('text/plain'));
            } catch (err) {
                return null;
            }
        }
        if (data == null || data.type !== "Item") {
            return null;
        };

        let dataType = "";
        let originalData = {};
        // Case 1 - Import from a Compendium pack
        if (data.pack) {
            dataType = "compendium";
            const pack = game.packs.find(p => p.collection === data.pack);
            const packItem = await pack.getEntity(data.id);
            if (packItem != null) originalData = packItem.data;
            return { from: dataType, data: originalData };

            // Case 2 - Data explicitly provided
        } else if (data.system) {
            /*
            let sameActor = data.actorId === actor._id;
            if (sameActor && actor.isToken) sameActor = data.tokenId === actor.token.id;
            if (sameActor) return this._onSortItem(event, data.system); // Sort existing items

            dataType = "data";
            originalData = data.system;
            */
            return { from: dataType, data: originalData };
        }

        // Case 3 - Import from World entity
        else {
            return fromUuidSync(data.uuid);
        }

    }

}