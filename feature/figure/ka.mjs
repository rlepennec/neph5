import { ChunkField } from "../../module/field/chunkField.js";
import { IncarnationField } from "../../module/field/incarnationField.js";
import { UUIDField } from "../../module/field/UUIDField.js";
import { VersionField } from "../../module/field/versionField.js";

/**
 * Les Ka d'une figure à une époque, et ce qui s'y rattache : les douze Ka (`ka`), la
 * sapience et la sapience dépensée (transmises, et reportées sur les incarnations
 * postérieures), les points d'incarnation (propres à l'époque), les blessures (`dommage`, qui
 * ne se transmettent pas) et les bonus (transmis).
 *
 * Un objet embarqué dans une figure, un par incarnation : il porte la clé de son incarnation
 * (`incarnation`, à la racine comme `id`) et ses propriétés propres aux règles. Il n'est pas
 * proposé à la création par Foundry et n'a pas de fiche : la façade Incarnations le crée avec
 * l'incarnation, le lit et l'écrit (voir Incarnations.REGLES).
 */
export class KaDataModel extends foundry.abstract.TypeDataModel {

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
