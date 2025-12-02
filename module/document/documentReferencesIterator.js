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

        // Iterate all fields of the specified document
        Object.entries(document.system.schema.fields).every(([fieldName, field]) => {

            switch (field.constructor) {

                // The field is a set of references
                case foundry.data.fields.SetField: 
                    if (this.#matches(field.element) &&
                        this.callbackSet != null &&
                        field.element instanceof UUIDReferenceField) {

                        this.callbackSet(field);
                        return false;

                    }
                    break;

                // The field is a reference
                case UUIDReferenceField:
                    if (this.#matches(field) &&
                        this.callbackReference != null) {

                        this.callbackReference(field);
                        return false;

                    }
                    break;

            }

            return true;

        })

    }

    /**
     * Indicates if the specified field must be processed by registred callbacks.
     * @param {*} field The field to inspect.
     * @returns true if the field matches the expected one.
     */
    #matches(field) {

        if (this.documentName != null && this.type != null) {
            return field.collection === this.documentName && field.type === this.type;
        }

        if (this.documentName != null) {
            return field.type === this.type;
        }

        if (this.type != null) {
            return field.collection === this.documentName;
        }

        return true;

    }

}