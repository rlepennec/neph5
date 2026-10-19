import { ChunkField } from "../../../module/field/chunkField.js";
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
 *   - `simulacre` : le sid de l'acteur simulacre de cette incarnation, null si aucun ; il ne se
 *                 transmet pas aux autres incarnations ;
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
                    v1: new ChunkField({}, { scope: 'v1' }),
                    v5: new ChunkField
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
