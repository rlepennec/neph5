export class TextField extends foundry.data.fields.StringField {

  /**
   * @override
   */
  static get _defaults() {
    return Object.assign(super._defaults, {initial: ''});
  }

}