export class ArmureDataModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new foundry.data.fields.StringField(
                {
                    required: true
                }
            ),
            description: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            used: new foundry.data.fields.BooleanField(
                {
                    required: false
                }
            ),
            physique: new foundry.data.fields.NumberField(
                {
                    required: false
                }
            ),
            magique: new foundry.data.fields.NumberField(
                {
                    required: false
                }
            )
        }
    }

}
