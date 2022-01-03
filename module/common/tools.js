/**
 * Gets the specified value by applying the specified path to the specified object.
 * @param object The object from which to apply the path.
 * @param path   The path to apply.
 * @return the specified value.
 */
export function getByPath(object, path) {
    path = path
        .replace(/\[/g, '.')
        .replace(/]/g, '')
        .split('.');
    path.forEach(function (level) {
        object = object[level];
        if (!object) {
            return object;
        }
    });
    return object;
}

/**
 * Defines a fast UUID generator compliant with RFC4122 version 4.
 */
export function UUID() {
    let lut = [];
    for (let i = 0; i < 256; i++) {
        lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
    }
    let d0 = Math.random() * 0xffffffff | 0;
    let d1 = Math.random() * 0xffffffff | 0;
    let d2 = Math.random() * 0xffffffff | 0;
    let d3 = Math.random() * 0xffffffff | 0;
    let result =
        lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
        lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + lut[d1 >> 16 & 0xff] + lut[d1 >> 24 & 0xff] + '-' +
        lut[d2 & 0xff] + lut[d2 >> 8 & 0xff] + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] + '-' +
        lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
    return result;
}

/**
 * Resets the metamorphe of the specified actor.
 * The metamorphe property must be defined for this actor. 
 * @param {*} actor 
 */
export async function setItemOf(actor, root, value, key = null) {
    if (key) {
        const data = duplicate(getByPath(actor.data.data, root));
        getByPath(data, key);
        value = data;
        const name = "data." + root;
        await actor.update({ [name]: data });
    } else {
        const name = "data." + root;
        await actor.update({ [name]: value });
    }

}

/**
 * Deletes the specified item from the specified actor collection.
 * Example:
 * root=magie, collection="sorts", key="refid"
 * @param actor      The owner actor of the item. 
 * @param root       The actor property which contains the collection.
 * @param key        The uuid of the item to delete.
 * @param value 
 * @param collection The optional name of the collection property which contains the collection.
 */
export async function deleteItemOf(actor, root, key, value, collection = null) {
    const data = getByPath(actor.data.data, root);
    if (data) {
        if (collection) {
            const index = getByPath(data, collection).findIndex(item => (getByPath(item, key) === value));
            if (index != -1) {
                const name = "data." + root;
                getByPath(data, collection).splice(index, 1);
                await actor.update({ [name]: data });
            }
        } else {
            const index = data.findIndex(item => (getByPath(item, key) === value));
            if (index != -1) {
                const name = "data." + root;
                data.splice(index, 1);
                await actor.update({ [name]: data });
            }
        }
    }
}

export async function droppedActor(event) {

    // Retrieve the dropped data id and type from the event
    let data = null;
    if (event.dataTransfer !== undefined) {
        try {
            data = JSON.parse(event.dataTransfer.getData('text/plain'));
        } catch (err) {
            return null;
        }
    }
    if (data === null || data.type !== "Actor") {
        return null;
    };

    let dataType = "";
    if (data.type === "Actor") {
        let actorData = {};
        // Case 1 - Import from a Compendium pack
        if (data.pack) {
            dataType = "compendium";
            const pack = game.packs.find(p => p.collection === data.pack);
            const packActor = await pack.getEntity(data.id);
            if (packActor != null) actorData = packActor.data;
        }

        // Case 3 - Import from World entity
        else {
            dataType = "world";
            actorData = game.actors.get(data.id).data;
        }

        return { from: dataType, data: actorData };

    } else {

        return null;
    }

}

/**
 * Retrieves the dropped item informations as follow:
 *  { 
 *    from: "compendium", "data" or "world",
 *    data: the item data
 *  }
 * @param {*} event The event to 
 */
export async function droppedItem(event) {

    // Retrieve the dropped data id and type from the event
    let data = null;
    if (event.dataTransfer !== undefined) {
        try {
            data = JSON.parse(event.dataTransfer.getData('text/plain'));
        } catch (err) {
            return null;
        }
    }
    if (data === null || data.type !== "Item") {
        return null;
    };

    let dataType = "";
    let itemData = {};
    // Case 1 - Import from a Compendium pack
    if (data.pack) {
        dataType = "compendium";
        const pack = game.packs.find(p => p.collection === data.pack);
        const packItem = await pack.getEntity(data.id);
        if (packItem != null) itemData = packItem.data;
    }

    // Case 2 - Data explicitly provided
    else if (data.data) {
        let sameActor = data.actorId === actor._id;
        if (sameActor && actor.isToken) sameActor = data.tokenId === actor.token.id;
        if (sameActor) return this._onSortItem(event, data.data); // Sort existing items

        dataType = "data";
        itemData = data.data;
    }

    // Case 3 - Import from World entity
    else {
        dataType = "world";
        itemData = game.items.get(data.id).data;
    }

    return { from: dataType, data: itemData };

}

/**
 * Updates the list of referenced items by adding the specified item.
 * Reset the degre to 0 if dropped again.
 * @param {*} item 
 * @param {*} itemData 
 * @param {*} refs 
 * @param {*} name 
 * @param {*} degres 
 */
export async function updateItemRefs(item, itemData, refs, name, degres) {

    // Retrieve the id of the dropped item
    const id = itemData.data.id;

    // Retrieve the current references of the current item
    const references = duplicate(refs);

    // Set the degre to 0 if drop again or add the reference
    const index = references.findIndex(i => (i.refid === id));

    if (index != -1) {
        if (degres === true) {
            references[index].degre = 0;
        }
    } else {
        if (degres === true) {
            references.push({ "refid": id, "degre": 0 });
        } else {
            references.push({ "refid": id });
        }
    }

    await item.update({ [name]: references });

}

/**
 * Deletes the reference of the objet to delete.
 * @param {*} event 
 * @param {*} references 
 * @param {*} name 
 */
export async function deleteItemRefs(item, event, references, name) {
    event.preventDefault();

    const button = event.currentTarget;
    if (button.disabled) return;

    // Retrieve the id of the reference to delete
    const li = $(event.currentTarget).closest('.item');
    const id = li.data("item-id");

    // Retrieve the current references of the item
    const refs = duplicate(references);

    // Remove the reference
    const index = refs.findIndex(i => (i.refid === id));
    if (index != -1) {
        refs.splice(index, 1);
    }

    // Update the references of the item
    await item.update({ [name]: refs });

}

/**
 * Deletes the references of the specified item for the specified type of items.
 * 
 * data.references = [
 *    {refid: ...,
 *     value: ...},
 *    {refid: ...,
 *     value: ...}
 * ]
 * 
 * @param type The type of item for which to delete the references.
 * @param name The name of the data for which to delete references.
 */
export function deleteItemReferences(data, type, name) {

    // For each item of the specified type
    Array
        .from(game.items.values())
        .filter(item => item.data.type === type)
        .forEach(async item => {

            // Retrieve the referenced data to process
            const references = duplicate(item.data.data[name]);

            // Retrieve the reference to the current object and delete it if it exists
            const index = Array
                .from(references)
                .findIndex(reference => (reference.refid === data.data.id));

            if (index != -1) {
                references.splice(index, 1);
                const newData = {};
                newData["data." + name] = references;
                await item.update(newData);
            }

        });

}