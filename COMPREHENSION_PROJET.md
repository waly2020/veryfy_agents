# Contexte du projet Veryfy Agents

- **Application visée** : interface dédiée aux agents Veryfy, complémentaire de l'API backend Laravel décrite dans `COMPREHENSION.md`.
- **Objectif principal** : offrir aux agents un outil pour enrôler des entreprises et des clients, consulter et gérer leurs interventions, et enrichir les dossiers terrain (documents, commentaires, photos).
- **Stack existante** : base front configurée avec PWA, Tailwind CSS et gestion d'environnements.
- **Références backend** : documentation détaillée des 114 endpoints disponible dans `API.md` à la racine du projet.
- **Orientation UX** : conception mobile-first, priorisation des formats mobile et tablette.
- **Phase actuelle** : réalisation des interfaces statiques (sans intégration API) en s'appuyant sur `API.md` pour la structure et les formats de données.

# Avancement récent

- Layout principal avec bottom bar fonctionnelle (accueil, interventions, clients, entreprises, profil) et état actif visible.
- Layout secondaire `PlainLayout` utilisé pour les pages de second niveau (`auth/login`, `interventions/:id`).
- Pages statiques terminées :
  - **Login agent** : formulaire mobile-first avec rappel des endpoints `POST /api/auth/agents/login` et toggle du mot de passe.
  - **Détail d'une tâche** : vue complète alignée sur `GET /api/taches/{id}` (checklists, équipe, documents, commentaires, timeline).
  - **Profil agent** : bouton de déconnexion redirigeant vers `/auth/login` et rappel de `POST /api/auth/agents/logout`.
- Manifest PWA ajusté (start_url/scope absolus, icônes accessibles) et palette Veryfy exposée via variables CSS globales.
- 14/11/2025 : correction du template `tache-detail` (échappement des accolades `{}` dans le texte explicatif) pour lever l'erreur NG5002 lors du build.
- 14/11/2025 : amélioration de la page `tache-detail` (checklists cochables, bloc d’upload de documents visible, formulaire de commentaires simplifié).
- 14/11/2025 : configuration des environnements Angular vers l’API `https://veryfy.fr/api`, ajout du `AuthService` (login, stockage token/agent), mise en place de l’`authGuard` et protection des routes principales + intégration du flux de connexion sur la page `auth/login`.
- 14/11/2025 : intégration du bouton de déconnexion (appel POST `/auth/agents/logout` via `AuthService`) et ajout d’un interceptor HTTP injectant automatiquement le header `Authorization: Bearer {token}` sur chaque requête front.
- 14/11/2025 : la page `interventions` consomme `GET /api/taches/agent/{id}` via `InterventionsService`, affichant dynamiquement les missions assignées, les compteurs par statut et les états de chargement/erreur.
- 14/11/2025 : la page d’accueil lit désormais les informations de l’agent connecté via `AuthService` (nom, poste, email, téléphone, spécialités, zones) afin d’afficher l’identité réelle en tête d’écran.
- 15/11/2025 : mise à jour de la page `home` pour exploiter `GET /api/agents/{id}/statistics` (cartes de métriques, répartition des tâches, gestion des états de chargement/erreur).
- 15/11/2025 : la page `interventions` affiche les mêmes statistiques de tâches (API `GET /api/agents/{id}/statistics`) en complément de la liste dynamique d’interventions.
- 15/11/2025 : la page `tache-detail` charge maintenant les données réelles via `GET /api/taches/{id}` (`TachesService`), affiche les états de chargement/erreur, trace chaque réponse dans la console, synchronise les checklists en temps réel (`PATCH /api/checklists/{id}/complete|incomplete`) et permet l’upload de documents via `POST /api/taches/{id}/documents`.
- 15/11/2025 : ajout de l’envoi des commentaires depuis `tache-detail` (`POST /api/commentaires/tache/{id}`) avec prise en compte des agents connectés (commentable_type `App\\Models\\Agent`), feedback UI et rechargement de la conversation.

# Compréhension actuelle

- Les agents Veryfy sont des employés internes qui interviennent sur le terrain et supervisent les chantiers des entreprises clientes.
- L'application devra exposer :
  - l'enrôlement d'entreprises et de clients (création et suivi des profils),
  - la consultation des tâches/interventions assignées aux agents,
  - la possibilité de mettre à jour une tâche (ajout de documents, commentaires, prises de photos).
- Les prises de photos devront être intégrées dans le flux d'ajout de documents/rapports pour chaque intervention.
- La structure de données, les processus métier et les endpoints sont déjà disponibles côté backend (`COMPREHENSION.md` et `API.md`), ce qui servira de référence pour l'intégration front.

# Charte graphique (logos fournis)

- **Palette de base** (extrait des logos) :
  - Bleu nuit Veryfy ≈ `#0B1F3A`
  - Rouge validation ≈ `#C7182A`
  - Blanc cassé ≈ `#F7F4EF`
  - Bleu profond de contraste ≈ `#07101E`
- **Principes** :
  - Utiliser le bleu nuit comme couleur principale pour les éléments UI majeurs et la typographie sur fond clair.
  - Réserver le rouge aux actions de validation, accents et éléments interactifs clés (boutons primaires, badges).
  - Prévoir des variantes sombre/clair pour s'aligner sur les deux versions du logo (fond clair ou foncé).
  - Respecter la baseline « CRÉER LA CONFIANCE PARTOUT » dans les supports et écrans d’accueil.

# Structure projet frontend

- **Services** : appel des endpoints API, logique métier côté client et gestion des états distants.
- **Models** : interfaces/classes spécifiques aux entités (entreprises, clients, tâches, documents, etc.).
- **Components/items** : éléments UI réutilisables (boutons, modals, cartes, inputs, etc.).
- **Components/pages** : composants conteneurs pour chaque écran/page, avec leur dossier dédié.
- **Utils** : fonctions utilitaires partagées et un fichier central pour les types TypeScript globaux.
- **Génération Angular** : privilégier les commandes Angular CLI pour créer composants, services, modules et autres artefacts lorsqu'ils sont disponibles.

# Layouts et navigation

- **Layout avec bottom bar** : destiné aux pages de premier niveau (navigation principale mobile/tablette). Contiendra la barre de navigation inférieure.
- **Layout sans bottom bar** : utilisé pour les écrans de second niveau (login, détails, vues contextuelles). Offre plus d'espace pour le contenu.
- La navigation adaptera ces deux layouts selon la hiérarchie des pages pour garantir une expérience fluide mobile-first.

# Prochaines clarifications attendues

- Exemple de flux de capture photo/documents pour bien cadrer l'UI/UX.
- Maquettes à venir pour guider la structure des écrans.
- Détails supplémentaires sur la gestion hors-ligne/PWA (si besoin de synchronisation différée).
