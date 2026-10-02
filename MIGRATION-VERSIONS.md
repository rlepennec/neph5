# Versions de règles — état du chantier et reprise

Ce document permet de reprendre le portage des modèles de données vers les versions de
règles sans rien redécouvrir : la conception retenue, ce qui est fait, la recette à
appliquer type par type, et les pièges qui ont déjà coûté du temps.

**Où vit le travail** : branche `task/v14-rules`. (Git refuse `task/v14/rules` tant qu'une
branche `task/v14` existe : une référence ne peut pas être à la fois un fichier et un
répertoire.)

---

## 1. Ce qu'on veut

Un même document porte les données de **plusieurs éditions des règles** à la fois. Le
système affiche l'une d'elles, et pourra décrire les autres plus tard.

### Décisions prises, et pourquoi

| Décision | Raison |
|---|---|
| Le **tronc commun** se limite à `id` et `illustration` — à `id` **seul** pour les acteurs, `options` compris dans les versions (choix explicite) | `id` porte toutes les références — `sid` n'est qu'un accesseur sur `system.id`, donc la migration ne touche pas à la machinerie des références. `illustration` ne dépend pas des règles et le système la pose lui-même à la création comme à la duplication. |
| La **description appartient aux versions** | Le texte d'un objet peut être réécrit d'une édition à l'autre. Conséquence : les 35 modèles en ont une, donc **aucun type ne peut être laissé de côté**. |
| La version affichée est un état de **fiche**, pas de document | Deux fenêtres ouvertes sur le même objet peuvent montrer deux éditions ; rien n'est écrit dans le document. |
| La version **par défaut** est un réglage de monde, réservé au MJ | Hors d'une fiche — chat, listes sur une feuille d'acteur — personne ne choisit : on prend celle du monde. |
| `v1` est un chunk **vide** | La première édition sera décrite plus tard. Une fiche ouverte dessus n'affiche que son en-tête. |

### Forme cible d'un schéma

```js
static defineSchema() {
    return {
        id: new UUIDField({ required: true }),
        illustration: new foundry.data.fields.FilePathField({ ... }),
        versions: new ChunkField(
            {
                v1: new ChunkField({}, { scope: 'v1' }),
                v5: new ChunkField({ /* tous les autres champs, inchangés */ }, { scope: 'v5' })
            },
            { scope: 'versions' }
        )
    }
}

static migrateData(source) {
    return VersionMigration.apply('<type>', source);
}
```

---

## 2. L'architecture, et le point qui la commande

### Pourquoi `migrateData` est obligatoire

Un champ retiré du schéma est **élagué au chargement** du document : `DataField.clean()`
appelle `_migrate()` puis `_cleanType()`, et le second écarte les clés que le schéma ne
déclare plus. `_initializeSource` nettoie avec `prune: true` : la donnée disparaît même de
`_source`.

**`migrateData` est le seul crochet appelé avant cet élagage.** Un script tournant au
`ready` ne trouverait plus rien à déplacer : la donnée serait perdue, sans bruit. Chaîne
vérifiée dans la source de Foundry v14 :

```
new Item(source)  ou  item.update(changes)
   └─ DataModel._initializeSource     data.mjs:284     { migrate: true }
      ou DataModel._preUpdateSource   data.mjs:718     { migrate: true }
         └─ DataField.clean                            fields.mjs:234
            └─ TypeDataField._migrate                  fields.mjs:4317
               └─ cls.migrateDataSafe → migrateData    data.mjs:890
```

Deux conséquences :

- **`migrateData` reçoit aussi les mises à jour partielles.** Elle ne doit jamais supposer le
  document complet ni compléter ce qui manque — elle ne touche que les clés présentes. Effet
  secondaire utile : une écriture sur l'ancien chemin est rattrapée et rangée au bon endroit.
- `migrateDataSafe` enveloppe l'appel dans un `try/catch` qui se contente de journaliser :
  **une passerelle qui plante échoue en silence**.

### Partage des rôles avec les scripts de migration

Le script `_1_0_9` **ne déplace rien** (hors deltas de tokens, point dur n° 5). Il force une écriture par document
pour fixer en base la forme que la passerelle a déjà produite en mémoire. Le remplacement
forcé est nécessaire : une mise à jour ordinaire aux mêmes valeurs produit un diff vide et
Foundry n'écrit alors rien.

```js
await item.update({ ['system']: new foundry.data.operators.ForcedReplacement(item.system.toObject()) });
```

### Les briques

| Fichier | Rôle |
|---|---|
| `module/field/chunkField.js` | `SchemaField` portant une portée (`versions`, `v1`, `v5`) |
| `module/common/version.js` | `data()`, `prefix()`, `path()`, `of()`, `world` |
| `module/migration/versionMigration.js` | **la table** des champs déplacés, par type et par version |
| `module/common/settings.js` | réglage `version`, `scope: 'world'`, défaut `v5` |
| `module/common/nephilimSheetMixin.js` | état de version par fenêtre, bouton d'en-tête, `data` et `versionPath` dans le contexte |
| `module/item/nephilimItemSheet.js` | sert `templates/version-vide.html` quand la version affichée ne décrit rien |
| `tools/porter-version.mjs` | le transformateur de schéma (voir §4) |

### Le repli, clef de la migration incrémentale

`Version.data(doc)` rend `doc.system` lui-même tant que le document n'a pas de chunk
`versions` ; `Version.prefix(doc)` rend `'system'`. **Ce repli fait cohabiter les types
portés et les autres**, et autorise à migrer par lots. Il disparaîtra avec le dernier type.

---

## 3. État au 2 octobre 2026

**Les 35 types sont portés** — la table de `VersionMigration` fait foi :

> alchimie, appel, arcane, arme, armure, aspect, atlanteide, capacite, catalyseur, chute, competence,
> divination, dracomachie, figurant, figure, formule, fraternite, habitus, invocation, magie, materiae, metamorphe, ordonnance, passe,
> periode, pratique, quete, rite, rituel, savoir, science, sort, technique, tekhne, vecu

Une **migration unique, 1.0.9**, couvre tout le chantier, sous une seule barre de progression :
elle parcourt les types de `VersionMigration.CHAMPS` — items du monde, acteurs et leurs items
embarqués — puis déplace les deltas des tokens non liés (voir point dur n° 5). Les dix
migrations écrites lot par lot (1.0.9 à 1.0.18) y ont été fusionnées : aucune n'avait tourné.


**Rien n'a encore tourné dans Foundry.** Tout est vérifié statiquement : modèles chargés
sous node avec la couche de données réelle, gabarits précompilés, `node --check`, tests de
`migrateData` sur les cas limites.

### Suite

Plus aucun type à porter. Restent : l'essai dans Foundry (sur une copie de monde), le
compendium (point dur n° 6), le garde-fou et la suppression des passerelles (n° 7), puis
l'objet incarnation (point 6 du plan initial).

### Fiches d'acteur

Les gabarits de fiche lisent `@root.data.<champ>` et écrivent
`name=(concat @root.versionPath ".<champ>")` dans une moustache, `name="{{@root.versionPath}}.<champ>"`
en HTML nu : `@root`, parce que les partiels reçoivent l'acteur par `actor`, `../actor`,
`document` ou `system` selon l'endroit. Le dialogue de jet (`action.hbs`) n'est pas une
fiche : il reçoit `actorPrimae` résolu par `ActionDataBuilder.export()`. Une version vide
rend `templates/version-vide-acteur.html` (image et nom), via
`NephilimActorSheet._configureRenderParts`.

---

## 4. La recette, type par type

1. **Le schéma** — `tools/porter-version.mjs` exporte `porter(fichier, type)`. Il **déplace
   les déclarations telles quelles** sous `versions.v5` en les ré-indentant : aucune option de
   champ n'est retapée, donc aucune ne peut être perdue. Il refuse un fichier déjà porté, et
   traverse les commentaires placés entre deux champs (le schéma de la formule en a un).

   ```js
   import { porter } from "./tools/porter-version.mjs";
   porter('feature/chute/item/chute.mjs', 'chute');
   ```

2. **La table** — ajouter l'entrée dans `VersionMigration.CHAMPS`, par ordre alphabétique.

3. **Les lecteurs** — router chaque lecture et chaque écriture :
   - lecture : `x.system.champ` → `Version.data(x).champ`, ou `Version.data(x, this.version).champ`
     dans une fiche ;
   - écriture : `{['system.champ']: v}` → `{[Version.path(x, 'champ')]: v}` ;
   - gabarit : `value=document.system.champ` → `value=data.champ`, et
     `name="system.champ"` → `name=(concat versionPath ".champ")`.

4. **La migration** — rien à écrire : `_1_0_9` lit la table de l'étape 2. Pour une future
   version de règles livrée après 1.0.9, ajouter une nouvelle migration sur le même modèle.
   `foundry.utils.isNewerVersion` compare numériquement (`1.0.10 > 1.0.9` est vrai, vérifié).

5. **Balayer** — après chaque lot, chercher dans TOUT le code (JS et gabarits) les lectures
   `<objet>.system.<champ porté>` restantes, pas seulement dans les fichiers du type — et
   les accès indexés `<objet>.system[variable]` (le lot de l'arme en a trouvé deux dans
   `science.js`, restés d'un lot précédent, et un sur l'armure dans `combatantMixin.js`). C'est ce
   contrôle qui a révélé, au lot de la formule, trois régressions des lots précédents.

6. **Vérifier** — `node --check` sur les fichiers JS, `npx handlebars@4.7.8 <gabarits> -f <sortie>`
   sur les gabarits, et un test du modèle sous node contre la couche de données de Foundry
   (`common/server.mjs` de l'installation, avec `globalThis.foundry` et `CONST`).

### Choisir le lot

Porter **par grappes de types qui partagent leurs champs**, pas par ordre alphabétique :
`used` lie l'armure à l'arme, `duree` lie l'aspect à l'invocation, au sort et à l'habitus,
`monde` lie l'ordonnance à l'invocation, `key` lie la chute à la science.

---

## 5. Les points durs

1. **Les écritures à plat : 150 appels, un seul goulot — corrigé.** `EmbeddedItem.create()`
   posait `data.system[nom]` sur `item.toObject()`, qui contient déjà `versions.v5.<nom>` : la
   passerelle laissait gagner la valeur de l'item du monde, et **l'écriture était perdue** dès
   que celui-ci en portait une (un `withData('degre', 3)` sur un item de degré 2 donnait 2 —
   vérifié sous node). `create()` écrit désormais à `Version.path(item, nom)` et `delete()`
   pose son `ForcedDeletion` au même chemin. Tous les noms passés à `withData` sont des champs
   de règles de leur type.

   Même famille, corrigé au lot du métamorphe : `Illustration.align` lisait le champ pilote
   à plat (`changes.system[field]`) alors que `substance` (formule) et `sephirah`
   (invocation) sont portés — l'illustration automatique ne suivait plus. `align` reçoit
   maintenant le chemin de version du champ, et garde la lecture à plat pour les données
   pas encore migrées (import d'un compendium).

2. **Un gabarit générique ne peut pas résoudre une version.** Une liste qui affiche des items
   de types hétérogènes — `science.hbs`, les listes d'armes, d'armures, d'aspects, de focus —
   doit recevoir des **valeurs résolues en JS**, là où le type est connu. Un chemin
   `system.versions.v5.x` en dur casse dès qu'un item non porté passe dans la liste. C'est
   arrivé une fois, sur la quantité de `science.hbs`. Deux exemples traités depuis : la liste
   des focus de `science.hbs` reçoit `element`, `elements`, `cercle`, `focus`, `pacte`,
   `quantite` et `transporte` déjà résolus par `science.js`, et le dialogue de jet reçoit
   `itemElement` depuis `ActionDataBuilder.export()`.

3. **Ne jamais réécrire tout le `system` avec un champ porté posé à la racine.** Le motif
   `const system = duplicate(item.system); system.degre = x; item.update({ system })` perd
   l'écriture : la copie contient aussi l'ancien `versions.v5.degre`, et la passerelle laisse
   gagner la valeur déjà rangée. C'est arrivé dans `historical.js` (`_onChangeDegre`) :
   changer un degré dans l'onglet incarnations ne faisait plus rien. Toujours écrire le seul
   champ, à `Version.path(item, champ)`. `updateItemRef` corrigé avec l'arme, `toggleFormed` / `toggleVisible` avec le métamorphe.

4. **Les listes de la feuille d'acteur** lisent des items sans connaître leur forme : les
   helpers Handlebars `versionValue item 'degre' @root.version` et
   `versionPrefix item @root.version` (dans `module/common/handlebars.js`) résolvent la
   lecture et le préfixe d'écriture. Utilisés dans `ressources.hbs`, `figurant/combat.hbs`, `armes.hbs` et `armures.hbs` ;
   les dialogues de combat (`contact.hbs`, `defense.hbs`, `distance.hbs`) appellent
   `versionValue weapon 'x'` sans version : celle du monde.

5. **Les tokens non liés — traité par 1.0.9, non essayé.** `ActorDelta.system` est un
   `ObjectField` brut : aucun `migrateData` de modèle ne le voit. Foundry le fusionne sur
   l'acteur de base, déjà versionné, avant de construire l'acteur synthétique, et la
   passerelle laisse gagner la valeur rangée — celle de la base. Un figurant blessé
   reprendrait les dommages de son modèle (vérifié sous node : `menace` 9 dans le delta
   donnait 2). La migration 1.0.9 déplace donc les écarts de chaque delta, scène par scène,
   par `token.delta.update({ system: ForcedReplacement })` — **ce chemin d'écriture est le
   moins sûr du chantier, à vérifier en premier dans Foundry**. Les scènes des compendiums
   ne sont pas traitées.

6. **Le compendium verrouille la sortie.** `packs/system/` est livré avec le système et
   expédie l'ancienne forme : chaque import la réintroduit. Il doit être transformé hors ligne
   — base LevelDB, clefs `!items!<id>`, Foundry arrêté, sauvegarde préalable, CLI officiel
   `fvtt package unpack/pack` — **avant** que les passerelles puissent disparaître.

7. **Conditions pour supprimer les `migrateData`** — toutes nécessaires : mondes réécrits par
   les scripts de migration ; compendium transformé ; et un garde-fou refusant d'ouvrir un
   monde resté en deçà de la dernière version, pour que celui qui saute des versions voie un
   message au lieu de perdre ses données en silence.

---

## 6. Les deux branches

`task/v14` est la branche de travail courante ; `task/v14-rules` porte le chantier.

**Reporter les correctifs de v14 vers rules** se fait en fusionnant v14 dans rules, plutôt
qu'en cueillant les commits un à un : la fusion règle les conflits une fois pour toutes.

```
git switch task/v14-rules
git merge task/v14
```

En une ligne, la forme dépend du shell : `;` et `if ($?)` sous Windows PowerShell, où `&&`
n'existe qu'à partir de PowerShell 7 ; `&&` sous Git Bash ou cmd.exe.

**Un conflit est à prévoir dans `feature/vecu/item/vecu.js`** : le correctif des mnémos
existe sur les deux branches par deux chemins — sur v14 dans `da4627b3`, sur rules à
l'intérieur du portage du vécu. Les deux suppriment la même boucle morte, mais rules a
réécrit `_onSubmit` autour. **Garder la version de rules** : `git checkout --ours
feature/vecu/item/vecu.js` (en fusion, « ours » est la branche où l'on se trouve).

**Commiter avant de changer de branche.** Les fichiers non commités suivent le changement
de branche, et les fichiers non suivis sont invisibles pour Git : un `git clean` les efface
sans retour. Ce document lui-même a été perdu une fois de cette façon.
