import { Bloquer } from "./bloquer.js";
import { Contrer } from "./contrer.js";
import { Desarmer } from "./desarmer.js";
import { Elaboree } from "./elaboree.js";
import { Esquiver } from "./esquiver.js";
import { EsquiverLance } from "./esquiverLance.js";
import { Etrange } from "./etrange.js";
import { Eviter } from "./eviter.js";
import { Force } from "./force.js";
import { Frapper } from "./frapper.js";
import { Fuir } from "./fuir.js";
import { Immobiliser } from "./immobiliser.js";
import { Instinctif } from "./instinctif.js";
import { Lancer } from "./lancer.js";
import { Liberer } from "./liberer.js";
import { Multiple } from "./multiple.js";
import { Parer } from "./parer.js";
import { ParerLance } from "./parerLance.js";
import { ParerProjectile } from "./parerProjectile.js";
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
     * @param id The identifier if the manoeuver.
     * @returns the new manoeuver.
     */
    static create(id) {
        switch (id) {
            case Bloquer.ID:
                return new Bloquer();
            case Contrer.ID:
                return new Contrer();
            case Desarmer.ID:
                return new Desarmer();
            case Elaboree.ID:
                return new Elaboree();
            case Esquiver.ID:
                return new Esquiver();
            case EsquiverLance.ID:
                return new EsquiverLance();
            case Etrange.ID:
                return new Etrange();
            case Eviter.ID:
                return new Eviter();
            case Force.ID:
                return new Force();
            case Frapper.ID:
                return new Frapper();
            case Fuir.ID:
                return new Fuir();
            case Immobiliser.ID:
                return new Immobiliser();
            case Instinctif.ID:
                return new Instinctif();
            case Lancer.ID:
                return new Lancer();
            case Liberer.ID:
                return new Liberer();
            case Multiple.ID:
                return new Multiple(); 
            case Parer.ID:
                return new Parer();
            case ParerLance.ID:
                return new ParerLance();
            case ParerProjectile.ID:
                return new ParerProjectile();
            case Projeter.ID:
                return new Projeter();
            case Puissante.ID:
                return new Puissante();
            case Rafale.ID:
                return new Rafale();
            case Rapide.ID:
                return new Rapide();
            case Recharger.ID:
                return new Recharger();
            case Salve.ID:
                return new Salve();
            case Standard.ID:
                return new Standard();
            case Subtile.ID:
                return new Subtile();
            case Tirer.ID:
                return new Tirer();
            case Viser.ID:
                return new Viser();
            default:
                return null;
        }
    }

}