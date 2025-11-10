export class DocumentReference {

    constructor(documentName, type, id) {
        this.documentName = documentName;
        this.type = type;
        this.id = id;
    }

    static createFromItem(item) {
        return new DocumentReference(item.documentName, item.type, item.system.id);
    }

    static createFromString(expression) {
        const words = expression.split(".");
        return new DocumentReference(words[0], words[1], words[2]);
    }

}