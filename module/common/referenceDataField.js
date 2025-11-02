export class ReferenceDataField extends foundry.data.fields.StringField {

  /**
   *  @override
   */
  static get _defaults() {
    return Object.assign(
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
    const collection = this.#getCollection();
    if (!game.documentTypes.Item.includes(this.options.type)) {
      throw new Error(`invalid ${this.options.collection} type [${this.options.type}]`);
    }
    if (this.#getCollection().filter(i => (this.options.type === 'base' || i.type === this.options.type) && i.system.id === value).length !== 1) {
      throw new Error(`invalid ${this.options.type} ${this.options.collection} reference [${value}]`);
    }
    super._validateType(value);
  }

  /**
   * @returns the document collection.
   */
  #getCollection() {
    switch (this.options.collection) {
      case 'items':
        return game.items.contents;
      case 'actors':
        return game.actors.contents;
      default:
        throw new Error(`invalid collection [${this.options.collection}]`);
    }
  }

}