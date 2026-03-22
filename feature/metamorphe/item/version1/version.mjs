import { ChunkField } from "../../../../module/field/chunkField.js"
import { TextField } from "../../../../module/field/textField.js"

export class Version1 {

    static defineItem() {
        return new ChunkField(
            {
                metamorphoses: new foundry.data.fields.SchemaField
                (
                    {
                        main: new foundry.data.fields.SchemaField
                        (
                            {
                                titre: new TextField(),
                                description : new TextField(),
                            }
                        ),
                        odeur: new foundry.data.fields.SchemaField
                        (
                            {
                                titre: new TextField(),
                                description : new TextField(),
                            }
                        ),
                        peau: new foundry.data.fields.SchemaField
                        (
                            {
                                titre: new TextField(),
                                description : new TextField(),
                            }
                        ),
                        visage: new foundry.data.fields.SchemaField
                        (
                            {
                                titre: new TextField(),
                                description : new TextField(),
                            }
                        ),
                        voix: new foundry.data.fields.SchemaField
                        (
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
    
    static defineActor() {
        return new foundry.data.fields.SchemaField(
            {
                main: new foundry.data.fields.NumberField
                (
                    {
                        initial: 0
                    }
                ),
                odeur: new foundry.data.fields.NumberField
                (
                    {
                        initial: 0
                    }
                ),
                peau: new foundry.data.fields.NumberField
                (
                    {
                        initial: 0
                    }
                ),
                visage: new foundry.data.fields.NumberField
                (
                    {
                        initial: 0
                    }
                ),
                voix: new foundry.data.fields.NumberField
                (
                    {
                        initial: 0
                    }
                )
            }
        )
    }

}
