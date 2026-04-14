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
                    initial: 3
                }
            ),
            ka: new foundry.data.fields.NumberField(
                {
                    initial: 3
                }
            ),
            description: new foundry.data.fields.StringField(
                {
                    initial: ""
                }
            ), 
            dommage: new foundry.data.fields.SchemaField
            (
                {
                    physique: new foundry.data.fields.SchemaField
                    (
                        {
                            _1: new foundry.data.fields.BooleanField(
                                {
                                    initial: false
                                }
                            ),
                            _2: new foundry.data.fields.BooleanField(
                                {
                                    initial: false
                                }
                            ),
                            _3: new foundry.data.fields.BooleanField(
                                {
                                    initial: false
                                }
                            ),
                            _4: new foundry.data.fields.BooleanField(
                                {
                                    initial: false
                                }
                            ),                            
                            _5: new foundry.data.fields.BooleanField(
                                {
                                    initial: false
                                }
                            ),
                            mineure: new foundry.data.fields.BooleanField(
                                {
                                    initial: false
                                }
                            ),
                            serieuse: new foundry.data.fields.BooleanField(
                                {
                                    initial: false
                                }
                            ),
                            grave: new foundry.data.fields.BooleanField(
                                {
                                    initial: false
                                }
                            ),
                            mortelle: new foundry.data.fields.BooleanField(
                                {
                                    initial: false
                                }
                            )   
                        }
                    ),
                    magique: new foundry.data.fields.SchemaField
                    (
                        {
                            _1: new foundry.data.fields.BooleanField(
                                {
                                    initial: false
                                }
                            ),
                            _2: new foundry.data.fields.BooleanField(
                                {
                                    initial: false
                                }
                            ),
                            _3: new foundry.data.fields.BooleanField(
                                {
                                    initial: false
                                }
                            ),
                            mineure: new foundry.data.fields.BooleanField(
                                {
                                    initial: false
                                }
                            ),
                            serieuse: new foundry.data.fields.BooleanField(
                                {
                                    initial: false
                                }
                            ),
                            grave: new foundry.data.fields.BooleanField(
                                {
                                    initial: false
                                }
                            ),
                            mortelle: new foundry.data.fields.BooleanField(
                                {
                                    initial: false
                                }
                            ) 
                        }
                    ),
                }
            ),
            bonus: new foundry.data.fields.SchemaField
            (
                {
                    mouvement: new foundry.data.fields.NumberField(
                        {
                            initial: 0
                        }
                    ),
                    initiative: new foundry.data.fields.NumberField(
                        {
                            initial: 0
                        }
                    ),
                    dommage: new foundry.data.fields.NumberField(
                        {
                            initial: 0
                        }
                    ),
                    protection: new foundry.data.fields.NumberField(
                        {
                            initial: 0
                        }
                    )
                }
            ),
            options: new foundry.data.fields.SchemaField
            (
                {
                    theme: new foundry.data.fields.StringField(
                        {
                            initial: "soleil"
                        }
                    ),
                    degatAutomatique: new foundry.data.fields.BooleanField(
                        {
                            initial: true
                        }
                    ),
                }
            ),
        }
    }

}
