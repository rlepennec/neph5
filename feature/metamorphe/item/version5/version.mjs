import { ChunkField } from "../../../../module/common/chunkField.js"

export class Version5 {

    static defineVersion() {
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
