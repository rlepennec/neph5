import { ChunkField } from "../../../module/field/chunkField.js";
import { UUIDField } from "../../../module/field/UUIDField.js";

/**
 * Une incarnation : une vie d'un acteur — figure ou fraternité — pendant une période.
 *
 * L'item n'existe qu'embarqué. Son `id` est sa clé, par laquelle tout le reste le désigne.
 * Il porte, par version de règles :
 *
 *   - `periode` : le sid de la période du monde ; plusieurs incarnations peuvent la partager ;
 *   - `vecus`   : les sids de ses vécus embarqués — aucun, un ou plusieurs. Chacun porte la
 *                 période de l'incarnation, et son propre degré ;
 *   - `actif`   : l'incarnation compte-t-elle pour l'acteur ;
 *   - `rang`    : sa place dans la chronologie, du plus ancien (petit) au plus récent (grand) ;
 *   - `apports` : les autres items acquis pendant l'incarnation, par sid d'item embarqué, avec
 *                 le degré acquis pour ceux qui en ont un (savoir, quête, arcane, science, passe
 *                 d'armes, chute), null pour les autres (focus, capacité).
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
                            vecus: new foundry.data.fields.ArrayField
                            (
                                new foundry.data.fields.StringField()
                            ),
                            actif: new foundry.data.fields.BooleanField
                            (
                                {
                                    initial: true
                                }
                            ),
                            rang: new foundry.data.fields.NumberField
                            (
                                {
                                    integer: true,
                                    initial: 0
                                }
                            ),
                            apports: new foundry.data.fields.ArrayField
                            (
                                new foundry.data.fields.SchemaField
                                (
                                    {
                                        sid: new foundry.data.fields.StringField(),
                                        degre: new foundry.data.fields.NumberField
                                        (
                                            {
                                                nullable: true,
                                                initial: null
                                            }
                                        )
                                    }
                                )
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
