import { CustomHandlebarsHelpers } from "../../../module/common/handlebars.js";

export class AlchimieData extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new foundry.data.fields.StringField(
                {
                    required: true,
                    initial: crypto.randomUUID()
                }
            ),
            description: new foundry.data.fields.StringField(
                {
                    required: true,
                    initial: null
                }
            )
        }
    }

}
