import { ChunkField } from "../../../module/common/chunkField.js"
import { Constants } from "../../../module/common/constants.js";
import { NephilimDataModel } from "../../../module/common/nephilimDataModel.js"
import { TextField } from "../../../module/common/textField.js"

export class MetamorpheData extends NephilimDataModel {

    static defineBase() {
        return {
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
                    activite: new TextField(),
                    animal: new TextField(),
                    arme : new TextField(),
                    couleur: new TextField(),
                    etre: new TextField(),
                    humain: new TextField(),
                    metal: new TextField(),
                    objet: new TextField(),
                    oeuvre: new TextField(),
                    phenomene: new TextField()
                }
            ),
            description: new TextField()
        }
    }

    static defineVersions() {
        return {
            v1: this.#defineVersion1(),
            v5: this.#defineVersion5()
        }
    }

    static #defineVersion1() {
        return new ChunkField(
            {
                metamorphoses: new foundry.data.fields.SchemaField(
                    {
                        main: new foundry.data.fields.SchemaField(
                            {
                                titre: new TextField(),
                                description : new TextField(),
                            }
                        ),
                        odeur: new foundry.data.fields.SchemaField(
                            {
                                titre: new TextField(),
                                description : new TextField(),
                            }
                        ),
                        peau: new foundry.data.fields.SchemaField(
                            {
                                titre: new TextField(),
                                description : new TextField(),
                            }
                        ),
                        visage: new foundry.data.fields.SchemaField(
                            {
                                titre: new TextField(),
                                description : new TextField(),
                            }
                        ),
                        voix: new foundry.data.fields.SchemaField(
                            {
                                titre: new TextField(),
                                description : new TextField(),
                            }
                        )
                    }
                )
            },
            {
                collection: 'Item',
                scope: 'v1'
            }
        )
    }

    static #defineVersion5() {
        return new ChunkField(
            {
                metamorphoses: new foundry.data.fields.ArrayField(
                    new foundry.data.fields.StringField(),
                    {
                        initial: Array(10).fill(''),
                        max: 10
                    },
                )
            },
            {
                collection: 'Item',
                scope: 'v5'
            }
        )
    }
    
}
