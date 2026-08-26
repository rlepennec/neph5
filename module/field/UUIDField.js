import { CustomHandlebarsHelpers } from "../common/handlebars.js";

export class UUIDField extends foundry.data.fields.StringField {

    /**
     * @override
     */
    constructor(schema, options = {}, context = {}) {
        super(schema, options, context);
    }

    /**
     *  @override
     */
    getInitialValue(data) {
        return CustomHandlebarsHelpers.UUID();
    }

}