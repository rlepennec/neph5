import { ChunkField } from "../../../module/field/chunkField.js";
import { IncarnationField } from "../../../module/field/incarnationField.js";
import { UUIDField } from "../../../module/field/UUIDField.js";
import { VersionField } from "../../../module/field/versionField.js";

/**
 * Le laboratoire d'une figure à une époque : constructs, materiae primae du pentacle,
 * laboratoires accessibles, laboratoire courant (`alchimie`). Copié de l'antérieure active la
 * plus proche à la création de l'incarnation, puis indépendant.
 *
 * Un objet embarqué dans une figure, un par incarnation : il porte la clé de son incarnation
 * (`incarnation`, à la racine comme `id`) et ses propriétés propres aux règles. Il n'est pas
 * proposé à la création par Foundry et n'a pas de fiche : la façade Incarnations le crée avec
 * l'incarnation, le lit et l'écrit (voir Incarnations.REGLES).
 */
export class LaboratoireDataModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new UUIDField(
                {
                    required: true
                }
            ),
            incarnation: new IncarnationField(),
            versions: new ChunkField
            (
                {
                    v5: new VersionField
                    (
                        {
                            // Le laboratoire de la figure à cette époque : constructs, materiae primae du
                            // pentacle, laboratoires accessibles, laboratoire courant (voir
                            // Incarnations.alchimie).
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
                            )
                        },
                        { scope: 'v5' }
                    )
                },
                { scope: 'versions' }
            )
        }
    }

}
