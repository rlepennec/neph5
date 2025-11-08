export class UUIDField extends foundry.data.fields.StringField {

  /**
   * @override
   */
  constructor(schema, options={}, context={}) {
    super(schema, options, context);
  }


  /**
   *  @override
   */
  getInitialValue(data) {
    console.log("getInitialValue");
    return crypto.randomUUID();
  }

}