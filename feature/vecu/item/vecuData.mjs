import { ReferenceDataField } from "../../../module/common/referenceDataField.js"

export class VecuData extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new foundry.data.fields.StringField(
                {
                    required: true,
                    initial: crypto.randomUUID()
                }
            ),
            competences: new foundry.data.fields.SetField(
                new ReferenceDataField(
                    {
                        required: true,
                        initial: null,
                        collection: 'items',
                        type: 'competence'
                    }
                )
            ),
            description: new foundry.data.fields.StringField(
                {
                    required: true,
                    initial: null
                }
            )
        }
    }

}
