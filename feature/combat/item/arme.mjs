import { Constants } from "../../../module/common/constants.js";
import { UUIDField } from "../../../module/field/UUIDField.js";

export class ArmeDataModel extends foundry.abstract.TypeDataModel {

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
            used: new foundry.data.fields.BooleanField(
                {
                    required: false,
                    initial: true
                }
            ),
            parade: new foundry.data.fields.BooleanField(
                {
                    required: false
                }
            ),
            type: new foundry.data.fields.StringField(
                {
                    initial: 'melee',
                    choices: Constants.ARMES
                }
            ),
            competence: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            attack: new foundry.data.fields.NumberField(
                {
                    required: false
                }
            ),
            defense: new foundry.data.fields.NumberField(
                {
                    required: false
                }
            ),
            damages: new foundry.data.fields.NumberField(
                {
                    required: false
                }
            ),
            blocage: new foundry.data.fields.BooleanField(
                {
                    required: false
                }
            ),
            physique: new foundry.data.fields.BooleanField(
                {
                    required: false,
                    initial: true
                }
            ),
            magique: new foundry.data.fields.BooleanField(
                {
                    required: false
                }
            ),
            ammunition: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            munitions: new foundry.data.fields.NumberField(
                {
                    required: false,
                    initial: 1
                }
            ),   
            tire: new foundry.data.fields.NumberField(
                {
                    required: false
                }
            ),
            cible: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            visee: new foundry.data.fields.NumberField(
                {
                    required: false
                }
            ),           
            lance: new foundry.data.fields.BooleanField(
                {
                    required: false
                }
            ),
            salve: new foundry.data.fields.BooleanField(
                {
                    required: false
                }
            ),
            rafale: new foundry.data.fields.BooleanField(
                {
                    required: false
                }
            ),
            illustration: new foundry.data.fields.FilePathField
            (
                {
                    categories: ["IMAGE"],
                    initial: "systems/neph5e/assets/vk/armes/arme-defaut.webp"
                }
            )
        }
    }

}
