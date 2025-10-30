export class ItemReferenceDataField extends foundry.data.fields.StringField {

  constructor(schema, options={}, context={}) {
    super(schema, options, context);
    console.log("constructor ItemReferenceDataField");
  }

}