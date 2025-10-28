export class ItemReferenceDataField extends foundry.data.fields.StringField {
  /** @override */
  _castChangeDelta(delta) {
    if ( delta instanceof this.model ) return delta;
    return this.initialize(this._cast(delta));
  }
}