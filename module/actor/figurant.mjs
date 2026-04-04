export class FigurantDataModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new foundry.data.fields.StringField(
                {
                    required: true
                }
            ),
            menace: new foundry.data.fields.NumberField(
                {
                    required: false
                }
            ),
            ka: new foundry.data.fields.NumberField(
                {
                    required: false
                }
            ),
            description: new foundry.data.fields.StringField(
                {
                    required: false
                }
            ), 
            options: new foundry.data.fields.SchemaField
            (
                {
                    theme: new foundry.data.fields.StringField(),
                    degatAutomatique: new foundry.data.fields.BooleanField(),
                }
            ),
            dommage: new foundry.data.fields.SchemaField
            (
                {
                    physique: new foundry.data.fields.SchemaField
                    (
                        {
                            _1: new foundry.data.fields.BooleanField(),
                            _2: new foundry.data.fields.BooleanField(),
                            _3: new foundry.data.fields.BooleanField(),
                            _4: new foundry.data.fields.BooleanField(),                            
                            _5: new foundry.data.fields.BooleanField(),
                            mineure: new foundry.data.fields.BooleanField(),
                            serieuse: new foundry.data.fields.BooleanField(),
                            grave: new foundry.data.fields.BooleanField(),
                            mortelle: new foundry.data.fields.BooleanField()   
                        }
                    ),
                    magique: new foundry.data.fields.SchemaField
                    (
                        {
                            _1: new foundry.data.fields.BooleanField(),
                            _2: new foundry.data.fields.BooleanField(),
                            _3: new foundry.data.fields.BooleanField(),
                            mineure: new foundry.data.fields.BooleanField(),
                            serieuse: new foundry.data.fields.BooleanField(),
                            grave: new foundry.data.fields.BooleanField(),
                            mortelle: new foundry.data.fields.BooleanField() 
                        }
                    ),
                }
            ),
            bonus: new foundry.data.fields.SchemaField
            (
                {
                    mouvement: new foundry.data.fields.NumberField(),
                    initiative: new foundry.data.fields.NumberField(),
                    dommage: new foundry.data.fields.NumberField(),
                    protection: new foundry.data.fields.NumberField(),
                }
            )
        }
    }

}
