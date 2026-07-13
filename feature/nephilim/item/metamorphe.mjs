import { Constants } from "../../../module/common/constants.js";
import { UUIDField } from "../../../module/field/UUIDField.js";

export class MetamorpheDataModel extends foundry.abstract.TypeDataModel {

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
            humeur: new foundry.data.fields.StringField
            (
                {
                    required: false,
                    initial: 'chaud',
                    choices: Constants.HUMEURS
                }
            ),
            portrait: new foundry.data.fields.SchemaField
            (
                {
                    activite: new foundry.data.fields.StringField(),
                    animal: new foundry.data.fields.StringField(),
                    arme : new foundry.data.fields.StringField(),
                    couleur: new foundry.data.fields.StringField(),
                    etre: new foundry.data.fields.StringField(),
                    humain: new foundry.data.fields.StringField(),
                    metal: new foundry.data.fields.StringField(),
                    objet: new foundry.data.fields.StringField(),
                    oeuvre: new foundry.data.fields.StringField(),
                    phenomene: new foundry.data.fields.StringField()
                },
                {
                    required: false
                }
            ),
            illustration: new foundry.data.fields.FilePathField
            (
                {
                    categories: ["IMAGE"],
                    initial: "systems/neph5e/assets/vk/items/metamorphe-defaut.webp"
                }
            )
        }
    }

}