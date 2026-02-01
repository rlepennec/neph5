import { NephilimDataModel } from "../../../module/common/nephilimDataModel.js"
import { TextField } from "../../../module/common/textField.js"
import { UUIDReferenceField } from "../../../module/common/UUIDReferenceField.js"

export class FigureData extends NephilimDataModel {

    static defineBase() {
        return {
            description: new TextField(),
            incarnations: new foundry.data.fields.ArrayField(
                new foundry.data.fields.SchemaField(
                    {
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
                                            initial: ''
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
                        description: new TextField(),
                    }
                )
            )
        }
    }

}