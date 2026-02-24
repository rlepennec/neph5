import { ChunkField } from "./common/chunkField.js"
import { UUIDField } from "./common/UUIDField.js"

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

}