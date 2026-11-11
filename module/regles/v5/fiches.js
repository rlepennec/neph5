import { FigureSheet } from "../../../feature/figure/regles/v5/figureSheet.js";
import { FigurantSheet } from "../../../feature/figurant/regles/v5/figurantSheet.js";
import { FraterniteSheet } from "../../../feature/fraternite/regles/v5/fraterniteSheet.js";
import { AlchimieSheet } from "../../../feature/alchimie/regles/v5/item/alchimie.js";
import { AppelSheet } from "../../../feature/conjuration/regles/v5/item/appel.js";
import { ArcaneSheet } from "../../../feature/arcane/regles/v5/item/arcane.js";
import { ArmeSheet } from "../../../feature/combat/regles/v5/item/arme.js";
import { ArmureSheet } from "../../../feature/combat/regles/v5/item/armure.js";
import { AtlanteideSheet } from "../../../feature/atlanteide/regles/v5/item/atlanteide.js";
import { AspectSheet } from "../../../feature/selenim/regles/v5/item/aspect.js";
import { CapaciteSheet } from "../../../feature/capacite/regles/v5/item/capacite.js";
import { CatalyseurSheet } from "../../../feature/alchimie/regles/v5/item/catalyseur.js";
import { ChuteSheet } from "../../../feature/chute/regles/v5/item/chute.js";
import { CompetenceSheet } from "../../../feature/competence/regles/v5/item/competence.js";
import { DivinationSheet } from "../../../feature/bohemien/regles/v5/item/divination.js";
import { DracomachieSheet } from "../../../feature/dracomachie/regles/v5/item/dracomachie.js";
import { FormuleSheet } from "../../../feature/alchimie/regles/v5/item/formule.js";
import { HabitusSheet } from "../../../feature/analogie/regles/v5/item/habitus.js";
import { InvocationSheet } from "../../../feature/kabbale/regles/v5/item/invocation.js";
import { MagieSheet } from "../../../feature/magie/regles/v5/item/magie.js";
import { MateriaeSheet } from "../../../feature/alchimie/regles/v5/item/materiae.js";
import { MetamorpheSheet } from "../../../feature/nephilim/regles/v5/item/metamorphe.js";
import { OrdonnanceSheet } from "../../../feature/kabbale/regles/v5/item/ordonnance.js";
import { PasseSheet } from "../../../feature/passe/regles/v5/item/passe.js";
import { PratiqueSheet } from "../../../feature/denier/regles/v5/item/pratique.js";
import { QueteSheet } from "../../../feature/quete/regles/v5/item/quete.js";
import { RiteSheet } from "../../../feature/necromancie/regles/v5/item/rite.js";
import { RituelSheet } from "../../../feature/epee/regles/v5/item/rituel.js";
import { SavoirSheet } from "../../../feature/savoir/regles/v5/item/savoir.js";
import { ScienceSheet } from "../../../feature/science/regles/v5/item/science.js";
import { SortSheet } from "../../../feature/magie/regles/v5/item/sort.js";
import { TechniqueSheet } from "../../../feature/baton/regles/v5/item/technique.js";
import { TekhneSheet } from "../../../feature/coupe/regles/v5/item/tekhne.js";
import { VecuSheet } from "../../../feature/vecu/regles/v5/item/vecu.js";

/**
 * Les fiches des règles v5, par type de document et par type (voir Fiches). La période et le
 * groupe gardent leur fiche commune.
 */
export const FICHES_V5 = {
    Actor: {
        figure: FigureSheet,
        figurant: FigurantSheet,
        fraternite: FraterniteSheet
    },
    Item: {
        alchimie: AlchimieSheet,
        appel: AppelSheet,
        arcane: ArcaneSheet,
        arme: ArmeSheet,
        armure: ArmureSheet,
        aspect: AspectSheet,
        atlanteide: AtlanteideSheet,
        capacite: CapaciteSheet,
        catalyseur: CatalyseurSheet,
        chute: ChuteSheet,
        competence: CompetenceSheet,
        divination: DivinationSheet,
        dracomachie: DracomachieSheet,
        formule: FormuleSheet,
        habitus: HabitusSheet,
        invocation: InvocationSheet,
        magie: MagieSheet,
        materiae: MateriaeSheet,
        metamorphe: MetamorpheSheet,
        ordonnance: OrdonnanceSheet,
        passe: PasseSheet,
        pratique: PratiqueSheet,
        quete: QueteSheet,
        rite: RiteSheet,
        rituel: RituelSheet,
        savoir: SavoirSheet,
        science: ScienceSheet,
        sort: SortSheet,
        technique: TechniqueSheet,
        tekhne: TekhneSheet,
        vecu: VecuSheet
    }
};
