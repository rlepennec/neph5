import { ChunkField } from "../../../../module/field/chunkField.js"

export class Version5 {

    static defineItem() {
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
    
    static defineActor() {
        return new foundry.data.fields.ArrayField(
            new foundry.data.fields.NumberField(),
            {
                initial: Array(10).fill(0),
                max: 10
            }
        )
    }

}
