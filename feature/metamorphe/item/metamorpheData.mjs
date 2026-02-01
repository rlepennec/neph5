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
                    activite: this.StringField(),
                    animal: this.StringField(),
                    arme : this.StringField(),
                    couleur: this.StringField(),
                    etre: this.StringField(),
                    humain: this.StringField(),
                    metal: this.StringField(),
                    objet: this.StringField(),
                    oeuvre: this.StringField(),
                    phenomene: this.StringField()
                }
            ),
            description: this.StringField()
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
                                titre: this.StringField(),
                                description : this.StringField(),
                            }
                        ),
                        odeur: new foundry.data.fields.SchemaField(
                            {
                                titre: this.StringField(),
                                description : this.StringField(),
                            }
                        ),
                        peau: new foundry.data.fields.SchemaField(
                            {
                                titre:this.StringField(),
                                description : this.StringField(),
                            }
                        ),
                        visage: new foundry.data.fields.SchemaField(
                            {
                                titre: this.StringField(),
                                description : this.StringField(),
                            }
                        ),
                        voix: new foundry.data.fields.SchemaField(
                            {
                                titre: this.StringField(),
                                description : this.StringField(),
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
                    this.StringField(),
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
