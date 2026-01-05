export class Tools {

    static isObjectEmpty(object) {
        return object && Object.keys(object).length === 0 && object.constructor === Object;
    }

    static isObjectNotEmpty(object) {
        return Tools.isObjectEmpty(object) === false;
    }

    /**
     * Gets the specified property value from the specified object.
     * @param {*} object The object from which to get the property value.
     * @param {*} path The path of the property to get
     * @param {*} defaultValue The default value if the property is not found.
     * @returns the property or the default value.
     */
    static getObjectPropertyFromPath(object, path, defaultValue) {
        const words = path.split(".");
        let current = object;
        for (var i = 0; i < words.length; i++) {
            if (!current[words[i]]) return defaultValue;
            current = current[words[i]];
        }
        return current;
    }

}