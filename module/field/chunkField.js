export class ChunkField extends foundry.data.fields.SchemaField {

    /**
     * @override
     */
    constructor(schema, options = {}, context = {}) {
        super(schema, options, context);
    }

    /**
     *  @override
     */
    static get _defaults() {
        return Object.assign(
            super._defaults,
            {
                collection: 'Item',
                scope: 'base',
            }
        )
    }

}