export class Tools {

    static isObjectEmpty(object) {
        return object && Object.keys(object).length === 0 && object.constructor === Object;
    }

    static isObjectNotEmpty(object) {
        return Tools.isObjectEmpty(object) === false;
    }

    static toDocumentReference(expression) {
        const words = expression.split(".");
        return {
            documentName: words[0],
            type: words[1],
            id: words[2]
        }
    }


}