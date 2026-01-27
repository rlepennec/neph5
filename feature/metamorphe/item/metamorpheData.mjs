import { ChunkField } from "../../../module/common/chunkField.js"
import { Constants } from "../../../module/common/constants.js";
import { NephilimDataModel } from "../../../module/common/nephilimDataModel.js"

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
                    activite: new foundry.data.fields.StringField(
                        {
                            initial: ''
                        }
                    ),
                    animal: new foundry.data.fields.StringField(
                        {
                            initial: ''
                        }
                    ),
                    arme : new foundry.data.fields.StringField(
                        {
                            initial: ''
                        }
                    ),
                    couleur: new foundry.data.fields.StringField(
                        {
                            initial: ''
                        }
                    ),
                    etre: new foundry.data.fields.StringField(
                        {
                            initial: ''
                        }
                    ),
                    humain: new foundry.data.fields.StringField(
                        {
                            initial: ''
                        }
                    ),
                    metal: new foundry.data.fields.StringField(
                        {
                            initial: ''
                        }
                    ),
                    objet: new foundry.data.fields.StringField(
                        {
                            initial: ''
                        }
                    ),
                    oeuvre: new foundry.data.fields.StringField(
                        {
                            initial: ''
                        }
                    ),
                    phenomene: new foundry.data.fields.StringField(
                        {
                            initial: ''
                        }
                    )
                }
            ),
            description: new foundry.data.fields.StringField(
                {
                    initial: ''
                }    
            )
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
                metamorphoses: new foundry.data.fields.SchemaField
                (
                    {
                        visage: new foundry.data.fields.SchemaField
                        (
                            {
                                titre: new foundry.data.fields.StringField(
                                    {
                                        initial: ''
                                    }
                                ),
                                description : new foundry.data.fields.StringField(
                                    {
                                        initial: ''
                                    }
                                ),
                            }
                        ),
                        main: new foundry.data.fields.SchemaField
                        (
                            {
                                titre: new foundry.data.fields.StringField(
                                    {
                                        initial: ''
                                    }
                                ),
                                description : new foundry.data.fields.StringField(
                                    {
                                        initial: ''
                                    }
                                ),
                            }
                        ),
                        peau: new foundry.data.fields.SchemaField
                        (
                            {
                                titre: new foundry.data.fields.StringField(
                                    {
                                        initial: ''
                                    }
                                ),
                                description : new foundry.data.fields.StringField(
                                    {
                                        initial: ''
                                    }
                                ),
                            }
                        ),
                        odeur: new foundry.data.fields.SchemaField
                        (
                            {
                                titre: new foundry.data.fields.StringField(
                                    {
                                        initial: ''
                                    }
                                ),
                                description : new foundry.data.fields.StringField(
                                    {
                                        initial: ''
                                    }
                                ),
                            }
                        ),
                        voix: new foundry.data.fields.SchemaField
                        (
                            {
                                titre: new foundry.data.fields.StringField(
                                    {
                                        initial: ''
                                    }
                                ),
                                description : new foundry.data.fields.StringField(
                                    {
                                        initial: ''
                                    }
                                ),
                            }
                        )
                    }
                )
            }
        )
    }

    static #defineVersion5() {
        return new ChunkField(
            {
                metamorphoses: new foundry.data.fields.ArrayField
                (
                    new foundry.data.fields.StringField(
                        {
                            initial: ''
                        }
                    ),
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
