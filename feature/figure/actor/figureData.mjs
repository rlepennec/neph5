import { Constants } from "../../../module/common/constants.js";
import { NephilimDataModel } from "../../../module/common/nephilimDataModel.js"
import { TextField } from "../../../module/common/textField.js"

export class FigureData extends NephilimDataModel {

    static defineBase() {
        return {
            description: new TextField(),
            incarnations: new foundry.data.fields.ArrayField(
                new foundry.data.fields.SchemaField(
                    {
                        vecu: new UUIDReferenceField(
                            {
                                collection: 'Item',
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
                                            collection: 'Item',
                                            type: 'base',
                                            droppable: false,
                                            openable: false,
                                            duplicable: false,
                                        }
                                    ),
                                    sapience: new foundry.data.fields.NumericField(
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