import { ChunkField } from "./chunkField.js";

/**
 * Une version de règles d'un document (objet ou acteur) : les champs qui n'existent que sous ces
 * règles, et `enabled`, à plat avec eux, qui dit si le document appartient à cette version. Il
 * l'est par défaut ; le MJ le décoche dans la fenêtre de configuration du document (voir
 * AbstractOptionsSelector). Un document décoché reste dans le monde : il est masqué en vue
 * stricte (voir Version.appartient, Version.visible).
 *
 * Ex. : `v5: new VersionField({ description, element }, { scope: 'v5' })` porte `enabled`,
 * `description` et `element`.
 */
export class VersionField extends ChunkField {

    /**
     * @param fields  Les champs propres à cette version de règles.
     * @param options Les options du champ, dont la portée (le nom de la version).
     */
    constructor(fields = {}, options = {}) {
        super({ enabled: new foundry.data.fields.BooleanField({ initial: true }), ...fields }, options);
    }

}
