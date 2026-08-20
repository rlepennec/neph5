/**
 * Drives the illustration of an item from one of its system fields: the sephirah
 * of an invocation, the cercle of a sort...
 *
 * An illustration stays "automatic" — and therefore keeps following its field —
 * as long as the user has not chosen one himself. It is then empty, one of the
 * illustrations of the table, or the path used by a previous version. Anything
 * else is a user choice and is never overwritten.
 */
export class Illustration {

    /**
     * @param root     Directory holding the illustrations, trailing slash included.
     * @param field    Name of the system field which drives the illustration.
     * @param files    Map of field value to file name. Explicit on purpose: file
     *                 names do not always match the value they illustrate.
     * @param fallback Field value used as long as the field is not set.
     * @param legacy   Optional illustration of a previous version, still automatic
     *                 so that existing items start following their field again.
     */
    constructor({ root, field, files, fallback, legacy = null }) {
        this.root = root;
        this.field = field;
        this.files = files;
        this.fallback = fallback;
        this.legacy = legacy;
    }

    /**
     * @param value The value of the driving field.
     * @returns the path of the illustration of the specified value.
     */
    of(value) {
        return this.root + (this.files[value] ?? this.files[this.fallback]);
    }

    /**
     * @param illustration The current illustration.
     * @returns true if the illustration must keep following the driving field.
     */
    isAutomatic(illustration) {

        if (illustration == null || illustration === "") {
            return true;
        }

        if (this.legacy != null && illustration === this.legacy) {
            return true;
        }

        return Object.keys(this.files).some(value => this.of(value) === illustration);

    }

    /**
     * Detects an illustration left behind by its field: still automatic, but
     * showing another value than the current one. Typically an item created
     * before the illustration followed the field. Checked when the sheet is
     * opened, since no update would otherwise realign it.
     * @param value        The current value of the driving field.
     * @param illustration The current illustration.
     * @returns the illustration to apply, or null if there is nothing to change.
     */
    outdated(value, illustration) {

        if (this.isAutomatic(illustration) === false) {
            return null;
        }

        const expected = this.of(value ?? this.fallback);
        return illustration === expected ? null : expected;

    }

    /**
     * Keeps the illustration aligned with the driving field, without ever
     * discarding an illustration chosen by the user. Called on create and update.
     * @param changes The data to be applied, updated in place.
     * @param current The driving field and the illustration before the change.
     * @returns true if the illustration has been changed.
     */
    align(changes, current = {}) {

        // Nothing to do unless the driving field actually changes
        const value = changes?.system?.[this.field];
        if (value == null || value === current[this.field]) {
            return false;
        }

        // A user defined illustration is never overwritten. The one submitted
        // with the change prevails: it may be the one just picked by the user.
        const illustration = changes?.system?.illustration ?? current.illustration;
        if (this.isAutomatic(illustration) === false) {
            return false;
        }

        foundry.utils.setProperty(changes, "system.illustration", this.of(value));
        return true;

    }

}