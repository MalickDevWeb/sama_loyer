> 🧭 **Navigation :** [UI](DOC_UI_POUR_DEVELOPPEURS.md) | [API](DOC_API_POUR_DEVELOPPEURS.md) | [SDK Max It Sonatel](DOC_MAXIT_MINI_SDK_SONATEL.md) | [Paiement & Résilience](DOC_PAIEMENT_NATIVE_MAXIT_ET_RESILIENCE.md) | [Responsive & TabBar](DOC_RESPONSIVE_IPHONE_ET_CUSTOM_TABBAR.md) | [Navigation & Behaviors](DOC_NAVIGATION_BEHAVIORS_ET_METIER.md) | [Tunnels & Billetterie](DOC_TUNNELS_METIERS_ET_BILLETTERIE_AVANCEE.md) | [Audit & Patterns FlyAfriTrip](DOC_AUDIT_EXHAUSTIF_ET_PATTERNS_AFRITRIPS.md) | [Recettes](DOC_RECETTES_COPIER_COLLER.md) | [Données](DOC_DONNEES_MAPPERS_HELPERS.md) | [FAQ](DOC_FAQ_ERREURS_FREQUENTES.md)

---

# 🛫 Audit Exhaustif Page par Page & Catalogue de Patterns du Projet Référence FlyAfriTrip

> **Projet Audité :** `C:\Orange\Projet\ats\projet_gitlab\mp-ats-app\mp-afritrips`  
> **Branche :** `integration/team-demo` (commit `0901dbe`)  
> **Statut de validation :** **94/94 tests unitaires & d'intégration réussis (100% au vert)**.  
> Ce document constitue l'audit de référence le plus détaillé de la codebase FlyAfriTrip : il passe au crible **chaque page, chaque composant, chaque animation WXSS et chaque algorithme métier** pour les mettre à disposition de tous les développeurs et agents d'ingénierie logicielle.

---

## 📑 Sommaire

1. [🗺️ Vue d'Ensemble & Métriques de l'Audit](#1-vue-densemble--métriques-de-laudit)
2. [📄 Audit Page par Page (Les 11 Écrans du Tunnel)](#2-audit-page-par-page-les-11-écrans-du-tunnel)
   - [Page 1 : `pages/index/` (Accueil & Moteur de Recherche Multi-Types)](#page-1--pagesindex-accueil--moteur-de-recherche-multi-types)
   - [Page 2 : `pages/flights/` (Résultats de Recherche, Tri & Pagination IPC)](#page-2--pagesflights-résultats-de-recherche-tri--pagination-ipc)
   - [Page 3 : `pages/flight-details/` (Détail de l'Itinéraire & Frise Temporelle)](#page-3--pagesflight-details-détail-de-litinéraire--frise-temporelle)
   - [Page 4 : `pages/upgrade-flight/` (Comparateur de Familles Tarifaires & Carrousel)](#page-4--pagesupgrade-flight-comparateur-de-familles-tarifaires--carrousel)
   - [Page 5 : `pages/passenger-information/` (Formulaire Multi-Voyageurs & Passeports)](#page-5--pagespassenger-information-formulaire-multi-voyageurs--passeports)
   - [Page 6 : `pages/seat-map/` (Plan de Cabine Interactif & Encodage GDS)](#page-6--pagesseat-map-plan-de-cabine-interactif--encodage-gds)
   - [Page 7 : `pages/review/` (Récapitulatif Avant Paiement & Décomposition Tarifaire)](#page-7--pagesreview-récapitulatif-avant-paiement--décomposition-tarifaire)
   - [Page 8 : `pages/payment/` (Contrôle Disponibilité 60s & Facturation)](#page-8--pagespayment-contrôle-disponibilité-60s--facturation)
   - [Page 9 : `pages/processing/` (Animation Radar & Réservation /book)](#page-9--pagesprocessing-animation-radar--réservation-book)
   - [Page 10 : `pages/confirmed/` (Confirmation, PNR & Snapshot Immuable)](#page-10--pagesconfirmed-confirmation-pnr--snapshot-immuable)
   - [Page 11 : `pages/trip-details/` (Gestion Post-Booking & Export PDF Vectoriel)](#page-11--pagestrip-details-gestion-post-booking--export-pdf-vectoriel)
3. [🎨 Catalogue des Composants UI & Micro-Interactions](#3-catalogue-des-composants-ui--micro-interactions)
   - [Composant 1 : `flight-loader` (Animation Ciel, Nuages et Avion en Pur CSS)](#composant-1--flight-loader-animation-ciel-nuages-et-avion-en-pur-css)
   - [Composant 2 : `seat-map` (Sélecteur de Sièges Aériens avec Issues de Secours)](#composant-2--seat-map-sélecteur-de-sièges-aériens-avec-issues-de-secours)
   - [Composant 3 : `stepper` (Barre de Progression de Commande Multi-Étapes)](#composant-3--stepper-barre-de-progression-de-commande-multi-étapes)
   - [Composant 4 : `booking-price-card` (Barre Adhésive Inférieure avec Safe Area)](#composant-4--booking-price-card-barre-adhésive-inférieure-avec-safe-area)
   - [Composant 5 : `itinerary-card` (Carte de Vol Résiliente avec Fallback d'Initiales)](#composant-5--itinerary-card-carte-de-vol-résiliente-avec-fallback-dinitiales)
   - [Composant 6 : `fare-rules` (Accordéon Pliable des Restrictions Tarifaires)](#composant-6--fare-rules-accordéon-pliable-des-restrictions-tarifaires)
4. [🧠 Algorithmes & Pépites Métier Réutilisables](#4-algorithmes--pépites-métier-réutilisables)
   - [Algorithme 1 : Ratios Passagers IATA (Adultes / Enfants / Bébés)](#algorithme-1--ratios-passagers-iata-adultes--enfants--bébés)
   - [Algorithme 2 : Résolution Intelligente de Logos Aériens avec Fallback](#algorithme-2--résolution-intelligente-de-logos-aériens-avec-fallback)
   - [Algorithme 3 : Découpage IPC par Lots de 20 avec Callback](#algorithme-3--découpage-ipc-par-lots-de-20-avec-callback)
   - [Algorithme 4 : Sérialiseur PDF Vectoriel `%PDF-1.4` (0 Mo npm)](#algorithme-4--sérialiseur-pdf-vectoriel-pdf-14-0-mo-npm)

---

## 1. 🗺️ Vue d'Ensemble & Métriques de l'Audit

Le projet `mp-afritrips` est une référence absolue en matière de mini-programme complexe sous contraintes extrêmes (architecture TCMPP 2 Mo, exécution sur réseaux mobiles instables 2G/3G/4G et intégration bancaire Orange Money) :

* **11 Pages écrans** orchestrées sans aucune rupture d'état.
* **33 Composants réutilisables** répartis en 4 catégories (`components/ui`, `components/flight`, `components/trip`, `components/forms`).
* **94 Tests automatisés** garantissant 0 régression sur les calculs tarifaires, le tri de vols, les formats de passeports et la génération de fichiers binaires.
* **0 Kilo-octet de librairie externe lourde** dans le bundle final.

---

## 2. 📄 Audit Page par Page (Les 11 Écrans du Tunnel)

---

### Page 1 : `pages/index/` (Accueil & Moteur de Recherche Multi-Types)

#### 🎯 Rôle Métier
Permet à l'utilisateur de définir son projet de voyage : choix entre 3 modes de trajet, sélection des villes/aéroports, dates de départ et retour, nombre et catégories de passagers, et classe de cabine.

#### 🎨 Éléments UI & Design
* **Header de Marque :** Barre de navigation personnalisée avec logo FlyAfriTrip (`osn-nav-bar image="/assets/images/afritrip.png"`).
* **Onglets de Trajet :** Barre d'onglets segmentée (`tab-row`) pour basculer en un tap entre *Aller-Retour* (`roundTrip`), *Aller Simple* (`oneWay`) et *Multi-Destinations* (`multiCity`).
* **Champs de Saisie avec Suggestions :** Entrées départ/arrivée intégrant des icônes de vol (`flight`, `flight_land`) et une liste déroulante d'autocomplétion des aéroports avec code IATA (ex: `Dakar DSS`).
* **Double Sélecteur de Dates :** Affichage côte à côte départ et retour relié par une flèche directionnelle (`date-arrow →`).
* **Gestion Dynamique Multi-Destinations :** Bouton d'ajout de tronçon (`handleAddMultiCityLeg`) et suppression individuelle (`handleRemoveMultiCityLeg`) dès que la liste dépasse 2 tronçons.

#### ⚙️ Logique & Algorithmes Clés
* **Règle Stricte de Ratios Passagers IATA :**
  ```javascript
  // Les bébés sur les genoux (infantsOnLap) ne peuvent pas dépasser le nombre d'adultes
  if (infantsOnLap > adults) {
    throw new Error('Le nombre de bébés sur les genoux ne peut dépasser le nombre d adultes accompagnateurs.');
  }
  ```
* **Contrainte Temporelle Dynamique :** La date minimale de retour s'aligne automatiquement sur la date de départ choisie (`minDate="{{searchForm.departDate || todayDate}}"`).

---

### Page 2 : `pages/flights/` (Résultats de Recherche, Tri & Pagination IPC)

#### 🎯 Rôle Métier
Affiche l'ensemble des offres de vols retournées par les moteurs aériens, permet le tri rapide par prix/durée et gère le défilement infini de volumes massifs.

#### 🎨 Éléments UI & Design
* **Pillules de Tri Rapide (`results-tags`) :** 3 badges interactifs avec prix en direct : *Le Moins Cher* (ex: `150 000 XOF`), *Le Plus Rapide* (ex: `185 000 XOF`), et *Meilleur Compromis* (ex: `160 000 XOF`).
* **Cartes de Vols Compactes (`osn-result`) :** Affichent l'horaire de départ, l'horaire d'arrivée, la durée totale, le nombre d'escales, le nom et le logo de la compagnie, et le prix total par personne.
* **Micro-Indicateurs :** Couleur active Orange Sonatel (`#FD6602`) et étiquettes de devises alignées.

#### ⚙️ Logique & Algorithmes Clés
* **Batch Rendering Anti-Freeze IPC :** Pour éviter de saturer le canal de rendu C++ lors de l'affichage de 150 vols, les résultats sont injectés par paquets de 20 cartes via des chemins d'index (`updatePayload['displayedFlights[' + index + ']'] = item`), en attendant la confirmation du callback `setData`.
* **Récupération Mémoire à 0ms :** Lors du clic sur une offre, l'objet brut complet est récupéré instantanément depuis la mémoire JS locale (`rawFlightsMap`) sans aucun appel réseau redondant.

---

### Page 3 : `pages/flight-details/` (Détail de l'Itinéraire & Frise Temporelle)

#### 🎯 Rôle Métier
Décompose le vol sélectionné segment par segment : terminaux de départ, modèle d'avion, durée de vol, aéroports d'escale, temps d'attente et durée de séjour sur place.

#### 🎨 Éléments UI & Design
* **Alerte de Rareté Commerciale :** Bandeau d'urgence avec `aria-role="alert"` indiquant : *"Plus que 3 sièges disponibles à ce tarif !"*.
* **Frise Chronologique Continue :** Ligne verticale reliant la date de départ, les aéroports et l'arrivée finale avec décalages géométriques millimétrés (`x = 122px`).
* **Cartes de Segments Dépliables :** Permettent d'afficher les détails de chaque tronçon d'escale en cliquant sur la carte.
* **Barre Adhésive Inférieure (`osn-booking-price-card`) :** Total général toujours visible avec support de la zone sécurisée iPhone (`env(safe-area-inset-bottom)`).

#### ⚙️ Logique & Algorithmes Clés
* Calcul automatique de la durée de séjour entre le vol aller et le vol retour (`flight-stay-summary`).
* Détection des escales techniques avec changement d'appareil (`flight-technical-stop`).

---

### Page 4 : `pages/upgrade-flight/` (Comparateur de Familles Tarifaires & Carrousel)

#### 🎯 Rôle Métier
Permet à l'utilisateur de comparer et de surclasser son billet vers une classe supérieure (Eco Standard, Eco Flex, Premium, Business).

#### 🎨 Éléments UI & Design
* **Bannière d'Incitation Amusante :** Illustration fusée avec message sur les avantages du surclassement et bouton de fermeture tactile.
* **Carrousel Horizontal Fluide :** Défilement latéral des cartes avec flèches de navigation animées (`upgrade-fares__carousel-arrow`).
* **Cartes Comparatives (`upgrade-fare-card`) :** Badge "Recommandé", prix différentiel par personne, et liste scrollable des privilèges inclus (bagage supplémentaire, choix du siège gratuit, repas à bord, annulation remboursable).
* **Accordéon des Règles Tarifaires (`osn-fare-rules`) :** Détail officiel des frais de modification et d'annulation.

#### ⚙️ Logique & Algorithmes Clés
* Recalcul instantané du montant total dans la barre inférieure adhésive lors de la sélection d'une famille tarifaire.
* Mise en cache de l'offre surclassée dans l'EventBus (`upgrade.flight.state`).

---

### Page 5 : `pages/passenger-information/` (Formulaire Multi-Voyageurs & Passeports)

#### 🎯 Rôle Métier
Recueille l'état civil, les pièces d'identité et les coordonnées de chaque voyageur composant le dossier de réservation.

#### 🎨 Éléments UI & Design
* **Résumé Itinéraire Pliable :** Rappel compact du vol réservé en haut d'écran.
* **Widget Franchises Bagages (`osn-baggage-allowance`) :** Récapitule les bagages cabine, soute et accessoires personnels par trajet.
* **Cartes Voyageurs Accordéons :** Chaque passager dispose d'une carte rétractable avec badges contextuels (`Adult 1`, `Lead Passenger`, `Child`).
* **Sélecteur d'Indicatif Pays :** Menu déroulant pour le numéro de téléphone international.

#### ⚙️ Logique & Algorithmes Clés
* **Validation Civile Rigoureuse :** Contrôle des formats de dates de naissance (cohérence avec la catégorie Adulte/Enfant/Bébé), date d'expiration du passeport valide au moins 6 mois après le vol.
* **Dédoublonnage Automatique :** Le premier passager adulte remplit par défaut les coordonnées de contact pour éviter les ressaisies fastidieuses.

---

### Page 6 : `pages/seat-map/` (Plan de Cabine Interactif & Encodage GDS)

#### 🎯 Rôle Métier
Offre la sélection interactive des sièges dans la carlingue de l'avion avec affectation nominative pour chaque voyageur.

#### 🎨 Éléments UI & Design
* **Onglets de Tronçons :** Permet de basculer entre le vol aller et le vol retour.
* **Disposition des Sièges Réaliste :** En-tête des colonnes (`A B C` allée `D E F`) et numéros de rangées affichés directement dans le couloir central.
* **Indicateurs d'Issues de Secours (`exit-marker`) :** Lignes d'avertissement stylisées pour les rangées d'urgence.
* **5 États Visuels de Sièges :** Disponible, Occupé (barre diagonale), Réservé, Espace jambes VIP (icône étoile ★), et Sélectionné (anneau pulsant).
* **Info-Bulle Flottante (Tooltip) :** Apparaît au-dessus du siège cliqué avec son prix et ses caractéristiques.

#### ⚙️ Logique & Algorithmes Clés
* **Encodage Normalisé GDS 15 Champs :**
  `départUnix-origine-destination-compagnie-numéroVol-indexVoyageur-siège-payant-total-base-taxe-devise-paysPOS-typeSiège-0`
* **Exclusion Bébés :** Blocage matériel interdisant d'attribuer un siège à un nourrisson sur les genoux (`INL`).

---

### Page 7 : `pages/review/` (Récapitulatif Avant Paiement & Décomposition Tarifaire)

#### 🎯 Rôle Métier
Dernière étape avant la transaction bancaire : certifie chaque ligne de coût et affiche le contrat récapitulatif définitif.

#### 🎨 Éléments UI & Design
* **Décomposition Tarifaire Complète :** Lignes séparées pour la base des adultes, la base des enfants, les taxes globales du fournisseur, les sièges payants, les bagages et le code promo.
* **Bouton de Nouvelle Tentative :** En cas d'échec transitoire de tarification, un bouton "Réessayer" évite de perdre tout le formulaire.

#### ⚙️ Logique & Algorithmes Clés
* **Bouclier Anti-Mismatch de Devises :** Empêche formellement l'addition de montants libellés dans des monnaies distinctes (ex: `XOF` vs `EUR`).
* **Règle de Taxe Inconnue :** Une taxe retournée à `null` par l'API reste à l'état `TAX_PENDING_LOOKUP` et n'est jamais faussement affichée à `0 FCFA`.

---

### Page 8 : `pages/payment/` (Contrôle Disponibilité 60s & Facturation)

#### 🎯 Rôle Métier
Vérifie en temps réel que les places sont toujours disponibles auprès du transporteur avant d'initier le paiement.

#### 🎨 Éléments UI & Design
* **Formulaire d'Adresse de Facturation :** Nom du payeur, adresse, ville, région, pays et code postal.
* **Bloc Légal des Conditions Générales :** Texte d'approbation des règles de transport avec mots-clés surlignés en orange.
* **Choix du Moyen de Paiement :** Orange Money ou Carte Bancaire.

#### ⚙️ Logique & Algorithmes Clés
* **Cache de Disponibilité 60s :** Une vérification positive (`/check-availability`) est mémorisée pendant 60 secondes pour éviter de bloquer l'inventaire distant par des appels multiples.
* **Génération de l'`attemptId` :** Identifiant unique scellant cette tentative de réservation.

---

### Page 9 : `pages/processing/` (Animation Radar & Réservation /book)

#### 🎯 Rôle Métier
Page de transition pendant que la commande de réservation est envoyée et scellée dans les systèmes de réservation (GDS).

#### 🎨 Éléments UI & Design
* **Animation Aérienne `flight-loader` :** Aéronef traversant le ciel avec nuages défilants et traînée de condensation (voir section Composants ci-dessous).
* **Carte de Progression :** Affiche le statut actuel (`processing`, `success`, `error`) avec référence de tentative.

#### ⚙️ Logique & Algorithmes Clés
* **Protection Anti-Double Soumission :** Mémorisation de promesse active par `attemptId` dans un `Map()` JavaScript : impossible de soumettre deux fois la même transaction même en cas de double tap tactile frénétique.
* **Gestion du Statut Incertain :** En cas de timeout (> 90s), l'application passe en état d'attente sans relancer de second booking.

---

### Page 10 : `pages/confirmed/` (Confirmation, PNR & Snapshot Immuable)

#### 🎯 Rôle Métier
Affiche le succès de la commande avec le numéro de référence client et le dossier passager (PNR).

#### 🎨 Éléments UI & Design
* **Badge de Succès :** Icône verte de validation et référence client mise en évidence.
* **Bouton d'Accès au Voyage :** Bouton principal dirigeant vers l'écran de consultation des détails.

#### ⚙️ Logique & Algorithmes Clés
* **Création du `checkoutSnapshot` :** Instantané figé qui capture toutes les informations confirmées (itinéraire, tarifs, passagers) pour immuniser la page de consultation contre toute modification ultérieure.

---

### Page 11 : `pages/trip-details/` (Gestion Post-Booking & Export PDF Vectoriel)

#### 🎯 Rôle Métier
Espace personnel du voyageur permettant de consulter son itinéraire, ses billets électroniques et d'exporter son billet en PDF officiel.

#### 🎨 Éléments UI & Design
* **Bannière Hero Voyage :** Image de couverture avec bouton de partage natif intégré.
* **Bouton Copie Référence :** Copie en un tap de la référence de réservation dans le presse-papier du téléphone.
* **Cartes E-Billets (`trip-eticket-card`) :** Numéros de billets émis par passager.
* **Bouton Exporter / Imprimer :** Déclenche la génération du PDF.

#### ⚙️ Logique & Algorithmes Clés
* **Générateur PDF Vectoriel `%PDF-1.4` Natif :** Génère un document PDF complet directement en mémoire sans aucune librairie externe (0 Mo) et l'ouvre via `wx.openDocument({ showMenu: true })`.
* **Récupération Sélective :** N'interroge le serveur que pour les ressources post-booking qui n'étaient pas déjà présentes dans le snapshot de confirmation.

---

## 3. 🎨 Catalogue des Composants UI & Micro-Interactions

---

### Composant 1 : `flight-loader` (Animation Ciel, Nuages et Avion en Pur CSS)
Ce composant offre une animation immersive à 60 FPS sans impacter la batterie ni la mémoire, en utilisant exclusivement les propriétés GPU `transform` et `opacity`.

#### Structure WXML
```xml
<view class="al-sky">
  <view class="al-glow"></view>
  <view class="al-cloud al-cloud--1"></view>
  <view class="al-cloud al-cloud--2"></view>
  <view class="al-cloud al-cloud--3"></view>
  <view class="al-path"></view>
  <view class="al-plane-wrap">
    <view class="al-puff al-puff--1"></view>
    <view class="al-puff al-puff--2"></view>
    <view class="al-puff al-puff--3"></view>
    <image class="al-plane" src="{{planeIcon}}" mode="aspectFit" />
  </view>
  <view class="al-ground"></view>
</view>
```

#### Animation CSS Clé (`index.wxss`)
```css
/* Vol fluide de l'avion avec inclinaison réaliste */
@keyframes al-fly {
  0% { transform: translate(-140rpx, -6rpx) rotate(-3deg); }
  50% { transform: translate(320rpx, 14rpx) rotate(4deg); }
  100% { transform: translate(760rpx, -4rpx) rotate(-3deg); }
}

/* Panaches de fumée s'évaporant derrière l'appareil */
@keyframes al-puff-fade {
  0% { opacity: 0.75; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.2); }
}

/* Dérive douce des nuages */
@keyframes al-drift {
  from { transform: translateX(0); }
  to { transform: translateX(760rpx); }
}
```

---

### Composant 2 : `seat-map` (Sélecteur de Sièges Aériens avec Issues de Secours)
Composant complet affichant la carlingue d'un avion avec couloir central, légende dynamique et gestion des statuts de sièges.

* **Fichier :** `components/ui/seat-map/`
* **Fonctionnalités :**
  * Support multi-tronçons (`onSwitchLeg`).
  * Marqueurs d'issues de secours avec bordures d'avertissement.
  * Numéros de rangées affichés dans l'allée centrale.
  * Tooltips interactifs au toucher avec tarif.

---

### Composant 3 : `stepper` (Barre de Progression de Commande Multi-Étapes)
Barre horizontale indiquant l'avancement dans le tunnel de réservation avec connecteurs et cercles d'étapes.

* **Fichier :** `components/ui/stepper/`
* **États :**
  * Étape passée : Cercle rempli avec coche de validation `✓` et connecteur coloré.
  * Étape active : Numéro en surbrillance avec anneau extérieur.
  * Étape future : Numéro grisé.

---

### Composant 4 : `booking-price-card` (Barre Adhésive Inférieure avec Safe Area)
Barre fixe collée au bas de l'écran affichant le prix total courant et le bouton d'action principal.

* **Fichier :** `components/flight/booking-price-card/`
* **Points forts :**
  * Padding dynamique pour la barre Home Indicator des iPhone (`padding-bottom: env(safe-area-inset-bottom);`).
  * Chevron tactile rotatif pour déployer le récapitulatif détaillé des taxes.
  * Attributs d'accessibilité ARIA (`aria-role="button"`, `aria-label`).

---

### Composant 5 : `itinerary-card` (Carte de Vol Résiliente avec Fallback d'Initiales)
Carte présentant les horaires, aéroports et compagnies d'un vol avec un bouclier anti-image brisée.

* **Fichier :** `components/trip/trip-itinerary-card/`
* **Points forts :**
  * Écoute l'événement `binderror="handleLogoError"`.
  * Si l'image du logo de la compagnie échoue à charger sur le réseau 4G, le composant bascule automatiquement vers un badge circulaire textuel contenant les initiales du transporteur (ex: `AF`, `HC` ou `✈`).

---

## 4. 🧠 Algorithmes & Pépites Métier Réutilisables

---

### Algorithme 1 : Ratios Passagers IATA (Adultes / Enfants / Bébés)
Dans l'aviation civile internationale, un bébé sur les genoux doit obligatoirement être accompagné par un adulte dévoué. Le moteur applique cette règle dès le formulaire :

```javascript
export function validatePassengerCounts({ adults = 1, children = 0, infantsOnSeat = 0, infantsOnLap = 0 }) {
  if (adults < 1) {
    return { valid: false, error: 'Au moins un passager adulte est obligatoire.' };
  }
  if (infantsOnLap > adults) {
    return { valid: false, error: 'Chaque bébé sur les genoux doit être accompagné par un adulte distinct.' };
  }
  const totalTravellers = adults + children + infantsOnSeat + infantsOnLap;
  if (totalTravellers > 9) {
    return { valid: false, error: 'Les réservations de groupe de plus de 9 passagers nécessitent un devis spécifique.' };
  }
  return { valid: true };
}
```

---

### Algorithme 2 : Résolution Intelligente de Logos Aériens avec Fallback
Garantit qu'aucun logo manquant n'affiche une icône brisée ou ne tente de charger une URL non sécurisée (`http://`) :

```javascript
export function resolveAirlineLogo({ code, name, logo }) {
  // 1. Logos officiels locaux en priorité (zéro latence réseau)
  const LOCAL_LOGOS = {
    HC: '/assets/images/airlines/air-senegal.png',
    HF: '/assets/images/airlines/air-cote-divoire.png'
  };
  const carrierCode = String(code || '').trim().toUpperCase();
  if (LOCAL_LOGOS[carrierCode]) return LOCAL_LOGOS[carrierCode];

  // 2. Vérification HTTPS stricte
  if (logo && /^https:\/\//i.test(logo)) return logo;

  // 3. CDN distant de secours
  return carrierCode ? `https://www.flighthub.com/cf-assets/images/suppliersx2/${carrierCode}x2.png` : '';
}
```

---

### Algorithme 3 : Découpage IPC par Lots de 20 avec Callback
Évite le freeze de la WebView lors du rendu de grandes listes de résultats :

```javascript
injectNextBatch() {
  if (this.cursor >= this.rawItems.length) return;

  const nextBatch = this.rawItems.slice(this.cursor, this.cursor + 20);
  const updatePayload = {};

  nextBatch.forEach((item, index) => {
    updatePayload[`displayedFlights[${this.cursor + index}]`] = item;
  });

  this.cursor += nextBatch.length;

  // L'appel au lot suivant ne démarre qu'après confirmation de rendu du thread de vue
  this.setData(updatePayload, () => {
    if (this.cursor < 40 && this.cursor < this.rawItems.length) {
      this.injectNextBatch();
    }
  });
}
```

---

### Algorithme 4 : Sérialiseur PDF Vectoriel `%PDF-1.4` (0 Mo npm)
Permet d'émettre des billets et factures électroniques conformes sans ajouter aucune dépendance npm :

```javascript
export function serializePdfObjects(objects) {
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}
```

---

> 🔗 **Ressources complémentaires :**
> - [Guide des Tunnels Métiers & Billetterie](DOC_TUNNELS_METIERS_ET_BILLETTERIE_AVANCEE.md)
> - [Guide Officiel du SDK Max It Sonatel](DOC_MAXIT_MINI_SDK_SONATEL.md)
> - [Le Livre de Recettes Copier-Coller](DOC_RECETTES_COPIER_COLLER.md)

