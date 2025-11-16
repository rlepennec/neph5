
export class DocumentReferencesIterator {

    /**
     * @param {*} documentName The document name: Item or Actor.
     * @param {*} type The type of item or actor.
     */
    constructor(documentName, type) {
        this.documentName = documentName;
        this.type = type;
        this.callbackSet = null;
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
     * This method is used to gather in the specified document all fields which match the current reference type.
     * @param {*} document The document to process.
     */
    forEach(document) {

        // Callback must be defined
        if (this.callbackSet == null) throw new Error("The callback used to process the set field must be defined");

        // Iterate all fields of the specified document
        Object.entries(document.system.schema.fields).every(([fieldName, field]) => {

            switch (field.constructor) {

                // The field is a set of references
                case foundry.data.fields.SetField: 
                    if (field.element instanceof UUIDReferenceField &&
                        field.element.collection === this.documentName &&
                        field.element.type === this.type) {

                        this.callbackSet(field);
                        return false;

                    }
                    break;

            }

            return true;

        })

    }

}