export async function droppedActor(event) {

    // Retrieve the dropped data id and type from the event
    let data;
    try {
        data = JSON.parse(event.originalEvent.dataTransfer.getData('text/plain'));
        if (data.type !== "Actor") null;
    } catch (err) {
        return null;
    }

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

        return { from: dataType, data:  actorData };

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
    let data;
    try {
        data = JSON.parse(event.originalEvent.dataTransfer.getData('text/plain'));
        if (data.type !== "Item") null;
    } catch (err) {
        return null;
    }

    let dataType = "";
    if (data.type === "Item") {
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

        return { from: dataType, data:  itemData };

    } else {

        return null;
    }

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
export async function updateRefs(item, itemData, refs, name, degres) {

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
            references.push( { "refid" : id, "degre": 0} );
        } else {
            references.push( { "refid" : id } );
        }
    }

    await item.update({[name]: references});

}

/**
 * Deletes the reference of the objet to delete.
 * @param {*} event 
 * @param {*} references 
 * @param {*} name 
 */
export async function deleteRefs(item, event, references, name) {
    event.preventDefault();

    const button = event.currentTarget;
    if (button.disabled) return;

    // Retrieve the id of the reference to delete
    const id = event.currentTarget.attributes["data-item-id"].value;

    // Retrieve the current references of the item
    const refs = duplicate(references);

    // Remove the reference
    const index = refs.findIndex(i => (i.refid === id));
    if (index != -1) {
        refs.splice(index, 1);
    }

    // Update the references of the item
    await item.update({[name]: refs});

}

/**
 * Deletes the reference of the objet to delete.
 * @param {*} event 
 * @param {*} references 
 * @param {*} name 
 */
export async function deleteRefs2(item, event, references, name) {
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
    await item.update({[name]: refs});

}

export function updateFormData(formData, references, name, regexp, degres) {
    if (degres === true) {
        const refs = duplicate(references);
        for (const [key, value] of Object.entries(formData)) {
            const item = key.match(regexp);
            if (item != null) {
                const index = item[1];
                const i = parseInt(item[1], 10);
                refs[i].degre = parseInt(formData[name + ".[" + index + "].degre"]);
                delete formData[name + ".[" + i + "].degre"];
                delete formData[name + ".[" + i + "].refid"];
            }
        }
        formData[name] = refs;
    } else {
        formData[name] = duplicate(references);
    }
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
export function deleteReferences(data, type, name) {

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