# Versions de règles — état du chantier et reprise

Ce document permet de reprendre le portage des modèles de données vers les versions de
règles sans rien redécouvrir : la conception retenue, ce qui est fait, la recette à
appliquer type par type, et les pièges qui ont déjà coûté du temps.

**Où vit le travail** : branche `task/v14-1.8.0`. (Git refuse `task/v14-1.7.0/rules` tant qu'une
branche `task/v14-1.7.0` existe : une référence ne peut pas être à la fois un fichier et un
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
fiche : il reçoit `itemElement` et `itemElements` résolus par `ActionDataBuilder.export()`. Une version vide
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

8. **Le garde-fou — fait le 4 octobre.** `MigrationTools.migrable` (`module/migration/migration.js`)
   refuse de migrer un monde dont les données sont en deçà de **1.0.8**, s'il contient des acteurs
   ou des items : un message (dialogue, notification permanente, console) demande de passer
   d'abord par le système **1.7.0** (task/v14-1.7.0), puis de revenir en 1.8.0 ; rien n'est
   écrit. Raison : les migrations 1.0.1 à 1.0.8 écrivent des champs que les schémas de la 1.8.0
   n'ont plus (la 1.0.3 crée des périodes avec `actif` / `previous`) — rejouées ici, elles
   perdraient la chronologie. Un monde vide (neuf, version par défaut 1.0.0) est migré
   normalement.

7. **Conditions pour supprimer les `migrateData`** — toutes nécessaires : mondes réécrits par
   les scripts de migration ; compendium transformé ; et un garde-fou refusant d'ouvrir un
   monde resté en deçà de la dernière version, pour que celui qui saute des versions voie un
   message au lieu de perdre ses données en silence.

---

### Performance : la version du monde est gardée en cache

Premier essai dans Foundry (4 octobre) : rules beaucoup plus lent que v14. Cause : `Version.world`
appelait `game.settings.get('neph5e', 'version')` à **chaque** `Version.data` / `Version.path`.
Dans Foundry v14, ce `get` parcourt tous les réglages du monde et, tant que le réglage garde sa
valeur par défaut, **construit un document `Setting`** à chaque appel : ~29 µs mesurés sous node.
Un rendu de fiche de figure fait de l'ordre de 50 000 lectures, soit ~1,4 s. `Version.world` garde
désormais la valeur, oubliée par l'`onChange` du réglage (`Version.oublierMonde`). Ne jamais
relire un réglage dans un chemin aussi fréquent. La façade `Incarnations` reste ~4 fois plus
coûteuse que l'ancienne chaîne (2 ms contre 0,6 ms par rendu mesuré) : sans effet perceptible, à
optimiser seulement si besoin (garder la chaîne triée par instance).

## 6. Les deux branches

`task/v14-1.7.0` est la branche de travail courante ; `task/v14-1.8.0` porte le chantier.

**Reporter les correctifs de v14 vers rules** se fait en fusionnant v14 dans rules, plutôt
qu'en cueillant les commits un à un : la fusion règle les conflits une fois pour toutes.

```
git switch task/v14-1.8.0
git merge task/v14-1.7.0
```

En une ligne, la forme dépend du shell : `;` et `if ($?)` sous Windows PowerShell, où `&&`
n'existe qu'à partir de PowerShell 7 ; `&&` sous Git Bash ou cmd.exe.

**Un conflit est à prévoir dans `feature/vecu/item/vecu.js`** : le correctif des mnémos
existe sur les deux branches par deux chemins — sur v14 dans `da4627b3`, sur rules à
l'intérieur du portage du vécu. Les deux suppriment la même boucle morte, mais rules a
réécrit `_onSubmit` autour. **Garder la version de rules** : `git checkout --ours
feature/vecu/item/vecu.js` (en fusion, « ours » est la branche où l'on se trouve).

**Correctifs de task/v14-1.7.0 déjà alignés ici** (commit v14 `4fa68eda`, « cinq défauts connus »).
À la fusion de task/v14-1.7.0 dans cette branche :
- `nephilimItem.js` (`_actors(callback, type, arg)`, `_actors('deletePeriode', null, this.sid)`) et
  les deux gabarits de savoir sont identiques des deux côtés : fusion sans conflit ;
- conflits attendus, à résoudre en **gardant la version de cette branche** :
  `capacite.js` et `abstractFocus.js` (ici `aRattache`), `nephilimActor.js` (`ka.soleil` via
  `Version.data`, et `deletePeriode`), `periode.js` (`getAll` n'existe plus ici).

**Nettoyage à la suppression, reporté de task/v14-1.7.0** (commits v14 `fb3583cd` et `e382155b`,
fiches 02, 03 et 05 de `D:\Dev\Foundry\corrections-neph5e\`). Le nettoyage quitte `_onDelete`
(appelé sans attente, sur tous les clients, et pour les compendiums) pour `_onDeleteOperation`.
Conflits attendus à la fusion, à résoudre en gardant **la structure de v14 avec les accès de
rules** (`Version.data` / `Version.path`) — c'est l'état de cette branche :
- `nephilimActor.js` : `_onDeleteOperation` + `onDeleteEmbeddedActors(actor, sids)` (simulacre) ;
- `fraternite.js` : `onDeleteActors(sids)`, `membresIntrouvables()`, garde dans `membresWithStatus` ;
- `nephilimItem.js` : `_onDeleteOperation` + `_onDeleteWorldItem`. **Écart voulu** : rules y fait
  aussi passer les items **embarqués** (`Incarnations.apresSuppression`, sur le client de
  l'auteur), qui remplace l'ancien écouteur `deleteItem` de la façade, atteint du même défaut ;
- `periode.js` (garde `original == null` dans `getAll`) : sans objet ici, la garde est dans
  `Incarnations.chronologie`. `fraterniteSheet.js` (`_onFirstRender`) : identique.

Ici, `deletePeriode(sid)` reçoit le sid d'une **période du monde** et retire toutes ses
incarnations ; `deleteIncarnation(cle)` retire une incarnation (fiche, `deleteEmbeddedItem`).

**Commiter avant de changer de branche.** Les fichiers non commités suivent le changement
de branche, et les fichiers non suivis sont invisibles pour Git : un `git clean` les efface
sans retour. Ce document lui-même a été perdu une fois de cette façon.

---

## 7. L'objet incarnation (point 6 du plan initial)

### Aujourd'hui

L'incarnation n'est pas un objet : c'est la **période embarquée**. Les périodes sont chaînées
par `previous` — **de la plus ancienne à la plus récente** : la tête de chaîne
(`previous === null`) est la **plus ancienne**, et c'est la dernière déposée (on découvre ses
vies passées en remontant le temps). Une première version de ce document disait l'inverse :
c'était faux, rectifié par l'utilisateur (fiche v14 n° 06). Chacune est activée ou non
(`actif`), et l'acteur désigne la courante par `periode`. Tout item acquis pendant une
incarnation est une copie embarquée qui porte `periode` et souvent `degre` : un item qui a
progressé sur plusieurs incarnations existe en plusieurs exemplaires.

**Règle de calcul** (fiche 06) : comptent la période courante et les périodes **antérieures**
non désactivées ; les postérieures jamais. L'option `chronologieDescendante` ne règle **que
l'ordre d'affichage** — l'ancien code la faisait aussi jouer sur les calculs, et retenait les
périodes postérieures quand elle valait false. Corrigé sur v14 et ici
(`Incarnations.ordonnees`, `chronologie()` en ordre d'affichage). Sur rules, l'ordre est porté
par une **liste doublement chaînée** (`predecesseur` / `successeur`, depuis le 5 octobre ; un
`rang` numérique avant) : la tête, sans prédécesseur, est la plus ancienne ; une incarnation
créée prend la tête. `#chaine` lit en suivant les successeurs (chaîne abîmée : le reste en
queue, boucle sans effet) ; ajouter, déplacer et retirer réécrivent les liens qui changent en une
seule requête (`#chainer`) ; une incarnation supprimée par un autre chemin raccroche son
prédécesseur à son successeur (`#raccrocher`).

### Le plan, en quatre étapes

1. **La façade** — fait. `feature/incarnation/incarnations.js`, classe `Incarnations(actor)`,
   seule à connaître cette représentation : `courante`, `periode(sid)`, `toutes()`,
   `premiere()`, `suivante(sid)`, `ordonnees({ chrono, actif, jusqua })`, `estActive(sid)`,
   `rattachement(item)`, `estActif(item)`, `exemplaires(sid)`, `aRattache(sid, periode)`,
   `rattaches(periode, types)`, `apports(sid)`, `degre(sid)`, `vecusActifs()`, `chronologie()`.
   Elle **lit les données actuelles** ; tous les lecteurs passent par elle (degrés, activité,
   détails par période, chutes, sciences, compétences, fraternité, onglet incarnations).
   `Periode.getChronological` et `Periode.getAll` ont disparu. Équivalence vérifiée sous node
   contre l'ancien code recopié : 1 040 cas, aucun écart.
2. **Les écritures par la façade** — fait. `ajouter(sid)` (en tête de chaîne ; la première
   devient la courante), `deplacer(sid, parent)`, `retirer(sid)` (chaîne recousue, courante
   oubliée, vécus et items rattachés supprimés), `basculer(sid)`, `definirCourante(sid)`,
   `modifierDegre(item, degre)`. Les 19 dépôts écrivent par `EmbeddedItem.withIncarnation(periode,
   degre?)`, qui pose les champs que décide `Incarnations.champsDeRattachement`. `Periode` ne
   garde que la logique d'interface (cible du dépôt, rendu, fraternité) ; `Periode.setPrevious`
   a disparu, `NephilimActor.setCurrentPeriode` délègue. Vérifié sous node contre l'ancien code
   recopié : 84 cas de déplacement, retrait et bascule sans écart, et l'ajout par `EmbeddedItem`.
   **Hors façade, volontairement** : les écritures sur les items du monde (la période d'un vécu
   du monde), l'effectif de la fraternité (membres par période), et le degré éditable des
   figurants, qui n'ont pas d'incarnations. Le gabarit `incarnations.hbs` lit encore
   `@root.data.periode` pour marquer la courante — à donner par le contexte à l'étape 3.
3. **Le stockage** — fait. Item `incarnation` (`feature/incarnation/item/incarnation.mjs`),
   embarqué seulement, **de même sid que sa période** : tout ce qui cherche la période d'un
   acteur par son sid la trouve. v5 : `actif`, `predecesseur` / `successeur` (liste chaînée, à l'origine un `rang` ;
   remplace la chaîne `previous`), `apports: [{ sid, degre }]` (degré null pour un focus, une
   capacité : `degreDans` rend alors celui que porte l'item, comme l'ancien code). Un item
   embarqué n'existe plus qu'**en un exemplaire** : `EmbeddedItem.withIncarnation` réemploie
   l'exemplaire déjà embarqué et lui ajoute un apport ; avec `withDeleteExisting` (focus,
   capacité) il le « déplace » en l'oubliant de toutes les incarnations. Retirer une ligne de
   l'onglet incarnations ne retire que l'apport ; l'item ne part qu'à son dernier apport. Un
   écouteur `deleteItem` (`Incarnations.ecouter`) oublie les apports d'un item supprimé
   ailleurs — option `incarnations: false` pour s'en passer. L'acteur garde `periode` pour
   la courante. Type enregistré sans fiche, absent de la boîte de création
   (`NephilimItemDirectory.TYPES`). **Migration 1.0.10** (`_1_0_10.js`) : par figure et
   fraternité, une incarnation par période embarquée (chaîne cassée : en queue), apports versés
   depuis les copies, un exemplaire gardé par item (de préférence rattaché), périodes et
   doublons supprimés ; relançable. Vérifié sous node avec la vraie migration sur des données
   à l'ancienne forme (copies multiples, période inactive, copie orpheline) : 960 lectures
   comparées à l'ancien code, aucun écart ; 37 vérifications d'écriture (déplacements comparés
   aux anciens pointeurs, retrait, bascule, degré, réemploi, déplacement d'un focus).
   **Non traités** : les tokens non liés (figurants seulement, sans incarnations) et les
   compendiums.
4. **Le nettoyage** — fait le 4 octobre, **dans la même version que 1.0.10** (choix de
   l'utilisateur : 1.0.9 livrée d'abord, 1.0.10 regroupe tout le reste ; v14 = 1.7.x, rules = 1.8.x).
   Retirés des schémas : `periode` de tous les items rattachés sauf le vécu ; `degre` de savoir,
   quête, arcane, science, chute, capacité ; `actif` / `previous` de la période. Gardés : vécu
   (`periode`, `degre`), passe d'armes (`degre`, saisi chez le figurant), focus et aspect
   (`degre` = niveau). Pour que 1.0.10 lise encore ces champs, `NephilimActor.migrateData` les
   **relève au chargement**, sur les items embarqués bruts, avant élagage
   (`VersionMigration.releveIncarnations` → drapeau `neph5e.releveIncarnations`, en mémoire) ; la
   conversion lit le relevé. 1.0.9 ne réécrit pas les items d'un acteur encore à convertir
   (`_1_0_9.aConvertir`) — sa forme nouvelle n'a plus ces champs, et un arrêt entre les deux
   migrations les aurait perdus — : 1.0.10 les réécrit après conversion. Vérifié sous node depuis
   un monde 1.0.8 à plat, champs élagués : chronologie, activité, degrés, vécus multiples, focus,
   capacités retrouvés. `actor.periode` (clé de l'incarnation courante) n'est pas renommé.

### Le formulaire d'incarnation (interface)

`feature/incarnation/incarnationForm.js` + `incarnation-form.hbs` (style : `less/src/incarnation.less`).
Ouvert en cliquant sur le libellé d'une incarnation (période — vécu) dans l'onglet incarnations
de la figure ; la puce déroule toujours le détail. Le bouton « + » (fiche déverrouillée) ouvre
une incarnation nouvelle. Glisser-déposer depuis le monde : période (`changerPeriode`), vécus
(`ajouterVecu`, degré réglable ; tous retirables par `retirerVecu`), savoir / quête / arcane / science / passe / chute avec degré,
focus et capacités (par la feature de l'item, `withPeriode(cle).drop()`). Retrait d'une ligne :
`detacher`, l'item ne quitte la figure qu'à son dernier apport. Une incarnation nouvelle reste un
**brouillon** en mémoire tant que sa période n'est pas définie, puis est enregistrée par
`Incarnations.ajouter(periode)`, ou `creerAvecVecu(periode, vecu, degre)` si un vécu était déjà
déposé. Une barre en haut du formulaire supprime l'incarnation ouverte, après confirmation
(`deleteIncarnation`), et ramène à la fiche ; les acquisitions ne se
déposent qu'ensuite. Le formulaire s'ouvre verrouillé si la fiche l'est, et suit les changements
de la figure (`actor.apps`). La fraternité garde son onglet sans formulaire.

### Décisions prises pour l'étape 3

Pour que l'étape 3 reste un pur changement de stockage, sans changement de règles : l'unité
reste le **degré**, et **toutes** les acquisitions passent par les apports.

### Changement de paradigme (décidé par l'utilisateur, après l'étape 3)

**Révisé le 4 octobre : une incarnation porte ZÉRO, UN OU PLUSIEURS vécus** (`vecus`).
`definirVecu` est remplacé par `ajouterVecu(cle, vecu, degre)` et `retirerVecu(cle, vecu)` ;
supprimer un vécu, par quelque chemin que ce soit, le fait seulement lâcher par son incarnation,
qui peut rester sans vécu. Une période déposée seule sur la fiche crée une incarnation sans vécu
(`ajouter`, pour la figure comme pour la fraternité) ;
**Confirmé par l'utilisateur** : une incarnation nouvelle est enregistrée dès que sa période est
définie ; une période déposée seule sur la fiche d'une figure crée une incarnation sans vécu.
Aussi confirmé : une incarnation **désactivée ne compte pas**, même si c'est la courante ; une
incarnation créée arrive **en tête** de la chronologie (la plus ancienne), à charge du joueur de
la déplacer. **Révisé le 19/10 : elle arrive désormais en queue (la plus récente)**, voir
la section 10.
`changerPeriode` déplace tous les vécus. Un vécu déposé sur la fiche s'ajoute à l'incarnation en
édition (la courante, fiche déverrouillée), sinon en crée une. **La migration 1.0.10 crée de
nouveau une incarnation par période**, de même clé que la période, qui reçoit **tous** les
vécus de l'époque. La conversion de l'ancienne forme `vecu` au chargement a été retirée le 5 octobre : la 1.8.0
n'ayant jamais été livrée, aucun monde réel ne la porte (l'utilisateur repart de mondes 1.7.0). Le texte
ci-dessous décrit l'état d'avant cette révision.

**Une incarnation, un vécu, et un seul.** L'incarnation porte sa période ; plusieurs
incarnations peuvent porter la même. Une incarnation de figure a **toujours** un vécu ; une
fraternité, qui ne vit pas de vécus, a des incarnations sans vécu (hypothèse, à confirmer).

- **Données** : l'incarnation a sa propre **clé** (son sid, UUID). v5 : `periode`, `vecu`,
  `actif`, `rang`, `apports` (les autres items). Le vécu porte la période de son incarnation
  et son propre degré ; il n'est pas un apport. La clé est ce que contiennent `actor.periode`
  (la courante), les variables `periode` des features et l'effectif d'une fraternité.
- **Enchaînements** (`Incarnations`) : `creerDepuisVecu(vecu)` — l'incarnation prend la
  période du vécu (refus : déjà embarqué, vécu sans période, période inconnue) ;
  `definirVecu(cle, vecu)` — le nouveau vécu prend la période de l'incarnation, l'ancien part ;
  `changerPeriode(cle, periode)` — le vécu suit ; `retirer(cle)` — son vécu part avec elle ;
  supprimer le vécu d'une incarnation (par n'importe quel chemin) la retire, par l'écouteur
  `deleteItem` ; `ajouter(periode)` — fraternité seulement.
- **Dépôts** : un vécu déposé crée une incarnation ; une période déposée sur une figure est
  refusée (« Une incarnation se crée en déposant un vécu ») ; glisser une incarnation sur une
  autre la range derrière (`_onDropIncarnation`). Les gabarits d'incarnations utilisent la clé
  (`periode.cle`) au lieu du sid de la période.
- **Migration 1.0.10** : une incarnation par vécu de chaque période ; la première garde comme
  clé le sid de la période, si bien que `actor.periode` et l'effectif restent justes sans
  réécriture ; elle reçoit les apports de la période (de **toutes** les copies, doublons
  compris). Période de figure sans vécu : incarnation sans vécu, comptée et signalée.
- Vérifié sous node : 960 lectures équivalentes à l'ancien code ; 62 vérifications d'écriture
  (enchaînements, refus, cascade de l'écouteur, période à deux vécus, fraternité).
- **Corrigé en chemin** : `NephilimItem._actors('deletePeriode')` passait le document de la
  période du monde à une méthode qui attendait un sid — supprimer une période du monde ne
  nettoyait aucun acteur. `deletePeriode` accepte maintenant une clé ou ce document.

### Défauts relevés en chemin

`capacite.js:63` et `abstractFocus.js:98` comparaient à `this.embedded.periode` — propriété
inexistante : le contrôle « déjà rattaché à cette période » ne jouait jamais. Avec des items
sans période, il aurait joué toujours (un focus n'aurait plus pu changer de période) : corrigés
à l'étape 3 en `new Incarnations(this.actor).aRattache(this.item.sid, this.periode)`.

## 8. Focus et capacités liés par époque (décidé par l'utilisateur le 18 octobre 2026)

**Avant** : un focus (ou une capacité) n'existait qu'en un exemplaire embarqué, rattaché à une
seule incarnation ; le redéposer dans une autre le **déplaçait** (`withDeleteExisting` :
supprimé puis recréé, l'ancienne incarnation le perdant).

**Après** : un exemplaire embarqué **par incarnation** qui le connaît (`Incarnations.PAR_EPOQUE`
= les 14 types de focus + la capacité). Chaque exemplaire porte :
- la clé de son incarnation dans `system.incarnation`, à la racine comme `id` car commune à
  toutes les versions (déplacée de `versions.v5` le 18/10) — double clé (incarnation, sid) ;
  le champ est vide (`null`) pour l'item du monde ;
- **ses** valeurs propres au personnage : statut, focus, pacte, quantité, transporté.
Les valeurs ne sont jamais portées par l'incarnation, qui garde seulement l'apport `{ sid }`.

Les règles, toutes confirmées par l'utilisateur :
1. **Dépôt** (formulaire ou fiche ; `AbstractFeature.deposerParEpoque`) : déjà lié à cette
   incarnation → rien ; connu d'une incarnation **antérieure** non désactivée → **rien** (révisé
   le 18/10 : l'acteur le connaît déjà à cette époque ; c'est la première modification d'une
   de ses valeurs qui donne son exemplaire à l'incarnation, règle 3) ; connu seulement d'une
   **postérieure** non désactivée → fenêtre qui nomme la plus proche (période — vécus) et
   demande confirmation ; confirmé, nouvel exemplaire copié de celui de cette époque (quantité
   comprise) ; refusé, rien ; connu d'aucune → création comme avant. Plus aucun déplacement.
2. **Exemplaire qui fait foi** (`exemplaireEffectif`) : celui de l'incarnation courante, sinon
   de l'antérieure active la plus proche ; les postérieures et les désactivées jamais (la
   courante n'est jamais désactivée). Il alimente les onglets (`AbstractFocus.withOriginalItem`,
   donc `Science.getFocus` ; capacités et ordonnances dédoublonnées par sid) et les jets.
3. **Modification** (`Incarnations.ecrire`) : sur l'exemplaire de la courante s'il existe ; sinon
   la courante reçoit son propre exemplaire, copié de l'antérieure la plus proche, avec la
   valeur modifiée. Vaut pour les modifications manuelles (fiche : statut, focus, pacte,
   quantité, transporté) comme automatiques (dose produite, pacte noué, perte des pactes à la
   première ordonnance). Restent directes : la quantité des materiae (pas un focus) et le
   nettoyage du monde (exemplaire précis).
4. **Retrait** (`retirerDe`) : retirer un focus d'une incarnation supprime **son** exemplaire ;
   les autres incarnations gardent le leur. Supprimer une incarnation supprime ses exemplaires.
5. Les **capacités** suivent les mêmes règles ; les **ordonnances** aussi (ce sont des focus).

**Façade** : `epoqueDe`, `exemplaireDans`, `exemplaireEffectif`, `voisine`, `nomDe`,
`creerExemplaire`, `ecrire`, `retirerDe` ; `rattaches`, `estActif`, `rattachement`,
`aRattache`, `retirer` et `apresSuppression` en tiennent compte. `EmbeddedItem` crée
l'exemplaire de l'incarnation visée même si la figure en a pour d'autres époques.

**Compatibilité** : un exemplaire sans clé (lié avant ce changement) appartient à l'incarnation
la plus récente qui le rattache par ses apports.

**Migration 1.0.10** : avant elle, chaque focus lié portait déjà la période de son époque ; elle
garde donc **une copie par époque** (au lieu de fusionner les doublons) et recopie cette
période dans `incarnation` — c'est aussi la clé de l'incarnation créée pour elle. Un monde déjà
migré par l'ancienne 1.0.10 n'est pas retouché (il fonctionne par la compatibilité ci-dessus) :
pour tester, repartir d'une copie de monde 1.7.0.

**Vérifié sous node** : 33 cas sur la façade (dépôt, voisines, époque désactivée, copie à
l'écriture, exemplaire effectif, retrait, suppression, retrait d'incarnation, exemplaire sans
clé) ; 11 sur le dépôt avec fenêtre simulée et la résolution de `AbstractFocus`. Pas encore
essayé dans Foundry.

## 9. Tous les items liés, un exemplaire par époque (décidé par l'utilisateur le 18 octobre 2026)

La section 8 ne valait que pour les focus et les capacités. Le modèle est désormais **le même
pour tout ce qui est lié à une incarnation** (`Incarnations.LIES`) : vécu, savoir, quête,
arcane, chute, science, ressource, les 14 focus, capacité.

- **Un champ partagé** : `IncarnationField` (`module/field/incarnationField.js`), à la racine du
  schéma après `id` dans les 22 modèles — `system.incarnation`, la clé de l'incarnation de
  l'exemplaire, vide pour l'item du monde.
- **Le degré sur l'exemplaire** : le degré acquis pendant une époque est porté par l'exemplaire
  de cette époque (`versions.v5.degre`, rendu aux savoirs, quêtes, arcanes, chutes et
  sciences ; le vécu et la ressource l'avaient). Le degré d'un item est la somme sur ses
  exemplaires dont l'incarnation compte (courante et antérieures actives).
- **L'incarnation allégée** : elle ne porte plus `vecus` ni `apports` — seulement `periode`,
  `actif`, `predecesseur`, `successeur`. Ce qui lui est lié se lit sur les exemplaires
  (`rattaches(cle)`, `vecusDe(cle)`).
- **Une seule logique** dans la façade : `epoqueDe`, `exemplaireDans`, `exemplaireEffectif`,
  `voisine`, `aRattache`, `rattaches`, `apports(sid)` (lecture : les exemplaires dans l'ordre
  de la chaîne), `degreDans`, `degre`, `degreAcquis`, `modifierDegre`, `creerExemplaire`,
  `ecrire`, `retirerDe`, `retirer`. Disparus : `rattacher`, `detacher`, `oublier`, les
  écritures d'apports. `apresSuppression` ne recoud plus que la chaîne d'une incarnation
  supprimée : un exemplaire supprimé n'a rien à défaire ailleurs.
- **Une seule création** : `EmbeddedItem.withIncarnation(cle, degre)` crée l'exemplaire de
  l'incarnation (clé à la racine, degré dans la version) s'il n'existe pas, pour tout type lié.
- **Dépôt d'un savoir (quête, science...) déjà connu d'une autre époque** : nouvel exemplaire,
  degré 0, sans fenêtre — un savoir progresse à chaque époque. Les focus et capacités gardent
  leurs règles (section 8, `PAR_EPOQUE`). Un vécu ne se vit qu'une fois (`DEJA_VECU`).
- **Migration 1.0.10** : en 1.7.0, chaque item lié existait déjà en une copie par période, avec
  son degré. Chaque copie rattachée à une période embarquée devient l'exemplaire de son
  incarnation (clé = sa période, degré relevé) ; sont supprimées une seconde copie dans la même
  période, un vécu présent sur plusieurs périodes (gardé à la première de la chaîne), une copie
  hors période quand l'item a un exemplaire ailleurs.

- **Plus de période recopiée sur le vécu lié** (relevé par l'utilisateur sur un export) : elle
  doublait la clé d'incarnation. Le champ `periode` reste au schéma du vécu pour le vécu **du
  monde** (sa période : vécus d'une période, incarnation créée depuis un vécu) ; le vécu lié
  ne la porte plus (`null`) et la lit sur son incarnation (`periodeDe(epoqueDe(vecu))`). Changer
  la période d'une incarnation n'a donc plus de vécus à réécrire ; déposer une période sur la
  fiche d'un vécu lié est ignoré ; 1.0.10 la retire des vécus migrés. Aucun autre type lié ne
  porte de champ redondant avec la clé.

- **Les voies, magique et alchimique** (`Incarnations.VOIES`, ajoutées à `LIES` le 18/10, décidé
  par l'utilisateur) : elles peuvent changer d'une incarnation à l'autre ; au plus une de chaque
  type par incarnation, les deux types étant indépendants. La voie suivie (`voie(type)`, que
  lisent `actor.voieMagique` / `voieAlchimique`) est celle de l'incarnation courante, sinon de
  l'antérieure active la plus proche. Elle se dépose sur la fiche, dans l'onglet Magie ou
  Alchimie selon son type, pour l'incarnation courante (`changerVoie`) : déjà suivie → rien ;
  sinon l'incarnation courante reçoit son exemplaire, qui remplace le sien s'il y en avait un.
  En 1.7.0 une voie n'avait pas de période : 1.0.10 la rattache à la plus ancienne incarnation
  active, d'où elle fait foi pour toutes les suivantes.

- **Les armes et les armures** (`Incarnations.EQUIPEMENTS`, ajoutées à `LIES` le 18/10, décidé par
  l'utilisateur) : elles **ne se transmettent pas** d'une incarnation à l'autre. Seules
  comptent celles de l'incarnation courante (`equipements(type)`) : fiche de combat (`weapons`,
  `armors`), protection, parade, défense, riposte. Une arme déposée sur la fiche reçoit la clé
  de l'incarnation courante (`lierEquipement`) ; sans incarnation courante, le dépôt est refusé.
  Plusieurs exemplaires d'une même arme restent possibles. Supprimer une arme supprime celle
  affichée, donc celle de l'incarnation courante. Restent sur toutes les époques : la
  suppression des armes d'une compétence ou d'un vécu supprimé, la remise à zéro de la visée.
  En 1.7.0 elles n'avaient pas de période : 1.0.10 les donne toutes à l'incarnation courante.

- **Les materiae** (`Incarnations.STOCKS`, ajoutées à `LIES` le 18/10, décidé par l'utilisateur) :
  le stock du laboratoire **se transmet** d'une incarnation à l'autre. Chaque exemplaire porte la
  **variation** de quantité de son époque, positive ou négative ; le stock (`stock(sid)`) est la
  somme des variations de la courante et des antérieures actives. L'onglet Materiae affiche
  (`stocks(type)`) les materiae de stock positif, et celles que l'incarnation courante a déposées
  ou modifiées, même à 0 ou moins. L'utilisateur saisit le stock total : l'époque courante en
  reçoit la variation (`fixerStock`), son exemplaire étant créé au besoin. Déposer une materia
  crée à l'époque courante une variation de 0 : le stock ne change pas (une nouvelle apparaît à
  0). La corbeille supprime l'exemplaire de l'époque courante : le stock repart à celui des
  époques antérieures. En 1.7.0 une materia n'avait pas de période : 1.0.10 donne sa quantité
  comme variation à l'incarnation courante.

- **Les catalyseurs** (`Incarnations.POSSESSIONS`, ajoutés à `LIES` le 18/10, décidé par
  l'utilisateur) : une possession qui **se transmet** et peut se gagner, se perdre et se
  regagner. Au plus un exemplaire de chaque catalyseur par incarnation ; chaque exemplaire marque
  la possession à son époque (`versions.v5.possede`, vrai par défaut). Sont affichés
  (`possessions(type)`) ceux dont l'exemplaire qui fait foi (courante, sinon antérieure active la
  plus proche) les marque possédés. Le dépôt (`acquerir`) : déjà possédé, rien ; sinon
  l'incarnation courante reçoit son exemplaire, ou le sien repasse à possédé. La corbeille
  (`perdre`, action `perdreCatalyseur`) : si l'incarnation courante l'avait acquis sans
  qu'une antérieure le lui transmette, son exemplaire est supprimé ; sinon elle reçoit, ou
  passe, un exemplaire marqué non possédé, qui le retire à partir de cette époque. En 1.7.0 un
  catalyseur n'avait pas de période : 1.0.10 le donne à l'incarnation courante.

- **Les aspects** (ajoutés aux `POSSESSIONS` le 18/10, décidé par l'utilisateur) : comme les
  catalyseurs, ils se transmettent et peuvent se perdre et se regagner (`possede`), un
  exemplaire au plus par aspect et par incarnation ; le total de l'imago additionne les degrés
  des aspects possédés. Leur **état actif** est propre à chaque époque, comme les valeurs d'un
  focus : basculer l'œil l'écrit dans l'incarnation courante (`ecrire`), en y copiant l'aspect
  s'il vient d'une antérieure. La corbeille des catalyseurs et des aspects est une seule
  action, `perdrePossession` ; `acquerir` prend les valeurs initiales et les champs à ne pas
  recopier. En 1.7.0 un aspect n'avait pas de période : 1.0.10 le donne à l'incarnation
  courante, avec son état (l'utilisateur ajustera à la main).

- **Le métamorphe** (`Incarnations.METAMORPHES`, ajouté à `LIES` le 18/10, décidé par
  l'utilisateur) : au plus un par incarnation, comme une voie (`voie`, `changerVoie`,
  généralisés : valeurs initiales et champs non recopiés). Celui qui fait foi est celui de
  l'incarnation courante, sinon de l'antérieure la plus proche ; en déposer un autre le donne à
  l'incarnation courante, sans métamorphose développée ; redéposer le même ne fait rien. Ses
  métamorphoses développées (`formed`) **se transmettent** avec lui ; ses yeux (`visible`) sont
  propres à l'incarnation de l'exemplaire et **ne se transmettent pas** (fermés à une époque
  sans exemplaire propre). Développer une métamorphose ou ouvrir un œil s'écrit dans
  l'incarnation courante (`ecrire`), la copie partant les yeux fermés. L'humeur et le portrait
  se modifient comme avant, sur l'exemplaire ouvert. En 1.7.0 le métamorphe n'avait pas de
  période : 1.0.10 le rattache à la plus ancienne incarnation active, comme les voies.

- **Le simulacre** (décidé par l'utilisateur le 18/10) : un acteur, non un item ; le lien est
  donc porté par l'**incarnation** (`versions.v5.simulacre`, sid de l'acteur), un figurant
  pouvant servir à plusieurs figures. Un seul simulacre par incarnation, qui **ne se transmet
  pas** : le simulacre de la figure est celui de l'incarnation courante (`simulacre()`, que
  lisent `actor.simulacre`, `AbstractFeature.simulacre`, `FeatureBuilder.scopedActor`, le Ka
  et les compétences). Déposer un figurant le définit pour l'incarnation courante, en
  remplaçant le sien (`definirSimulacre`) ; sans incarnation courante, refus. Un acteur
  supprimé du monde est retiré des incarnations qui l'avaient (`oublierSimulacres`). Retrait
  discret (décidé le 19/10) : un **clic droit** sur le portrait ou le nom du simulacre, fiche
  déverrouillée, le retire de l'incarnation courante (`retirerSimulacre`) ; rien n'est affiché. L'ancien champ `simulacre` de la figure reste au schéma
  pour que 1.0.10 le lise : il devient celui de l'incarnation courante, puis est vidé (à retirer
  avec les passerelles).

**Vérifié sous node** : façade 71 cas (`test-lies` : vécus, savoir par époque et somme des
degrés, focus, voies, équipements, materiae, catalyseurs, aspects, simulacre, retraits, retrait d'une incarnation) ; dépôt 11 ; métamorphe 10 (`test-metamorphe`) ; migration 22 (acteur 1.7.0
simulé, doublons de chaque sorte). Pas encore essayé dans Foundry.

## 10. Les Ka portés par l'incarnation (décidé par l'utilisateur le 19 octobre 2026)

Les douze Ka de la figure — le pentacle (`air`, `eau`, `feu`, `lune`, `terre`), le Soleil, et
ceux du Selenim (`noyau`, `brume`, `orichalque`, `pavane`, `reserve`, `reserveCourante`) — ne
sont plus portés par l'acteur mais par **chaque incarnation** (`versions.v5.ka`), chacun
indépendant de ceux des autres époques. Le Ka unique du figurant ne change pas.

- **Lecture** : `NephilimActor.kas` — les Ka de l'incarnation courante pour une figure
  (`Incarnations.kas`, tous à 0 sans incarnation courante), le Ka unique pour un figurant.
  Toutes les lectures y passent (Ka dominant, `getKa`, approches, initiative, bonus aux
  dommages, valeurs de l'humain, cases de blessure du Ka-Terre, laboratoire, noyau, pavane,
  jets de Ka). Les gabarits lisent `@root.ka` (contexte de `NephilimActorSheet`).
- **Écriture** : les champs de la fiche gardent leur nom (`versionPath.ka.<élément>`) ; la
  fiche de figure les retire de l'enregistrement de l'acteur et les écrit dans l'incarnation
  courante (`Incarnations.ecrireKa`).
- **Initialisation** : la première incarnation a ses Ka à 0. **Une nouvelle incarnation arrive
  désormais en QUEUE** de la chronologie (la plus récente ; elle arrivait en tête jusque-là) et
  reprend les Ka de l'incarnation antérieure active la plus proche, 0 s'il n'y en a pas.
- **Accès** : les onglets qui définissent des Ka (Nephilim, Selenim, Bohémien) et la saisie du
  Ka-Soleil dans l'en-tête n'apparaissent que si la figure a une incarnation courante.
- **Migration 1.0.10** : le bloc `ka` quitte le schéma de la figure ; il est relevé au
  chargement, sur les données brutes (`VersionMigration.releveIncarnations`, sous la clé
  `__acteur`), puis copié dans **chaque** incarnation créée.

**Vérifié sous node** : façade (`test-lies`, 77 cas au total) — Ka à 0 de la première,
nouvelles en queue reprenant l'antérieure active, indépendance entre époques, écriture sans
incarnation refusée ; migration (23 cas) — Ka copiés dans chaque incarnation ; relevé sous ses
deux formes (avant et après 1.0.9) ; schémas (figure sans `ka`, incarnation à 0 par défaut).
Pas encore essayé dans Foundry.

**La stase** (décidé par l'utilisateur le 19/10) : elle quitte la figure pour l'incarnation
(`versions.v5.stase` : description et Ka, `null` si aucune), une au plus par époque. La fiche
affiche celle de l'incarnation courante (`Incarnations.stase`, contexte `@root.stase`) ; ses
champs, dans l'onglet Nephilim, s'écrivent dans l'incarnation courante (`ecrireStase`) :
saisir une valeur la crée, une description vide et un Ka à 0 la retirent. Une nouvelle
incarnation reprend la stase de l'antérieure active la plus proche, aucune s'il n'y en a pas.
1.0.10 relève la stase de la figure (`__acteur`) et la copie dans chaque incarnation si elle
existe. Vérifié sous node (façade 83 cas, migration 24, schémas).

**Les bonus** (décidé par l'utilisateur le 19/10) : mouvement, initiative, dommage et
protection suivent la règle des Ka. Ils sont portés par chaque incarnation (`versions.v5.bonus`),
indépendants d'une époque à l'autre ; une nouvelle incarnation reprend ceux de l'antérieure
active la plus proche, 0 sinon. Lecture unique `NephilimActor.bonus` (ceux de l'incarnation
courante pour une figure, les siens pour un figurant), contexte `@root.bonus`, écriture par la
fiche via `ecrireBonus`. Les Ka et les bonus partagent un même mécanisme de « valeurs par
époque » dans la façade (`#valeursDe`, `#ecrireValeurs`). 1.0.10 relève les bonus et les copie
dans chaque incarnation. Vérifié sous node (façade 86 cas, migration 25, schémas).

**La sapience et les points d'incarnation** (décidé par l'utilisateur le 19/10) : portés par
chaque incarnation (`sapience`, `sapienceDepensee`, `pointsIncarnations` dans `versions.v5`).
La sapience et la sapience dépensée **se transmettent** : une nouvelle incarnation reprend celles
de l'antérieure active la plus proche, 0 sinon ; ajouter ou retirer N à l'époque courante
ajoute ou retire aussi N à **toutes** les incarnations postérieures, désactivées comprises
(`ecrireCompteurs`). Les points d'incarnation sont **propres à chaque époque** et partent de 0.
La fiche lit `@root.compteurs` (`Incarnations.compteurs`) et ne les affiche qu'avec une
incarnation courante. 1.0.10 relève les trois compteurs et les copie dans chaque incarnation.
Vérifié sous node (façade 90 cas, migration 26, schémas).

**Le laboratoire** (décidé par l'utilisateur le 19/10) : le bloc `alchimie` (constructs, materiae
primae du pentacle, laboratoires accessibles, laboratoire courant) passe tel quel de la figure à
l'incarnation (`versions.v5.alchimie`). Il **se transmet** à la création : une nouvelle
incarnation reçoit une copie du laboratoire de l'antérieure active la plus proche (le laboratoire
vide du schéma sinon) ; chaque époque garde ensuite le sien, **indépendant**. Lecture unique
`NephilimActor.alchimie` (formules, constructs, laboratoires, maximum des materiae primae,
données du jet) ; contexte `@root.alchimie` ; écriture par `Incarnations.ecrireAlchimie` (fiche,
constructs, laboratoires, consommation des materiae primae par une formule). Les onglets
Laboratoire et Materiae exigent une incarnation courante, comme ceux des Ka. 1.0.10 relève le
laboratoire et le copie dans chaque incarnation. Vérifié sous node (façade 94 cas, migration 27,
schémas).

**Les voyages akashiques** (décidé par l'utilisateur le 19/10) : même règle que le laboratoire. Le
bloc `akasha` (nef, barge, boussole, compas) passe tel quel dans l'incarnation
(`versions.v5.akasha`) ; une nouvelle incarnation en reçoit une copie de l'antérieure active la
plus proche, puis chaque époque garde le sien. Lecture `NephilimActor.akasha`, contexte
`@root.akasha`, écriture `Incarnations.ecrireAkasha` (bascule nef/barge, boussole, compas) ;
l'onglet Akasha exige une incarnation courante. Le laboratoire et l'akasha partagent dans la
façade le même mécanisme de bloc copié (`#blocDe`, `#ecrireBloc`). 1.0.10 relève l'akasha et le
copie dans chaque incarnation. Vérifié sous node (façade 98 cas, migration 28, schémas).

**L'héritage** (lot C de refactorisation, 19/10) : ce qu'une nouvelle incarnation reçoit (Ka,
bonus, laboratoire, akasha, sapience, sapience dépensée, stase ; points d'incarnation à 0) est
défini en un seul endroit, `Incarnations.heritage(donnees, { pointsIncarnations })`. La création
(`#creer`) l'applique aux données de l'antérieure active la plus proche ; 1.0.10 au relevé de la
figure, points d'incarnation compris. `#ecrireValeurs` convertit en nombres puis délègue à
`#ecrireBloc`.

**Reste à faire** (liste arrêtée par l'utilisateur le 19 octobre 2026, tout le reste est fait) :
- le **simulacre** : le lien vit déjà dans l'incarnation (section 9) ; reste à retirer l'ancien
  champ `simulacre` de l'acteur, avec les passerelles de migration.

**Les blessures, les états, les armes et les armures** (décidé par l'utilisateur le 20/10) :
chaque incarnation a les siens, **indépendants**, et une nouvelle incarnation part **sans**.

- Les blessures : le bloc `dommage` (cases physiques et magiques) passe de la figure à
  l'incarnation (`versions.v5.dommage`), hors de l'héritage. Lecture unique
  `NephilimActor.blessures` (application des dommages, malus de blessure), contexte
  `@root.blessures`, écriture `NephilimActor.ecrireBlessures` (vers `Incarnations.ecrireBlessures`
  pour une figure). Sans incarnation courante, les cases ne se cochent pas.
- Les états (désorienté, immobilisé, à terre, mort...) : des ActiveEffects portés par
  l'incarnation courante (`ActiveEffects.porteur`), transférés à la figure. Seuls ceux de
  l'incarnation courante s'appliquent : `NephilimActiveEffect.isSuppressed` suspend les autres.
  `NephilimActor.toggleStatusEffect` aiguille le HUD du jeton et le suivi de combat vers
  l'incarnation courante, `NephilimTokenHUD` y lit les états actifs, et les icônes des jetons
  sont redessinées quand l'incarnation courante change. Sans incarnation courante, aucun état.
- Les armes et les armures l'étaient déjà : rattachées à l'incarnation courante au dépôt
  (`lierEquipement`), seules les siennes comptent (`equipements`).

1.0.10 ne reprend ni blessure (le schéma de la figure les élague) ni état (ceux de la figure sont
retirés, ses autres effets restent). Vérifié sous node (façade 103 cas, migration 30, états 7).

Restent portés par l'acteur : `description`, `periode` (la clé de l'incarnation courante),
`manoeuvres`, `options`. La règle de transmission de chaque bloc reste à décider avec
l'utilisateur, bloc par bloc.
