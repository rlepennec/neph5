export class PeriodeDataModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new foundry.data.fields.StringField
            (
                {
                    required: true
                }
            ),
            description: new foundry.data.fields.StringField
            (
                {
                    required: false
                }
            ),
            aube: new foundry.data.fields.StringField
            (
                {
                    required: false
                }
            ),
            contexte: new foundry.data.fields.StringField
            (
                {
                    required: false
                }
            ),
            actif: new foundry.data.fields.BooleanField
            (
                {
                    required: false
                }
            ),
            previous: new foundry.data.fields.StringField
            (
                {
                    required: false,
                    nullable: true,
                    initial: null
                }
            )
        }
    }

}