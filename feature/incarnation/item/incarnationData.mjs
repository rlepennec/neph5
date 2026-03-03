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
                    reference: new UUIDReferenceField(
                        {
                            type: 'vecu'
                        }
                    ),
                    sapience: new foundry.data.fields.NumberField(),
                }
            ),
            competences: new foundry.data.fields.SetField
            (
                new foundry.data.fields.SchemaField
                (
                    {
                        reference: new UUIDReferenceField(
                            {
                                type: 'competence'
                            }
                        ),
                        sapience: new foundry.data.fields.NumberField(),
                    }
                )
            )
        }
    }

}