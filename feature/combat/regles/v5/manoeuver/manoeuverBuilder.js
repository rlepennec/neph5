import { Bloquer } from "./bloquer.js";
import { Contrer } from "./contrer.js";
import { Controler } from "./controler.js";
import { Desarmer } from "./desarmer.js";
import { Elaboree } from "./elaboree.js";
import { Esquiver } from "./esquiver.js";
import { Etrange } from "./etrange.js";
import { Eviter } from "./eviter.js";
import { Force } from "./force.js";
import { Frapper } from "./frapper.js";
import { Fuir } from "./fuir.js";
import { Getup } from "./getup.js";
import { Immobiliser } from "./immobiliser.js";
import { Instinctif } from "./instinctif.js";
import { Lancer } from "./lancer.js";
import { Liberer } from "./liberer.js";
import { Multiple } from "./multiple.js";
import { Parer } from "./parer.js";
import { Projeter } from "./projeter.js";
import { Puissante } from "./puissante.js";
import { Rafale } from "./rafale.js";
import { Rapide } from "./rapide.js";
import { Recharger } from "./recharger.js";
import { Salve } from "./salve.js";
import { Standard } from "./standard.js";
import { Subtile } from "./subtile.js";
import { Tirer } from "./tirer.js";
import { Viser } from "./viser.js";

export class ManoeuverBuilder {

    /**
     * @param id     The identifier if the manoeuver.
     * @param action The optional action — ou pool — pour le compte de laquelle la manœuvre est
     *               créée. La manœuvre naît ainsi liée à son contexte : tout ce qu'elle en
     *               déduit est à jour avant la première lecture.
     * @returns the new manoeuver, null if the identifier is unknown.
     */
    static create(id, action = null) {
        switch (id) {
            case Bloquer.ID:
                return new Bloquer(action);
            case Contrer.ID:
                return new Contrer(action);
            case Controler.ID:
                return new Controler(action);
            case Desarmer.ID:
                return new Desarmer(action);
            case Elaboree.ID:
                return new Elaboree(action);
            case Esquiver.ID:
                return new Esquiver(action);
            case Etrange.ID:
                return new Etrange(action);
            case Eviter.ID:
                return new Eviter(action);
            case Force.ID:
                return new Force(action);
            case Frapper.ID:
                return new Frapper(action);
            case Fuir.ID:
                return new Fuir(action);
            case Getup.ID:
                return new Getup(action);
            case Immobiliser.ID:
                return new Immobiliser(action);
            case Instinctif.ID:
                return new Instinctif(action);
            case Lancer.ID:
                return new Lancer(action);
            case Liberer.ID:
                return new Liberer(action);
            case Multiple.ID:
                return new Multiple(action); 
            case Parer.ID:
                return new Parer(action);
            case Projeter.ID:
                return new Projeter(action);
            case Puissante.ID:
                return new Puissante(action);
            case Rafale.ID:
                return new Rafale(action);
            case Rapide.ID:
                return new Rapide(action);
            case Recharger.ID:
                return new Recharger(action);
            case Salve.ID:
                return new Salve(action);
            case Standard.ID:
                return new Standard(action);
            case Subtile.ID:
                return new Subtile(action);
            case Tirer.ID:
                return new Tirer(action);
            case Viser.ID:
                return new Viser(action);
            default:
                return null;
        }
    }

}