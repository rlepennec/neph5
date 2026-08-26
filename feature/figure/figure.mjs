import { UUIDField } from "../../module/field/UUIDField.js";

export class FigureDataModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new UUIDField(
                {
                    required: true
                }
            ),
            description: new foundry.data.fields.StringField(
                {
                    initial: ""
                }
            ),
            simulacre: new foundry.data.fields.StringField(
                {
                    nullable: true,
                    initial: null
                }
            ),
            periode: new foundry.data.fields.StringField(
                {
                    nullable: true,
                    initial: null
                }
            ),
            sapience: new foundry.data.fields.NumberField(
                {
                    initial: 0
                }
            ),
            sapienceDepensee: new foundry.data.fields.NumberField(
                {
                    initial: 0
                }
            ),
            pointsIncarnations: new foundry.data.fields.NumberField(
                {
                    initial: 0
                }
            ),
            ka: new foundry.data.fields.SchemaField
            (
                {
                    air: new foundry.data.fields.NumberField(
                        {
                            initial: 0
                        }
                    ),
                    brume: new foundry.data.fields.NumberField(
                        {
                            initial: 0
                        }
                    ),
                    eau: new foundry.data.fields.NumberField(
                        {
                            initial: 0
                        }
                    ),
                    feu: new foundry.data.fields.NumberField(
                        {
                            initial: 0
                        }
                    ),
                    lune: new foundry.data.fields.NumberField(
                        {
                            initial: 0
                        }
                    ),
                    noyau: new foundry.data.fields.NumberField(
                        {
                            initial: 0
                        }
                    ),
                    orichalque: new foundry.data.fields.NumberField(
                        {
                            initial: 0
                        }
                    ),
                    pavane: new foundry.data.fields.NumberField(
                        {
                            initial: 0
                        }
                    ),
                    reserve: new foundry.data.fields.NumberField(
                        {
                            initial: 0
                        }
                    ),
                    reserveCourante: new foundry.data.fields.NumberField(
                        {
                            initial: 0
                        }
                    ),
                    soleil: new foundry.data.fields.NumberField(
                        {
                            initial: 0
                        }
                    ),
                    terre: new foundry.data.fields.NumberField(
                        {
                            initial: 0
                        }
                    )
                }
            ),
            manoeuvres: new foundry.data.fields.SchemaField
            (
                {
                    esquive: new foundry.data.fields.StringField(
                    {
                            required: false,
                            nullable: true,
                            initial: null
                        }
                    ),
                    lutte: new foundry.data.fields.StringField(
                        {
                            required: false,
                            nullable: true,
                            initial: null
                        }
                    )
                }
            ),
            stase: new foundry.data.fields.SchemaField
            (
                {
                    description: new foundry.data.fields.StringField(
                        {
                            required: false
                        }
                    ),
                    ka: new foundry.data.fields.NumberField(
                        {
                            initial: 0
                        }
                    )
                }
            ),
            alchimie: new foundry.data.fields.SchemaField
            (
                {
                    courant: new foundry.data.fields.StringField(
                        {
                            required: false,
                            nullable: true,
                            initial: null
                        }
                    ),
                    laboratoires: new foundry.data.fields.ArrayField
                    (
                        new foundry.data.fields.StringField(),
                        {
                            required: false
                        }
                    ),
                    constructs: new foundry.data.fields.SchemaField
                    (
                        {
                            cornue: new foundry.data.fields.SchemaField
                            (
                                {
                                    active: new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    degre: new foundry.data.fields.StringField(
                                        {
                                            nullable: true,
                                            initial: null
                                        }
                                    ),
                                    air: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    ),
                                    eau: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    ),
                                    feu: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    ),
                                    lune: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    ),
                                    terre: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    )                                 
                                }
                            ),
                            creuset: new foundry.data.fields.SchemaField
                            (
                                {
                                    active: new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    degre: new foundry.data.fields.StringField(
                                        {
                                            nullable: true,
                                            initial: null
                                        }
                                    ),
                                    air: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    ),
                                    eau: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    ),
                                    feu: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    ),
                                    lune: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    ),
                                    terre: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    )                                 
                                }
                            ),
                            athanor: new foundry.data.fields.SchemaField
                            (
                                {
                                    active: new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    degre: new foundry.data.fields.StringField(
                                        {
                                            nullable: true,
                                            initial: null
                                        }
                                    ),
                                    air: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    ),
                                    eau: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    ),
                                    feu: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    ),
                                    lune: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    ),
                                    terre: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    )                                 
                                }
                            ),
                            aludel: new foundry.data.fields.SchemaField
                            (
                                {
                                    active: new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    degre: new foundry.data.fields.StringField(
                                        {
                                            nullable: true,
                                            initial: null
                                        }
                                    ),
                                    air: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    ),
                                    eau: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    ),
                                    feu: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    ),
                                    lune: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    ),
                                    terre: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    )                                 
                                }
                            ),
                            alambic: new foundry.data.fields.SchemaField
                            (
                                {
                                    active: new foundry.data.fields.BooleanField(
                                        {
                                            initial: false
                                        }
                                    ),
                                    degre: new foundry.data.fields.StringField(
                                        {
                                            nullable: true,
                                            initial: null
                                        }
                                    ),
                                    air: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    ),
                                    eau: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    ),
                                    feu: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    ),
                                    lune: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    ),
                                    terre: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    )                                 
                                }
                            )
                        }
                    ),
                    primae: new foundry.data.fields.SchemaField
                    (
                        {
                            air: new foundry.data.fields.SchemaField
                            (
                                {
                                    quantite: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    ),
                                    max: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    )                               
                                }
                            ),
                            eau: new foundry.data.fields.SchemaField
                            (
                                {
                                    quantite: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    ),
                                    max: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    )                               
                                }
                            ),
                            feu: new foundry.data.fields.SchemaField
                            (
                                {
                                    quantite: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    ),
                                    max: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    )                               
                                }
                            ),
                            lune: new foundry.data.fields.SchemaField
                            (
                                {
                                    quantite: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    ),
                                    max: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    )                               
                                }
                            ),
                            terre: new foundry.data.fields.SchemaField
                            (
                                {
                                    quantite: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    ),
                                    max: new foundry.data.fields.NumberField(
                                        {
                                            initial: 0
                                        }
                                    )                               
                                }
                            )
                        }
                    )
                }
            ),
            akasha: new foundry.data.fields.SchemaField(
                {
                    nef: new foundry.data.fields.SchemaField(
                        {
                            active: new foundry.data.fields.BooleanField(
                                {
                                    initial: false
                                }
                            )
                        }
                    ),
                    boussole: new foundry.data.fields.SchemaField(
                        {
                            septentrion: new foundry.data.fields.NumberField(
                                {
                                    initial: 0
                                }
                            ),
                            orient: new foundry.data.fields.NumberField(
                                {
                                    initial: 0
                                }
                            ),
                            midi: new foundry.data.fields.NumberField(
                                {
                                    initial: 0
                                }
                            ),
                            occident: new foundry.data.fields.NumberField(
                                {
                                    initial: 0
                                }
                            ),
                            zenith: new foundry.data.fields.NumberField(
                                {
                                    initial: 0
                                }
                            ),                                                                                
                            nadir: new foundry.data.fields.NumberField(
                                {
                                    initial: 0
                                }
                            )
                        }
                    ),
                    barge: new foundry.data.fields.SchemaField(
                        {
                            active: new foundry.data.fields.BooleanField(
                                {
                                    initial: false
                                }
                            )
                        }
                    ),
                    compas: new foundry.data.fields.SchemaField(
                        {
                            septentrion: new foundry.data.fields.NumberField(
                                {
                                    initial: 0
                                }
                            ),
                            orient: new foundry.data.fields.NumberField(
                                {
                                    initial: 0
                                }
                            ),
                            midi: new foundry.data.fields.NumberField(
                                {
                                    initial: 0
                                }
                            ),
                            occident: new foundry.data.fields.NumberField(
                                {
                                    initial: 0
                                }
                            ),
                            zenith: new foundry.data.fields.NumberField(
                                {
                                    initial: 0
                                }
                            ),                                                                                
                            nadir: new foundry.data.fields.NumberField(
                                {
                                    initial: 0
                                }
                            )
                        }
                    )
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
                    "alchimie": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "anamorphose": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "conjuration": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "description": new foundry.data.fields.BooleanField(
                        {
                            initial: true
                        }
                    ),
                    "simulacre": new foundry.data.fields.BooleanField(
                        {
                            initial: true
                        }
                    ),
                    "fraternites": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "incarnations": new foundry.data.fields.BooleanField(
                        {
                            initial: true
                        }
                    ),
                    "combat": new foundry.data.fields.BooleanField(
                        {
                            initial: true
                        }
                    ),
                    "kabbale": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "magie": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "analogie": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "atlanteide": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "dracomachie": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "necromancie": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "soleil": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "bohemien": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "nephilim": new foundry.data.fields.BooleanField(
                        {
                            initial: true
                        }
                    ),
                    "vecus": new foundry.data.fields.BooleanField(
                        {
                            initial: true
                        }
                    ),
                    "capacites": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "selenim": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "akasha": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "boussole": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "compas": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "baton": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "coupe": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "denier": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "degatAutomatique": new foundry.data.fields.BooleanField(
                        {
                            initial: true
                        }
                    ),
                    "epee": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "chronologieDescendante": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "degreGauche": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "incarnationsOuvertes": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "gestionLaboratoire": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "daath": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "theme": new foundry.data.fields.StringField(
                        {
                            initial: "soleil"
                        }
                    ),
                    "luneNoire": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "locked": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    ),
                    "defenseMJ": new foundry.data.fields.BooleanField(
                        {
                            initial: false
                        }
                    )
                }
            )
        }
    }

}
