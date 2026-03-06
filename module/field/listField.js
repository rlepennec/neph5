export class ListField extends foundry.data.fields.ArrayField {

    /**
     * @override
     */
    clean(value, options = {}) {
        return super.clean(value, options).filter(v => v != null);
    }

}