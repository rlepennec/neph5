import { ChunkField } from "../../../module/field/chunkField.js";
import { VersionField } from "../../../module/field/versionField.js";
import { UUIDField } from "../../../module/field/UUIDField.js";

/**
 * Une incarnation : une vie d'un acteur — figure ou fraternité — pendant une période.
 *
 * L'item n'existe qu'embarqué. Son `id` est sa clé, par laquelle tout le reste le désigne.
 * Il porte, par version de règles :
 *
 *   - `periode` : le sid de la période du monde ; plusieurs incarnations peuvent la partager ;
 *   - `actif`   : l'incarnation compte-t-elle pour l'acteur ;
 *   - `predecesseur` : la clé de l'incarnation immédiatement plus ancienne, null pour la tête
 *                 de la chronologie (la plus ancienne) ;
 *   - `successeur` : la clé de l'incarnation immédiatement plus récente, null pour la queue ;
 *   - `ka`      : les douze Ka de la figure à cette époque (pentacle, Soleil, Selenim) ;
 *   - `stase`   : la stase de la figure à cette époque (description, Ka), null si aucune ;
 *   - `sapience`, `sapienceDepensee` : la sapience de la figure à cette époque ; elle se
 *                 transmet, et une modification se reporte sur les incarnations postérieures ;
 *   - `pointsIncarnations` : les points d'incarnation de cette époque, indépendants ;
 *   - `alchimie` : le laboratoire de la figure à cette époque (constructs, materiae primae,
 *                 laboratoires accessibles, laboratoire courant) ;
 *   - `akasha`  : les voyages akashiques de la figure à cette époque (nef, barge, boussole,
 *                 compas) ;
 *   - `dommage` : les blessures de la figure à cette époque (cases physiques et magiques) ;
 *                 elles ne se transmettent pas ;
 *   - `bonus`   : les bonus de la figure à cette époque (mouvement, initiative, dommage,
 *                 protection) ;
 *   - `simulacre` : le sid de l'acteur simulacre de cette incarnation, null si aucun ; il ne se
 *                 transmet pas aux autres incarnations ;
 *
 * Elle porte aussi, comme effets (ActiveEffect), les états de la figure à cette époque
 * (désorienté, immobilisé, à terre, mort...) : seuls ceux de l'incarnation courante
 * s'appliquent (voir NephilimActiveEffect) ; ils ne se transmettent pas.
 *
 * Elle ne porte pas ce qui lui est lié : chaque objet lié (vécu, savoir, focus...) est un
 * exemplaire qui porte la clé de son incarnation (IncarnationField) et ses propres valeurs,
 * dont le degré acquis pendant elle.
 *
 * Seule la façade `Incarnations` lit et écrit ces champs.
 */
export class IncarnationDataModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        return {
            id: new UUIDField(
                {
                    required: true
                }
            ),
            versions: new ChunkField
            (
                {
                    v5: new VersionField
                    (
                        {
                            periode: new foundry.data.fields.StringField
                            (
                                {
                                    nullable: true,
                                    initial: null
                                }
                            ),
                            actif: new foundry.data.fields.BooleanField
                            (
                                {
                                    initial: true
                                }
                            ),
                            predecesseur: new foundry.data.fields.StringField
                            (
                                {
                                    nullable: true,
                                    initial: null
                                }
                            ),
                            successeur: new foundry.data.fields.StringField
                            (
                                {
                                    nullable: true,
                                    initial: null
                                }
                            ),
                            // Les Ka de la figure à cette époque, chacun indépendant de ceux des autres
                            // incarnations (voir Incarnations.kas).
                            ka: new foundry.data.fields.SchemaField
                            (
                                {
                                    air: new foundry.data.fields.NumberField({ initial: 0 }),
                                    eau: new foundry.data.fields.NumberField({ initial: 0 }),
                                    feu: new foundry.data.fields.NumberField({ initial: 0 }),
                                    lune: new foundry.data.fields.NumberField({ initial: 0 }),
                                    terre: new foundry.data.fields.NumberField({ initial: 0 }),
                                    soleil: new foundry.data.fields.NumberField({ initial: 0 }),
                                    noyau: new foundry.data.fields.NumberField({ initial: 0 }),
                                    brume: new foundry.data.fields.NumberField({ initial: 0 }),
                                    orichalque: new foundry.data.fields.NumberField({ initial: 0 }),
                                    pavane: new foundry.data.fields.NumberField({ initial: 0 }),
                                    reserve: new foundry.data.fields.NumberField({ initial: 0 }),
                                    reserveCourante: new foundry.data.fields.NumberField({ initial: 0 })
                                }
                            ),
                            // La sapience et la sapience dépensée, qui se transmettent et se reportent sur les
                            // incarnations postérieures ; les points d'incarnation, propres à cette époque (voir
                            // Incarnations.compteurs).
                            sapience: new foundry.data.fields.NumberField({ initial: 0 }),
                            sapienceDepensee: new foundry.data.fields.NumberField({ initial: 0 }),
                            pointsIncarnations: new foundry.data.fields.NumberField({ initial: 0 }),
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
                            ),
                            // Les voyages akashiques de la figure à cette époque : nef, barge, boussole,
                            // compas (voir Incarnations.akasha).
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
                            // Les blessures de la figure à cette époque, cases physiques et magiques (voir
                            // Incarnations.blessures) : elles ne se transmettent pas.
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
                            // Les bonus de la figure à cette époque (voir Incarnations.bonus).
                            bonus: new foundry.data.fields.SchemaField
                            (
                                {
                                    mouvement: new foundry.data.fields.NumberField({ initial: 0 }),
                                    initiative: new foundry.data.fields.NumberField({ initial: 0 }),
                                    dommage: new foundry.data.fields.NumberField({ initial: 0 }),
                                    protection: new foundry.data.fields.NumberField({ initial: 0 })
                                }
                            ),
                            // La stase de la figure à cette époque, null si elle n'en a pas (voir
                            // Incarnations.stase).
                            stase: new foundry.data.fields.SchemaField
                            (
                                {
                                    description: new foundry.data.fields.StringField({ initial: "" }),
                                    ka: new foundry.data.fields.NumberField({ initial: 0 })
                                },
                                {
                                    nullable: true,
                                    initial: null
                                }
                            ),
                            // Le sid de l'acteur simulacre de cette incarnation : il ne se transmet pas
                            // aux autres (voir Incarnations.simulacre).
                            simulacre: new foundry.data.fields.StringField
                            (
                                {
                                    nullable: true,
                                    initial: null
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
