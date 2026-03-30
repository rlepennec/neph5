import { ChunkField } from "./field/chunkField.js"
import { UUIDField } from "./field/UUIDField.js"
import { UUIDReferenceField } from "./field/UUIDReferenceField.js"

export class NephilimDataModel extends foundry.abstract.TypeDataModel {

    static defineBase() {
        return {};
    }

    static defineVersions() {
        return {};
    }

    static defineSchema() {
        return {
            sid: new UUIDField
            (
                {
                    required: true
                }
            ),
            base: new ChunkField
            (
                {
                    ...this.defineBase()
                },
                {
                    collection: 'Item',
                    scope: 'base'
                }
            ),
            versions: new ChunkField
            (
                {
                    ...this.defineVersions()
                },
                {
                    collection: 'Item',
                    scope: 'versions'
                }
            )
        }
    }

    static defineReferenceOf(type) {
        return new foundry.data.fields.SchemaField(
            {
                reference: new UUIDReferenceField
                (
                    {
                        type: type
                    }
                )
            }
        )
    }

    static defineReferencesOf(type) {
        return new foundry.data.fields.SetField(
            new foundry.data.fields.SchemaField
            (
                {
                    reference: new UUIDReferenceField
                    (
                        {
                            type: type
                        }
                    )
                } 
            )
        )
    }

}