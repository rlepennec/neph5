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

**Correctifs de task/v14 déjà alignés ici** (commit v14 `4fa68eda`, « cinq défauts connus »).
À la fusion de task/v14 dans cette branche :
- `nephilimItem.js` (`_actors(callback, type, arg)`, `_actors('deletePeriode', null, this.sid)`) et
  les deux gabarits de savoir sont identiques des deux côtés : fusion sans conflit ;
- conflits attendus, à résoudre en **gardant la version de cette branche** :
  `capacite.js` et `abstractFocus.js` (ici `aRattache`), `nephilimActor.js` (`ka.soleil` via
  `Version.data`, et `deletePeriode`), `periode.js` (`getAll` n'existe plus ici).

**Nettoyage à la suppression, reporté de task/v14** (commits v14 `fb3583cd` et `e382155b`,
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
(`Incarnations.ordonnees`, `chronologie()` en ordre d'affichage). Sur rules, `rang` croît avec
la chronologie : la tête, la plus ancienne, a le plus petit ; une incarnation créée prend
`rang` = plus petit − 1. Dans la migration, l'incarnation d'une période qui garde la clé de la
période se range la plus récente de sa période, pour compter avec les autres quand elle est la
courante.

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
   acteur par son sid la trouve. v5 : `actif`, `rang` (croît avec la chronologie ;
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
la déplacer.
`changerPeriode` déplace tous les vécus. Un vécu déposé sur la fiche s'ajoute à l'incarnation en
édition (la courante, fiche déverrouillée), sinon en crée une. **La migration 1.0.10 crée de
nouveau une incarnation par période**, de même clé que la période, qui reçoit **tous** les
vécus de l'époque. Une incarnation déjà migrée sous la forme `vecu` est convertie au chargement
(`VersionMigration.incarnation`, délégué par `IncarnationDataModel.migrateData`) ; les
incarnations qu'une ancienne 1.0.10 a créées vécu par vécu ne sont pas regroupées. Le texte
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
