import { Constants } from "../../../module/common/constants.js";

export class SortDataModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new foundry.data.fields.StringField
            (
                {
                    required: true
                }
            ),
            cercle: new foundry.data.fields.StringField
            (
                {
                    required: false
                }
            ),
            element: new foundry.data.fields.StringField
            (
                {
                    initial: 'air',
                    choices: Constants.ELEMENTS_MAGIE
                }
            ),
            degre: new foundry.data.fields.NumberField
            (
                {
                    required: false
                }
            ),
            portee: new foundry.data.fields.StringField
            (
                {
                    required: false
                }
            ),
            duree: new foundry.data.fields.StringField
            (
                {
                    required: false
                }
            ),
            voies: new foundry.data.fields.ArrayField
            (
                new foundry.data.fields.StringField(),
                {
                    required: false
                }
            ),
            incantation: new foundry.data.fields.StringField
            (
                {
                    required: false
                }
            ),
            syntaxe: new foundry.data.fields.StringField
            (
                {
                    required: false
                }
            ),
            description: new foundry.data.fields.StringField
            (
                {
                    required: false
                }
            ),
            focus: new foundry.data.fields.BooleanField
            (
                {
                    required: false
                }
            ),
            status: new foundry.data.fields.StringField
            (
                {
                    required: false
                }
            ),
            periode: new foundry.data.fields.StringField
            (
                {
                    required: false
                }
            )
        }
    }

}
