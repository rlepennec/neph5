export class UUIDReferenceField extends foundry.data.fields.StringField {

  /**
   *  @override
   */
  static get _defaults() {
    return Object.assign(
      super._defaults,
      {
        collection: 'Item',
        type: 'base',
        droppable: true,
        openable: true,
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


  // pas appelé a la creation du document mais au demarrage, là ou les collections items et actors sont vides
  // a supprimer ?
  _validateType(value) {
    const collection = this.#getCollection();
    if (collection != null) {
      if (!game.documentTypes.Item.includes(this.options.type)) {
        throw new Error(`invalid ${this.options.collection} type [${this.options.type}]`);
      }
      if (this.#getCollection().filter(i => (this.options.type === 'base' || i.type === this.options.type) && i.system.id === value).length !== 1) {
        throw new Error(`invalid ${this.options.type} ${this.options.collection} reference [${value}]`);
      }
    }
    super._validateType(value);
  }

  /**
   * @returns the document collection.
   */
  #getCollection() {
    switch (this.options.collection) {
      case 'Item':
        return game.items?.contents;
      case 'Actor':
        return game.actors?.contents;
      default:
        throw new Error(`invalid collection [${this.options.collection}]`);
    }
  }

}