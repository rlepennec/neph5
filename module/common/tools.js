/**
 * Gets the specified value by applying the specified path to the specified object.
 * @param object The object from which to apply the path.
 * @param path   The path to apply.
 * @return the specified value.
 */
export function getByPath(object, path) {
    path = path
        .replace(/\[/g, '.')
        .replace(/]/g, '')
        .split('.');
    path.forEach(function (level) {
        object = object[level];
        if (!object) {
            return object;
        }
    });
    return object;
};

/**
 * Defines a fast UUID generator compliant with RFC4122 version 4.
 */
export function UUID() {
    let self = {};
    let lut = [];
    for (let i = 0; i < 256; i++) {
        lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
    }
    let d0 = Math.random() * 0xffffffff | 0;
    let d1 = Math.random() * 0xffffffff | 0;
    let d2 = Math.random() * 0xffffffff | 0;
    let d3 = Math.random() * 0xffffffff | 0;
    let result =
        lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
        lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + lut[d1 >> 16 & 0xff] + lut[d1 >> 24 & 0xff] + '-' +
        lut[d2 & 0xff] + lut[d2 >> 8 & 0xff] + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] + '-' +
        lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
    return result;
};