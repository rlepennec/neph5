import { Constants } from "../../../module/common/constants.js";

export class InvocationDataModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new foundry.data.fields.StringField(
                {
                    required: true
                }
            ),
            description: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            sephirah: new foundry.data.fields.StringField(
                {
                    initial: 'malkut',
                    choices: Constants.SEPHIRAH
                }
            ),
            monde: new foundry.data.fields.StringField(
                {
                    initial: 'aresh',
                    choices: Constants.MONDES
                }
            ),
            element: new foundry.data.fields.StringField(
                {
                    initial: 'air',
                    choices: Constants.ELEMENTS.concat(Constants.ELEMENTS_KABBALE)
                }
            ),
            degre: new foundry.data.fields.NumberField(
                {
                    required: false
                }
            ),
            portee: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            duree: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            visibilite: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            focus: new foundry.data.fields.BooleanField(
                {
                    required: false
                }
            ),
            status: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            pacte: new foundry.data.fields.BooleanField(
                {
                    required: false
                }
            ),
            periode: new foundry.data.fields.StringField(
                {
                    required: false
                }
            )
        }
    }

}
