import { Constants } from "../../../module/common/constants.js";

export class MetamorpheDataModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new foundry.data.fields.StringField
            (
                {
                    required: true
                }
            ),
            element: new foundry.data.fields.StringField
            (
                {
                    initial: 'air',
                    choices: Constants.ELEMENTS
                }
            ),
            description: new foundry.data.fields.StringField
            (
                {
                    required: false
                }
            ),
            metamorphoses: new foundry.data.fields.ArrayField
            (
                new foundry.data.fields.SchemaField
                (
                    {
                        name: new foundry.data.fields.StringField()
                    }
                ),
                {
                    required: false
                }
            ),
            formed: new foundry.data.fields.ArrayField
            (
                new foundry.data.fields.BooleanField(),
                {
                    required: false
                }
            ),
            visible: new foundry.data.fields.ArrayField
            (
                new foundry.data.fields.BooleanField(),
                {
                    required: false
                }
            ),

        }
    }

}