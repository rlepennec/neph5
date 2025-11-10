export class Tools {

    static isObjectEmpty(object) {
        return object && Object.keys(object).length === 0 && object.constructor === Object;
    }

    static isObjectNotEmpty(object) {
        return Tools.isObjectEmpty(object) === false;
    }

}