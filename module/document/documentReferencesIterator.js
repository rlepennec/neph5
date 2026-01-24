import { ChunkField } from "../common/chunkField.js"
import { UUIDReferenceField } from "../common/UUIDReferenceField.js"

export class DocumentReferencesIterator {

    /**
     * @param {*} documentName The document name: Item or Actor.
     * @param {*} type The type of item or actor.
     */
    constructor(documentName, type) {
        this.documentName = documentName;
        this.type = type;
        this.callbackSet = null;
        this.callbackReference = null;
    }

    /**
     * Register the specified callbacks.
     * @param callback The callback used to process the reference field and the set field.
     * @return the instance.
     */
    withCallbacks(callback) {
        this.callbackSet = callback;
        this.callbackReference = callback;
        return this;
    }

    /**
     * Register the specified callback.
     * @param callback The callback used to process the set field.
     * @return the instance.
     */
    withCallbackSet(callback) {
        this.callbackSet = callback;
        return this;
    }

    /**
     * Register the specified callback.
     * @param callback The callback used to process the reference field.
     * @return the instance.
     */
    withCallbackReference(callback) {
        this.callbackReference = callback;
        return this;
    }

    /**
     * This method is used to gather in the specified document all fields which match the current reference
     * type. The callback parameter of every stops the iteration as soon as false is returned.
     * @param {*} document The document to process.
     */
    forEach(document) {
        this.#forEach(document.system.schema.fields);
    }

    /**
     * This method is used to gather all specified fields which match the current reference type.
     * The callback parameter of every stops the iteration as soon as false is returned.
     * @param {*} fields The map of fields to process.
     */
    #forEach(fields) {

        // Iterate all fields
        return Object.entries(fields).every(([fieldName, field]) => {

            switch (field.constructor) {

                // The field is a set of references
                case foundry.data.fields.SetField:
                    if (field.element instanceof UUIDReferenceField && this.callbackSet != null) {
                        return this.#matches(field.element, this.callbackSet, field);
                    }
                    break;

                // The field is a reference
                case UUIDReferenceField:
                    if (this.callbackReference != null) {
                        return this.#matches(field, this.callbackReference, field);
                    }
                    break;

                //
                case ChunkField:
                case foundry.data.fields.SchemaField:
                    return this.#forEach(field.fields);

            }

            return true;

        })

    }

    /**
     * Process the specified process field if the inspect field matches.
     * @param {*} inspect  The field to inspect.
     * @param {*} callback The callback used to process the field.
     * @param {*} process  The field to process.
     * @returns false to stop to iterate over following fields.
     */
    #matches(inspect, callback, process) {

        // Process the only field if match and stop iteration
        if (this.documentName != null && this.type != null) {
            if (inspect.collection === this.documentName && inspect.type === this.type) {
                callback(process);
                return false;
            } else {
                return true;
            }
        }

        // Process all reference fields 
        if (this.documentName == null && this.type == null) {
            callback(process);
            return true;
        }

        // Unexpected match
        throw new Error("Unexpected document iterator match [name=" + this.documentName + ', type=' + this.type + "]");

    }

}