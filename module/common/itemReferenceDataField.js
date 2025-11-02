export class ItemReferenceDataField extends foundry.data.fields.StringField {

  /**
   *  @override
   */
  static get _defaults() {
    return foundry.utils.mergeObject(
      super._defaults,
      {
        collection: 'items',
        type: 'base'
      }
    )
  }

  /**
   * @override
   */
  constructor(schema, options={}, context={}) {
    super(schema, options, context);
  }

  /**
   *  @override
   */
  _validateType(value) {
    if (!['items', 'actors'].includes(this.options.collection)) {
      throw new Error(`the collection [${this.options.collection}] is not supported`);
    }
    if (!game.documentTypes.Item.includes(this.options.type)) {
      throw new Error(`the item type [${this.options.type}] doesn't exist`);
    }
    if (game.items.contents.filter(i => i.type === this.options.type && i.system.id === value).length !== 1) {
      throw new Error(`the reference [${value}] must contain a reference to an item of type [${this.options.type}]`);
    }
    super._validateType(value);
  }

}