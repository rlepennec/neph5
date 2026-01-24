import { ChunkField } from "../../../module/common/ChunkField.js"
import { Constants } from "../../../module/common/constants.js";
import { NephilimDataModel } from "../../../module/common/nephilimDataModel.js"
import { UUIDField } from "../../../module/common/UUIDField.js"

export class MetamorpheData extends NephilimDataModel {

    static defineSchema() {
        return {
            sid: new UUIDField
            (
                {
                    required: true
                }
            ),
            item: new ChunkField
            (
                {
                    base: new ChunkField
                    (
                        {
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
                            ),
                            description: new foundry.data.fields.StringField()
                        },
                        {
                            collection: 'Item',
                            scope: 'base'
                        }
                    ),
                    v1: new ChunkField
                    (
                        {
                            metamorphoses: new foundry.data.fields.SchemaField
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
                            )
                        }
                    ),
                    v5: new ChunkField
                    (
                        {
                            metamorphoses: new foundry.data.fields.ArrayField
                            (
                                new foundry.data.fields.StringField(),
                                {
                                    initial: Array(10).fill(""),
                                    max: 10
                                },
                            )
                        },
                        {
                            collection: 'Item',
                            scope: 'v5'
                        }
                    )
                },
                {
                    collection: 'Item',
                    scope: 'root'
                }
            ),
            actor: new ChunkField
            (
                {
                    v1: new ChunkField
                    (
                        {
                            metamorphoses: new foundry.data.fields.SchemaField
                            (
                                {
                                    visage: new foundry.data.fields.SchemaField
                                    (
                                        {
                                            points: new foundry.data.fields.NumberField(
                                                {
                                                    initial: 0
                                                }
                                            ),
                                        }
                                    ),
                                    main: new foundry.data.fields.SchemaField
                                    (
                                        {
                                            points: new foundry.data.fields.NumberField(
                                                {
                                                    initial: 0
                                                }
                                            )
                                        }
                                    ),
                                    peau: new foundry.data.fields.SchemaField
                                    (
                                        {
                                            points: new foundry.data.fields.NumberField(
                                                {
                                                    initial: 0
                                                }
                                            )
                                        }
                                    ),
                                    odeur: new foundry.data.fields.SchemaField
                                    (
                                        {
                                            points: new foundry.data.fields.NumberField(
                                                {
                                                    initial: 0
                                                }
                                            )
                                        }
                                    ),
                                    voix: new foundry.data.fields.SchemaField
                                    (
                                        {
                                            points: new foundry.data.fields.NumberField(
                                                {
                                                    initial: 0
                                                }
                                            )
                                        }
                                    )
                                }
                            )
                        }
                    ),
                    v5: new ChunkField
                    (
                        {
                            metamorphoses: new foundry.data.fields.ArrayField
                            (
                                new foundry.data.fields.SchemaField
                                (
                                    {
                                        construit: new foundry.data.fields.BooleanField(),
                                        active: new foundry.data.fields.BooleanField()
                                    }
                                ),
                                {
                                    initial: Array(10).fill(
                                        {
                                            construit: false,
                                            active:false
                                        }
                                    ),
                                    max: 10
                                },
                            )
                        },
                        {
                            collection: 'Item',
                            scope: 'v5'
                        }
                    )
                },
                 {
                    collection: 'Actor',
                    scope: 'root'
                }
            )
        }
    }

}
