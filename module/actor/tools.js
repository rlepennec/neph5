import { getByPath } from "../common/tools.js";

/**
 * Example:
 * root=magie, collection="sorts", key="refid"
 * @param actor 
 * @param root 
 * @param key
 * @param value 
 * @param collection 
 */
export async function deleteItemOf(actor, root, key, value, collection = null) {
    const data = getByPath(actor.data.data, root);
    if (data) {
        if (collection) {
            const index = getByPath(data, collection).findIndex(item => (getByPath(item, key) === value));
            if (index != -1) {
                const name = "data." + root;
                getByPath(data, collection).splice(index, 1);
                await actor.update({[name]: data});
            }
        } else {
            const index = data.findIndex(item => (getByPath(item, key) === value));
            if (index != -1) {
                const name = "data." + root;
                data.splice(index, 1);
                await actor.update({[name]: data});
            }
        }
    }
}

/**
 * Resets the metamorphe of the specified actor.
 * The metamorphe property must be defined for this actor. 
 * @param {*} actor 
 */
export async function setItemOf(actor, root, value, key = null) {
    const metamorphe = duplicate(actor.data.data.metamorphe);
    metamorphe.refid = null;
    metamorphe.metamorphoses = [false, false, false, false, false, false, false, false, false, false];
    if (key) {
        const data = duplicate(getByPath(actor.data.data, root));
        getByPath(data, key) = value;
        const name = "data." + root;
        await actor.update({ [name]: data });
    } else {
        const name = "data." + root;
        await actor.update({ [name]: value });
    }
   
}
