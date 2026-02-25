import { NephilimDataModel } from "../../../module/nephilimDataModel.js"
import { TextField } from "../../../module/field/textField.js"
import { UUIDReferenceField } from "../../../module/field/UUIDReferenceField.js"

export class FigureData extends NephilimDataModel {

    static defineBase() {
        return {
            description: new TextField(),
            incarnations: new foundry.data.fields.ArrayField(
                new foundry.data.fields.SchemaField(
                    {
                        description: new TextField(),
                        vecu: new UUIDReferenceField(
                            {
                                type: 'vecu',
                                droppable: false,
                                openable: false,
                                duplicable: false,
                            }
                        ),
                        ameliorations: new foundry.data.fields.ArrayField(
                            new foundry.data.fields.SchemaField(
                                {
                                    type: new foundry.data.fields.StringField(
                                        {
                                            required: true,
                                            initial: 'base',
                                            choices: game.documentTypes.Item
                                        }
                                    ),
                                    uuid: new UUIDReferenceField(
                                        {
                                            droppable: false,
                                            openable: false,
                                            duplicable: false,
                                        }
                                    ),
                                    sapience: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    ),
                                    version: new foundry.data.fields.StringField(
                                        {
                                            initial: 'base'
                                        }
                                    )
                                }
                            )
                        ),
                        /*
                        metamorphe: new foundry.data.fields.ArrayField(

                        ),
                        */
                    }
                )
            )
        }
    }

}