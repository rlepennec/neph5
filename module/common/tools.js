export class Tools {

    static isObjectEmpty(object) {
        return object && Object.keys(object).length === 0 && object.constructor === Object;
    }

    static isObjectNotEmpty(object) {
        return Tools.isObjectEmpty(object) === false;
    }

    static expressionToDocumentReference(expression) {
        const words = expression.split(".");
        return {
            documentName: words[0],
            type: words[1],
            id: words[2]
        }
    }

    static itemToDocumentReference(item) {
        return {
            documentName: item.documentName,
            type: item.type,
            id: item.system.id
        }
    }


}