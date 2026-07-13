import { Constants } from "../../../module/common/constants.js";
import { UUIDField } from "../../../module/field/UUIDField.js";

export class CompetenceDataModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new UUIDField(
                {
                    required: true
                }
            ),
            description: new foundry.data.fields.StringField
            (
                {
                    required: false
                }
            ),
            element: new foundry.data.fields.StringField
            (
                {
                    initial: 'air',
                    choices: Constants.ELEMENTS
                }
            ),
            illustration: new foundry.data.fields.FilePathField
            (
                {
                    categories: ["IMAGE"],
                    initial: "systems/neph5e/assets/vk/items/competence-defaut.webp"
                }
            )
        }
    }

}