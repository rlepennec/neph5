
export class DocumentReferencesIterator {

    /**
     * @param {*} documentName The document name: Item or Actor.
     * @param {*} type The type of item or actor.
     */
    constructor(documentName, type) {
        this.documentName = documentName;
        this.type = type;
    }

    /**
     * This method is used to gather in the specified document all fields which match the current reference type.
     * @param {*} document The document to process.
     * @param {*} callbackSet The callback used to process the set field.
     */
    forEachReferenceOf(document, callbackSet) {

        // Iterate all fields of the specified document
        Object.entries(document.system.schema.fields).every(([fieldName, field]) => {

            switch (field.constructor) {

                // The field is a set of references
                case foundry.data.fields.SetField: 
                    if (field.element instanceof UUIDReferenceField &&
                        field.element.collection === this.documentName &&
                        field.element.type === this.type) {

                        callbackSet(field);
                        return false;

                    }
                    break;

            }

            return true;
        })

    }

}