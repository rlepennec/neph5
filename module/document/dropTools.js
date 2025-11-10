import { UUIDReferenceField } from "../common/UUIDReferenceField.js"
import { Tools } from "../common/tools.js"

export class DropTools {

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
            return await fromUuid(data.uuid);
        }

    }

    // Remove the specified reference from the specified document
    /**
     * 
     * @param {*} document  The document from which to remove the object.
     * @param {*} reference The reference of the object to remove.
     */
    static async deleteDocumentReference(document, reference) {

        let updates = {};

        Object.entries(document.system.schema.fields).every(([fieldName, field]) => {
            if (field instanceof foundry.data.fields.SetField) {
                if (field.element instanceof UUIDReferenceField) {
                    if (field.element.collection === reference.documentName && field.element.type === reference.type) {
                        if (field.element.deletable) {
                            updates["system." + fieldName] = new Set(document.system[fieldName]).filter(v => v != reference.id);
                        }
                        return false;
                    }
                }
            }
            return true;
        })

        if (Tools.isObjectNotEmpty(updates)) {
            await document.update(updates);
        }

    }

}