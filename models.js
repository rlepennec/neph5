import { CercleData } from "./feature/cercle/item/cercleData.mjs";
import { CompetenceData } from "./feature/competence/item/competenceData.mjs";
import { FigureData } from "./feature/figure/actor/figureData.mjs";
import { IncarnationData } from "./feature/incarnation/item/incarnationData.mjs";
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
            incarnation: IncarnationData,
            metamorphe: MetamorpheData,
            periode: PeriodeData,
            vecu: VecuData,
        }
    }

    /**
     * @param {*} document The document to inspect.
     * @returns the data model.
     */
    static getData(document) {
		switch (document.documentName) {
			case 'Item':
				return Models.items()[document.type];
            case 'Actor':
                return Models.actors()[document.type];
		}
    }

}