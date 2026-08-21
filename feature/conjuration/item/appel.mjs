import { Constants } from "../../../module/common/constants.js";
import { UUIDField } from "../../../module/field/UUIDField.js";

export class AppelDataModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new UUIDField(
                {
                    required: true
                }
            ),
            description: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            degre: new foundry.data.fields.NumberField(
                {
                    intial: 1,
                    required: false
                }
            ),
            appel: new foundry.data.fields.StringField(
                {
                    initial: 'pacifiste',
                    choices: Constants.APPELS
                }
            ),
            controle: new foundry.data.fields.BooleanField(
                {
                    required: false
                }
            ),
            visibilite: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            entropie: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            dommages: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            protection: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            cercle: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            status: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            periode: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            focus: new foundry.data.fields.BooleanField(
                {
                    required: false
                }
            ),
            illustration: new foundry.data.fields.FilePathField
            (
                {
                    categories: ["IMAGE"],
                    initial: "systems/neph5e/assets/vk/items/appel-defaut.png"
                }
            ),
        }
    }

}
