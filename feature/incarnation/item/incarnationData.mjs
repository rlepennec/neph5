import { ChunkField } from "../../../module/field/chunkField.js"
import { NephilimDataModel } from "../../../module/nephilimDataModel.js"
import { TextField } from "../../../module/field/textField.js"
import { UUIDReferenceField } from "../../../module/field/UUIDReferenceField.js"

export class IncarnationData extends NephilimDataModel {

    static defineBase() {
        return {
            description: new TextField(),
            vecu: new foundry.data.fields.SchemaField
            (
                {
                    reference: new UUIDReferenceField
                    (
                        {
                            type: 'vecu'
                        }
                    )
                }
            ),
            cercles: new foundry.data.fields.SetField
            (
                new UUIDReferenceField(
                    {
                        type: 'cercle'
                    }
                )
            ),
            competences: new foundry.data.fields.SetField
            (
                new UUIDReferenceField(
                    {
                        type: 'competence'
                    }
                )
            )
        }
    }

    static defineVersions() {
        return {
            v1: IncarnationData.defineVersion1(),
            v5: IncarnationData.defineVersion5()
        }
    }

    static defineVersion1() {
        return new ChunkField
        (
            {
                vecu: new foundry.data.fields.SchemaField
                (
                    {
                        sapience: new foundry.data.fields.NumberField(),
                    }
                ),
                cercles: new foundry.data.fields.SetField
                (
                    new foundry.data.fields.SchemaField
                    (
                        {
                            reference: new UUIDReferenceField
                            (
                                {
                                    type: 'cercle'
                                }
                            ),
                            sapience: new foundry.data.fields.NumberField(),
                        }
                    )
                ),
                competences: new foundry.data.fields.SetField
                (
                    new foundry.data.fields.SchemaField
                    (
                        {
                            reference: new UUIDReferenceField
                            (
                                {
                                    type: 'competence'
                                }
                            ),
                            sapience: new foundry.data.fields.NumberField(),
                        }
                    )
                )
            },
            {
                collection: 'Item',
                scope: 'v1'
            }
        )
    }

    static defineVersion5() {
        return new ChunkField
        (
            {
                vecu: new foundry.data.fields.SchemaField
                (
                    {
                        sapience: new foundry.data.fields.NumberField(),
                    }
                ),
                cercles: new foundry.data.fields.SetField
                (
                    new foundry.data.fields.SchemaField
                    (
                        {
                            reference: new UUIDReferenceField
                            (
                                {
                                    type: 'cercle'
                                }
                            ),
                            sapience: new foundry.data.fields.NumberField(),
                        }
                    )
                ),
                competences: new foundry.data.fields.SetField
                (
                    new foundry.data.fields.SchemaField
                    (
                        {
                            reference: new UUIDReferenceField
                            (
                                {
                                    type: 'competence'
                                }
                            ),
                            sapience: new foundry.data.fields.NumberField(),
                        }
                    )
                )
            },
            {
                collection: 'Item',
                scope: 'v5'
            }
        )
    }  

}