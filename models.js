import { CercleData } from "./feature/cercle/item/cercleData.mjs";
import { CompetenceData } from "./feature/competence/item/competenceData.mjs";
import { FigureData } from "./feature/figure/actor/figureData.mjs";
import { MetamorpheData } from "./feature/metamorphe/item/metamorpheData.mjs";
import { PeriodeData } from "./feature/periode/item/periodeData.mjs";
import { VecuData } from "./feature/vecu/item/vecuData.mjs";

export class Models {

    static actors() {
        return {
            figure: FigureData
        }
    }

    static items() {
        return {
            cercle: CercleData,
            competence: CompetenceData,
            metamorphe: MetamorpheData,
            periode: PeriodeData,
            vecu: VecuData,
        }
    }

}