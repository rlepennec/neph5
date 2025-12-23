import { Constants } from "../../../module/common/constants.js";
import { UUIDField } from "../../../module/common/UUIDField.js"

export class MetamorpheData extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            sid: new UUIDField
            (
                {
                    required: true
                }
            ),
            /*
            element: new foundry.data.fields.StringField
            (
                {
                    required: true,
                    initial: 'air',
                    choices: Constants.ELEMENTS
                }
            ),
            humeur: new foundry.data.fields.StringField
            (
                {
                    required: true,
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
                }
            ),**/
            metamorphoses: new foundry.data.fields.SchemaField
            (
                {
                    /*
                    v1: new foundry.data.fields.SchemaField
                    (
                        {
                            visage: new foundry.data.fields.SchemaField
                            (
                                {
                                    titre: new foundry.data.fields.StringField(),
                                    description : new foundry.data.fields.StringField(),
                                }
                            ),
                            main: new foundry.data.fields.SchemaField
                            (
                                {
                                    titre: new foundry.data.fields.StringField(),
                                    description : new foundry.data.fields.StringField(),
                                }
                            ),
                            peau: new foundry.data.fields.SchemaField
                            (
                                {
                                    titre: new foundry.data.fields.StringField(),
                                    description : new foundry.data.fields.StringField(),
                                }
                            ),
                            odeur: new foundry.data.fields.SchemaField
                            (
                                {
                                    titre: new foundry.data.fields.StringField(),
                                    description : new foundry.data.fields.StringField(),
                                }
                            ),
                            voix: new foundry.data.fields.SchemaField
                            (
                                {
                                    titre: new foundry.data.fields.StringField(),
                                    description : new foundry.data.fields.StringField(),
                                }
                            )
                        }
                    ),
                    */
                    v5: new foundry.data.fields.ArrayField
                    (
                        new foundry.data.fields.StringField(),
                        {
                            initial: Array(10).fill(""),
                            max: 10
                        },
                    )
                }
            )
            /*,
            description: new foundry.data.fields.StringField()
            */
        }
    }

}
