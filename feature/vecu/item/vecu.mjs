import { Constants } from "../../../module/common/constants.js";
import { UUIDField } from "../../../module/field/UUIDField.js";

export class VecuDataModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new UUIDField(
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
            degre: new foundry.data.fields.NumberField
            (
                {
                    required: false
                }
            ),
            periode: new foundry.data.fields.StringField
            (
                {
                    required: false,
                    nullable: true,
                    initial: null
                }
            ),
            competences: new foundry.data.fields.ArrayField
            (
                new foundry.data.fields.StringField(),
                {
                    required: false
                }
            ),
            mnemos: new foundry.data.fields.ArrayField
            (
                new foundry.data.fields.SchemaField
                (
                    {
                        name: new foundry.data.fields.StringField(),
                        degre: new foundry.data.fields.NumberField(
                            { initial: 0 }
                        ),
                        description: new foundry.data.fields.StringField()
                    }
                )
            ),
            illustration: new foundry.data.fields.FilePathField
            (
                {
                    categories: ["IMAGE"],
                    initial: "systems/neph5e/assets/vk/items/vecu-defaut.webp"
                }
            )
        }
    }

    static initializeEmbedded(data) {
        data.system.degre = 0;
    }

}