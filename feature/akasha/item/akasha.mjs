import { ChunkField } from "../../../module/field/chunkField.js";
import { IncarnationField } from "../../../module/field/incarnationField.js";
import { UUIDField } from "../../../module/field/UUIDField.js";
import { VersionField } from "../../../module/field/versionField.js";

/**
 * Les voyages akashiques d'une figure à une époque : nef, barge, boussole, compas (`akasha`).
 * Copiés de l'antérieure active la plus proche à la création de l'incarnation, puis
 * indépendants.
 *
 * Un objet embarqué dans une figure, un par incarnation : il porte la clé de son incarnation
 * (`incarnation`, à la racine comme `id`) et ses propriétés propres aux règles. Il n'est pas
 * proposé à la création par Foundry et n'a pas de fiche : la façade Incarnations le crée avec
 * l'incarnation, le lit et l'écrit (voir Incarnations.REGLES).
 */
export class AkashaDataModel extends foundry.abstract.TypeDataModel {

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
