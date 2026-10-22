# `refactor/normalize-and-cleanup` par rapport à `develop`

## 1. Objectif de la branche

Cette branche part de `develop` au commit `60975b5` et regroupe des travaux de normalisation API, de factorisation des helpers, de fiabilisation du parcours de réservation et de séparation des composants ATS de ceux du boilerplate. Le diff Git contient aussi des changements d'interface; cette documentation se concentre sur ceux qui établissent un pattern ou une décision durable.

L'intention générale est de réduire la connaissance des formats API et des détails de navigation dans les pages. Les appels, transformations, règles de validation et vues dérivées sont davantage placés dans des modules dédiés. La migration reste partielle : certains états de chargement et verrous sont encore gérés localement, et certaines actions de réservation ne sont pas branchées à un service.

## 2. Architecture et flux des données

Pour les données du catalogue et des réservations, le flux principal est désormais :

```text
Page
  ↓
Helper métier (catalog, reservations, destination)
  ↓
BackendAPI
  ├── authenticate + HttpClient / wx.request
  ├── extraction et contrôle de l'enveloppe API
  └── Sculpt + schéma de l'entité
  ↓
Modèle adapté au frontend
  ↓
Page et composants
```

`BackendAPI` (`utils/apis/index.js`) porte les routes et la forme des opérations distantes. `HttpClient` ajoute les en-têtes de session et de requête, puis normalise les échecs HTTP. Les helpers coordonnent les opérations propres au domaine et, selon le cas, le store ou le stockage local. Les pages déclenchent ces opérations et présentent leur résultat.

Par exemple, Explorer charge les packages via `utils/helpers/catalog.js`; `BackendAPI.getPackages()` transforme la réponse avant que les données soient mises dans le store. La page de détail appelle également le helper `loadPackage`, puis `toDestinationDetailView` prépare les champs d'affichage de sa galerie. La page ne lit donc plus elle-même la réponse brute de l'API.

## 3. Normalisation API, Sculpts et modèles frontend

`BackendAPI` est le point d'accès utilisé par les helpers concernés. Il vérifie l'enveloppe de réponse et délègue la projection des champs à `sculpt.data({ data, to: schema })`. Les schémas par entité résident dans `utils/mappers/*.sculpt.js` : package, catégorie, réservation et détail de réservation.

Les schémas expriment le contrat retenu avec des chemins explicites (`@link.id`, `@link.review_count`, `@link.booking_ref`, etc.) et peuvent appliquer des transformations, comme le formatage du prix d'un package. Le Sculpt partagé sait aussi convertir certains types et traiter des structures plus complexes. Une fois mappée, la donnée expose les noms utilisés dans l'application, par exemple `bookingRef` au lieu de `booking_ref`.

Cette organisation remplace les mappers généralistes supprimés (`ats.js` et `reservation.js`) par des schémas ciblés et consommés dans la couche API. L'ancien mapper ATS acceptait de nombreuses clés alternatives (`name`/`title`, `image`/`thumbnail`, etc.); les nouveaux schémas choisissent les clés du contrat documenté. Cela ne signifie pas que tous les mécanismes de fallback ont disparu : le moteur Sculpt les prend toujours en charge, et des fallbacks restent employés dans des helpers et dans la gestion d'erreurs.

**Convention pratique :** une page ne doit pas déplier ou renommer une réponse API. Ajouter ou modifier la projection dans le schéma de l'entité concernée, puis garder dans le helper les adaptations de domaine ou de présentation qui ne relèvent pas du contrat API.

## 4. Gestion des erreurs

Les erreurs suivent plusieurs responsabilités :

1. `HttpClient` distingue les réponses HTTP réussies, les statuts HTTP en échec et les erreurs de transport.
2. `normalizeApiError` dans `utils/errors/index.js` extrait le message, le statut, le code API et les métadonnées, puis produit une erreur applicative (`ValidationError`, `NotFoundError`, `NetworkError`, `AuthorizationError`, `ExternalServiceError` ou `AppError`).
3. `BackendAPI` contrôle aussi les erreurs applicatives présentes dans une réponse HTTP réussie et convertit les erreurs de transformation Sculpt en erreurs applicatives.
4. Les helpers propagent ou traitent l'erreur selon le besoin du domaine; les pages choisissent ensuite le message, l'état et l'action à afficher.

Par exemple, un corps d'erreur API contenant `code`, `message` et `data.status: 400` est interprété par `normalizeApiError` comme une erreur de validation. L'erreur exposée conserve le message et le code de l'API, fournit `status`/`statusCode` et place les données de réponse dans `metadata.apiData`. Une erreur réseau reçoit le statut `0` et le code `NETWORK_ERROR`. La page de détail de destination distingue ensuite un `404`/`NOT_FOUND` d'une panne récupérable et propose une nouvelle tentative uniquement pour cette dernière.

Les erreurs ne sont pas toutes traitées de façon identique à l'écran : certains helpers de catalogue utilisent volontairement des données de repli. La normalisation fournit une forme commune; elle n'impose pas une stratégie UI unique.

## 5. Loading et états UI

`utils/behaviors/loading.js` expose un `loadingBehavior` réutilisable. `withLoading()` encadre une opération asynchrone, gère `isLoading`, `hasError`, `errorMessage` et peut afficher le loader natif via `wx.showLoading`. Ce comportement fournit une abstraction commune, mais les pages de la branche ne l'adoptent pas uniformément : Explorer, réservation et détail de destination ont encore des états gérés localement. Il faut donc le considérer comme une capacité disponible, et non comme le mécanisme déjà partagé par tout le produit.

La page de détail de destination illustre un autre besoin : son `pageState` distingue `loading`, `success`, `notFound` et `error`, avec retry sur une erreur récupérable. Cette distinction permet de ne pas confondre l'absence réelle de destination avec une indisponibilité temporaire du service.

## 6. Déduplication et factorisation

### Navigation et doubles actions

Les gardes de navigation ont été regroupées dans `utils/helpers/navigation.js` : `navigateWithLock` protège une navigation arbitraire et `navigateToLocked` combine verrou et navigation avec repli à la limite de pile. Les pages d'accueil, Explorer, Favoris et détail/réservation l'utilisent pour éviter les ouvertures multiples après des taps répétés. Quelques actions gardent encore leur propre verrou, notamment la création de réservation dans l'écran de paiement.

### Catalogue, validations et données de destination

`utils/helpers/catalog.js` regroupe le chargement des packages, recommandations et catégories, la synchronisation avec le store et la validation des identifiants de package. `utils/helpers/reservations.js` contient la validation stricte d'une date future au format ISO. Ces contrôles sont réutilisés dans les parcours de réservation au lieu de laisser chaque page interpréter seule les paramètres de navigation.

### Formatage et modèles de vue

Les formatters partagés ajoutent notamment le parsing des prix et `formatPackagePrice`, qui respecte la devise fournie au lieu d'imposer systématiquement FCFA. Les transformations spécifiques d'affichage sont sorties des pages vers des helpers : `toDestinationDetailView` pour la galerie et les notes, `toReservationDetailView` pour les libellés de date, voyageurs, prix et statut.

### Parsing et autres logiques non centralisées

La branche conserve des fonctions locales de décodage des paramètres dans plusieurs pages (`safeDecode`/`decodeBookingRef`). Le parsing des prix et la validation des identifiants/dates sont, eux, partagés. Il ne faut donc pas conclure à une centralisation complète de tous les utilitaires répétitifs.

## 7. Réservations

Le parcours sépare désormais les opérations API et la préparation des données de réservation des pages. Dans le flux représentatif, `pages/booking/booking.js` vérifie l'identifiant du package, récupère celui-ci depuis le catalogue ou l'API, contrôle son prix et la date, puis transmet les paramètres à l'étape suivante. `pages/paiement/index.js` valide à nouveau les paramètres indispensables avant d'appeler `createReservation()` dans `utils/helpers/reservations.js`.

`createReservation()` crée une réservation via `BackendAPI.createBooking()`, exige une référence, puis conserve localement un instantané utile à l'affichage (package, date, voyageurs, total, statut). Le statut API est conservé; en son absence, le helper utilise `pending_payment`. La page de détail combine les données distantes avec les données locales lorsqu'elles sont disponibles, et peut afficher la réservation locale si la récupération API échoue.

Cette branche ne constitue pas une intégration complète d'un paiement : l'écran nommé `paiement` crée l'enregistrement de réservation, mais le diff ne montre pas d'appel à une passerelle de paiement. De même, l'annulation, le support et le téléchargement de billet restent des retours « en cours de configuration »/indisponibles; ne pas les présenter comme des opérations backend implémentées. Le rebooking, lui, contrôle l'identifiant du package avant de relancer le parcours.

## 8. Composants et organisation frontend

La branche distingue les composants du boilerplate, conservés sous `components/ui` et `components/ux`, des composants spécifiques à ATS, placés sous :

```text
components/costumers/
├── ui/   # composants d'interface ATS réutilisables
└── ux/   # composants d'expérience et d'états ATS
```

Les composants de cartes, layout, filtres et liste ATS sont regroupés dans `costumers/ui`. Les skeletons liés aux écrans et états ATS sont sous `costumers/ux`; les README de ces dossiers précisent que les composants UX présentent des états d'interface, sans logique métier ou API. Les composants fondamentaux du boilerplate restent dans leurs dossiers globaux. Les chemins de déclaration (`app.json`, JSON de pages/composants et entrée de tab bar) suivent cette organisation.

## 9. Erreurs, retry et skeletons côté UX

Le cas le plus explicite est le détail d'une destination : le skeleton s'affiche pendant la récupération, un état vide dédié indique une destination introuvable, et un état d'erreur expose un bouton Réessayer lorsque le problème peut être transitoire. Le contenu détaillé n'est rendu qu'à l'état `success`. Cela sépare le chargement de l'absence de résultat et d'une erreur réseau/API.

La branche ajoute ou déplace aussi des skeletons de cartes de destination et de réservation, et un skeleton de détail de destination. Leur présence fournit des placeholders adaptés aux surfaces concernées; elle ne signifie pas que tous les écrans ont un retry ou le même automate d'états.

## 10. Conventions introduites par cette branche

- Pour les opérations catalogue/réservation concernées, passer par `BackendAPI` et les helpers de domaine plutôt que d'appeler `wx.request` ou de lire les enveloppes API dans une page.
- Déclarer la projection de chaque entité dans son schéma `*.sculpt.js`; exposer au frontend les noms de propriétés utilisés par l'application.
- Garder les adaptations de vue dans les helpers de présentation et les règles métier/coordination dans les helpers de domaine. Les pages pilotent le flux et l'affichage.
- Normaliser les erreurs à la frontière HTTP/API, puis choisir explicitement au niveau helper/page entre propagation, données de repli, état `notFound` ou retry.
- Réutiliser `catalog.js`, `reservations.js`, `formatters/index.js` et `navigation.js` lorsque leurs contrats correspondent au besoin. Ne pas recréer une variante locale du même comportement sans raison spécifique.
- Valider les identifiants de package, dates, prix et paramètres avant de déclencher une action de réservation.
- Employer les composants du boilerplate sous `components/ui`/`components/ux`; placer les composants propres à ATS sous `components/costumers/ui` ou `components/costumers/ux` selon leur rôle.
- Utiliser les skeletons pour représenter le chargement réel et distinguer les états `loading`, `notFound` et `error` lorsque l'écran a besoin de les différencier. Le `loadingBehavior` existe, mais son adoption dans les pages reste à décider au cas par cas.

## 11. Synthèse de l'impact sur `develop`

| Domaine | Avant (`develop`) | Après (`refactor/normalize-and-cleanup`) |
| --- | --- | --- |
| API | Transformation et extraction davantage dispersées entre services/helpers et mappers généralistes. | `BackendAPI` consomme des schémas Sculpt par entité et normalise les réponses/erreurs API. |
| Mapping | Mapper ATS permissif avec de nombreuses clés alternatives; mapper réservation séparé. | Schémas explicites package, catégorie et réservation; adaptation métier/vue placée dans des helpers. |
| Erreurs | Réponses HTTP/API et exceptions moins uniformes. | Hiérarchie `AppError`, normalisation du statut, code, message et métadonnées, avec traitement UI selon le contexte. |
| Loading | Gestion souvent attachée aux pages; behavior commun disponible dans le boilerplate. | Behavior expose loading/error communs, mais plusieurs écrans gardent un état local; le détail destination distingue quatre états. |
| Factorisation | Logiques de navigation, catalogue, validation et affichage réparties dans les pages. | Helpers partagés pour navigation verrouillée, catalogue, dates, prix et vues dérivées; factorisation partielle. |
| Réservations | Traitement plus directement piloté par les pages et réponse de création limitée. | Helper de création/détail, statut et stockage local temporaire, validation/rebooking; paiement/annulation backend restent incomplets. |
| Composants | Composants ATS et composants de base regroupés dans l'arborescence globale. | Séparation des composants ATS dans `components/costumers/ui` et `components/costumers/ux`, avec chemins mis à jour. |
| UX | Chargement/absence/erreur moins explicitement distingués sur le détail destination. | Skeleton et états distincts `loading`, `success`, `notFound`, `error`, avec retry pour erreur récupérable. |

---

Cette synthèse décrit les changements présents dans le diff de commits entre `develop` (`60975b5`) et `refactor/normalize-and-cleanup` (`6242ab0`), et non les éventuelles modifications locales non commitées de la copie de travail.
