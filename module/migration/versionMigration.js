/**
 * Le passage des champs de la racine vers les versions de règles.
 *
 * POURQUOI CE FICHIER EXISTE. Un champ retiré du schéma est élagué au chargement du
 * document : `DataField.clean` appelle `_migrate` puis `_cleanType`, et le second écarte
 * les clés que le schéma ne déclare plus. Un script de migration tournant au démarrage ne
 * trouverait donc plus rien à déplacer — la donnée serait perdue, sans bruit. Le seul
 * crochet appelé avant cet élagage est `migrateData`, sur le modèle lui-même.
 *
 * Le crochet doit donc rester dans le modèle, mais la CONNAISSANCE de la transition, elle,
 * n'a rien à y faire : un modèle décrit une forme, il n'a pas à raconter d'où elle vient.
 * Les modèles se contentent d'une délégation d'une ligne, et toute la table est ici, avec
 * les migrations.
 *
 * QUAND ON POURRA SUPPRIMER TOUT CECI. Trois conditions, toutes nécessaires :
 *   1. les mondes ont été réécrits — c'est le rôle du script _1_0_9, qui force une écriture
 *      par document pour fixer la nouvelle forme en base ;
 *   2. le compendium du système a été transformé hors ligne, sans quoi chaque import y
 *      réintroduit l'ancienne forme, indéfiniment ;
 *   3. un garde-fou refuse d'ouvrir un monde resté en deçà de la version de migration,
 *      pour que celui qui saute des versions voie un message au lieu de perdre ses données.
 *
 * Ces conditions réunies, il suffit de vider CHAMPS et de retirer les délégations.
 *
 * ATTENTION, LE PIÈGE. `migrateData` est aussi appelée sur les mises à jour PARTIELLES :
 * `_preUpdateSource` nettoie les changements avec `migrate: true`. La transformation ne
 * doit donc jamais supposer le document complet, ni compléter ce qui manque — elle ne
 * touche que les clés effectivement présentes.
 */
export class VersionMigration {

    /**
     * Les champs qui ont quitté la racine, par type de document puis par version.
     */
    static CHAMPS = {
        alchimie:    { v5: ['description'] },
        appel:       { v5: ['description', 'degre', 'appel', 'controle', 'visibilite', 'entropie', 'dommages', 'protection', 'cercle', 'status', 'periode', 'focus'] },
        arcane:      { v5: ['description', 'degre', 'periode'] },
        arme:        { v5: ['description', 'used', 'parade', 'type', 'competence', 'attack', 'defense', 'damages', 'blocage', 'physique', 'magique', 'ammunition', 'munitions', 'tire', 'cible', 'visee', 'lance', 'salve', 'rafale'] },
        armure:      { v5: ['description', 'used', 'physique', 'magique'] },
        aspect:      { v5: ['description', 'degre', 'activation', 'duree', 'active'] },
        atlanteide:  { v5: ['description', 'cercle', 'degre', 'periode'] },
        capacite:    { v5: ['description', 'degre', 'periode'] },
        catalyseur:  { v5: ['description'] },
        chute:       { v5: ['key', 'description', 'degre', 'periode'] },
        competence:  { v5: ['description', 'element'] },
        divination:  { v5: ['description', 'cercle', 'degre', 'periode'] },
        dracomachie: { v5: ['description', 'cercle', 'degre', 'periode'] },
        figurant:    { v5: ['menace', 'ka', 'description', 'dommage', 'bonus', 'options'] },
        figure:      { v5: ['description', 'simulacre', 'periode', 'sapience', 'sapienceDepensee', 'pointsIncarnations', 'ka', 'manoeuvres', 'stase', 'alchimie', 'akasha', 'dommage', 'bonus', 'options'] },
        formule:     { v5: ['description', 'degre', 'cercle', 'substance', 'enonce', 'aire', 'duree', 'elements', 'catalyseurs', 'variantes', 'echec', 'maladresse', 'focus', 'status', 'quantite', 'transporte', 'periode'] },
        fraternite:  { v5: ['periode', 'effectif', 'description', 'options'] },
        habitus:     { v5: ['description', 'domaine', 'element', 'voies', 'incantation', 'degre', 'portee', 'duree', 'periode'] },
        invocation:  { v5: ['description', 'sephirah', 'monde', 'element', 'degre', 'portee', 'duree', 'visibilite', 'focus', 'status', 'pacte', 'periode'] },
        magie:       { v5: ['description'] },
        materiae:    { v5: ['description', 'element', 'quantite'] },
        metamorphe:  { v5: ['element', 'description', 'metamorphoses', 'formed', 'visible', 'humeur', 'portrait'] },
        ordonnance:  { v5: ['description', 'monde', 'periode'] },
        passe:       { v5: ['description', 'degre', 'periode'] },
        periode:     { v5: ['description', 'aube', 'contexte', 'actif', 'previous'] },
        pratique:    { v5: ['description', 'cercle', 'degre', 'periode'] },
        quete:       { v5: ['description', 'degre', 'periode'] },
        rite:        { v5: ['description', 'cercle', 'desmos', 'status', 'periode', 'focus'] },
        rituel:      { v5: ['description', 'cercle', 'degre', 'periode'] },
        savoir:      { v5: ['description', 'degre', 'periode'] },
        science:     { v5: ['key', 'description', 'degre', 'periode'] },
        sort:        { v5: ['cercle', 'element', 'degre', 'portee', 'duree', 'voies', 'incantation', 'syntaxe', 'description', 'focus', 'status', 'periode'] },
        technique:   { v5: ['description', 'cercle', 'degre', 'periode'] },
        tekhne:      { v5: ['description', 'cercle', 'degre', 'periode'] },
        vecu:        { v5: ['description', 'degre', 'periode', 'element', 'competences', 'mnemos'] }
    };

    /**
     * @param type   The document type, as declared by the manifest.
     * @param source The raw source data, possibly partial.
     * @returns the migrated source data.
     */
    static apply(type, source) {

        const versions = VersionMigration.CHAMPS[type];
        if (versions == null || source == null) {
            return source;
        }

        for (const [version, champs] of Object.entries(versions)) {
            for (const champ of champs) {

                // Absent de ce qu'on nous donne : rien à déplacer. C'est le cas de toutes
                // les mises à jour partielles, et des documents déjà migrés.
                if (source[champ] === undefined) continue;

                source.versions ??= {};
                source.versions[version] ??= {};

                // Une valeur déjà rangée dans la version l'emporte : la passerelle répare,
                // elle n'écrase pas.
                source.versions[version][champ] ??= source[champ];
                delete source[champ];
            }
        }

        return source;
    }

}
