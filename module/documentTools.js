import { Models } from "../models.js"

export class DocumentTools {

    static isObjectEmpty(object) {
        return object && Object.keys(object).length === 0 && object.constructor === Object;
    }

    static isObjectNotEmpty(object) {
        return DocumentTools.isObjectEmpty(object) === false;
    }

    /**
     * Gets the specified property value from the specified object.
     * @param {*} object The object from which to get the property value.
     * @param {*} path The path of the property to get
     * @param {*} defaultValue The default value if the property is not found.
     * @returns the property or the default value.
     */
    static getObjectPropertyFromPath(object, path, defaultValue) {
        const words = path.split(".");
        let current = object;
        for (var i = 0; i < words.length; i++) {
            if (!current[words[i]]) return defaultValue;
            current = current[words[i]];
        }
        return current;
    }

    static getVersions(document) {
        const schema = Models.getData(document).defineSchema();
        return Object.getOwnPropertyNames(schema.versions.fields);
    }

    static async update(document, updates) {
        if (DocumentTools.isObjectNotEmpty(updates)) {
            await document.update(updates);
        }
    }

    static getField(document, field, defaultValue) {
        return DocumentTools.getObjectPropertyFromPath(document, field.fieldPath, defaultValue);
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