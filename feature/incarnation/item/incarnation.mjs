import { ChunkField } from "../../../module/field/chunkField.js";
import { VersionField } from "../../../module/field/versionField.js";
import { UUIDField } from "../../../module/field/UUIDField.js";

/**
 * Une incarnation : une vie d'un acteur — figure ou fraternité — pendant une période.
 *
 * L'item n'existe qu'embarqué. Son `id` est sa clé, par laquelle tout le reste le désigne.
 * Il porte, communs à toutes les versions de règles (à la racine de `system`) :
 *
 *   - `periode` : le sid de la période du monde ; plusieurs incarnations peuvent la partager ;
 *   - `actif`   : l'incarnation compte-t-elle pour l'acteur ;
 *   - `predecesseur` : la clé de l'incarnation immédiatement plus ancienne, null pour la tête
 *                 de la chronologie (la plus ancienne) ;
 *   - `successeur` : la clé de l'incarnation immédiatement plus récente, null pour la queue ;
 *   - `stase`   : la stase de la figure à cette époque (description, Ka), null si aucune ;
 *   - `simulacre` : le sid de l'acteur simulacre de cette incarnation, null si aucun ; il ne se
 *                 transmet pas aux autres incarnations ;
 *
 * Ce qui est propre aux règles n'est plus porté par l'incarnation mais par des objets embarqués
 * dans la figure, un de chaque par incarnation, qui portent sa clé (voir Incarnations.REGLES) :
 * le laboratoire (LaboratoireDataModel), l'akasha (AkashaDataModel) et le ka (KaDataModel).
 * Ils portaient, dans l'incarnation (`versions.<version>`) :
 *
 *   - `ka`      : les douze Ka de la figure à cette époque (pentacle, Soleil, Selenim) ;
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
 *                 protection).
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
            // Ce qui est commun à toutes les versions de règles : la place de l'incarnation dans
            // la chronologie, sa stase et son simulacre.
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
            ),
            versions: new ChunkField
            (
                {
                    v5: new VersionField({}, { scope: 'v5' })
                },
                { scope: 'versions' }
            )
        }
    }

}
