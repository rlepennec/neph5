export class ArmeDataModel extends foundry.abstract.TypeDataModel {

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
            parade: new foundry.data.fields.BooleanField(
                {
                    required: false
                }
            ),
            type: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            competence: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            attack: new foundry.data.fields.NumberField(
                {
                    required: false
                }
            ),
            defense: new foundry.data.fields.NumberField(
                {
                    required: false
                }
            ),
            damages: new foundry.data.fields.NumberField(
                {
                    required: false
                }
            ),
            blocage: new foundry.data.fields.BooleanField(
                {
                    required: false
                }
            ),
            physique: new foundry.data.fields.BooleanField(
                {
                    required: false
                }
            ),
            magique: new foundry.data.fields.BooleanField(
                {
                    required: false
                }
            ),
            ammunition: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ),
            munitions: new foundry.data.fields.NumberField(
                {
                    required: false
                }
            ),   
            tire: new foundry.data.fields.NumberField(
                {
                    required: false
                }
            ),
            cible: new foundry.data.fields.BooleanField(
                {
                    required: false
                }
            ),
            visee: new foundry.data.fields.NumberField(
                {
                    required: false
                }
            ),           
            lance: new foundry.data.fields.BooleanField(
                {
                    required: false
                }
            ),
            salve: new foundry.data.fields.BooleanField(
                {
                    required: false
                }
            ),
            rafale: new foundry.data.fields.BooleanField(
                {
                    required: false
                }
            )
        }
    }

}
