import { ChunkField } from "../../../../module/common/chunkField.js"
import { TextField } from "../../../../module/common/textField.js"

export class Version1 {

    static defineVersion() {
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
    
}
