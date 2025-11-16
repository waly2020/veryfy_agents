# COMPRÉHENSION DU PROJET VERYFY

## Vue d'ensemble
VERYFY est une plateforme de vérification et certification des acteurs économiques fiables (Version 2). C'est un système qui crée un réseau numérique de confiance pour renforcer la fiabilité des prestations sur le marché.

## Architecture du système

### Acteurs principaux

#### 1. **AGENTS VERYFY** (Employés de Veryfy)
- **Rôle** : Employés de la plateforme Veryfy
- **Fonctions** :
  - Enrôler des entreprises et des clients pour Veryfy
  - Fournir du support aux entreprises et clients
  - Intervenir sur des chantiers si nécessaire
  - Superviser les interventions
- **Caractéristiques** :
  - Ont leurs propres documents et profils
  - Peuvent être notés par les clients
  - Ont des spécialités et zones d'intervention
  - Gèrent les demandes d'aide

#### 2. **ENTREPRISES** (Prestataires de services)
- **Rôle** : Entreprises clientes de Veryfy qui proposent des services
- **Fonctions** :
  - Créer des profils avec documents légaux (RCCM, NIF)
  - Proposer des services (nettoyage, jardinage, plomberie, etc.)
  - Gérer leurs employés
  - Créer et gérer des tâches/chantiers
  - Recevoir des évaluations clients
- **Caractéristiques** :
  - Doivent être vérifiées par Veryfy
  - Ont des badges de fiabilité
  - Peuvent demander l'aide d'agents Veryfy
  - Gèrent leurs employés internes

#### 3. **CLIENTS** (Utilisateurs finaux)
- **Rôle** : Particuliers ou entreprises qui demandent des services
- **Fonctions** :
  - Rechercher des prestataires vérifiés
  - Demander des devis
  - Noter et commenter les prestations
  - Signaler des problèmes
  - Payer des abonnements
- **Caractéristiques** :
  - Peuvent être des particuliers ou des entreprises
  - Ont un historique des prestations
  - Peuvent demander l'aide d'agents Veryfy

#### 4. **EMPLOYERS** (Employés des entreprises)
- **Rôle** : Employés des entreprises clientes de Veryfy
- **Fonctions** :
  - Intervenir sur les chantiers de leur entreprise
  - Envoyer des rapports d'intervention
  - Être évalués par leur entreprise
- **Caractéristiques** :
  - Appartiennent à une entreprise spécifique
  - Travaillent sur les tâches de leur entreprise
  - Peuvent être affectés à plusieurs tâches

## Flux d'activité

### 1. **Processus d'enrôlement**
1. Les **agents Veryfy** enrôlent des entreprises et des clients
   - Un agent peut enrôler **0 ou plusieurs entreprises**
   - Un agent peut enrôler **0 ou plusieurs clients**
   - Une entreprise ne peut être enrôlée que par **un seul agent**
   - Un client ne peut être enrôlé que par **un seul agent**
2. Les entreprises créent leurs profils avec documents légaux
3. Veryfy vérifie les documents et attribue des badges de fiabilité
4. La date d'enrôlement est enregistrée pour le suivi

### 2. **Processus de prestation**
1. Les **clients** recherchent des entreprises vérifiées
2. Les **entreprises** créent des tâches/chantiers
3. Les **employers** (employés des entreprises) interviennent
4. Les **agents Veryfy** peuvent superviser ou intervenir si demandé
5. Les **clients** notent et commentent les prestations

### 3. **Processus de demande d'aide et paiement**
1. **Entreprises** ou **clients** demandent l'aide d'**agents Veryfy**
2. Les demandes sont enregistrées dans la table `demandes` (statut: en_attente)
3. **Admin Veryfy** examine la demande et affecte un **agent** à la demande
4. L'**agent** fixe un **prix** pour la demande
5. Le **client/entreprise** paie la demande (création d'un paiement)
6. Le statut de la demande passe à **payee**
7. L'**agent** intervient et traite la demande

### 4. **Processus de paiement de service**
1. **Client** consulte les services d'une **entreprise**
2. **Client** choisit un service et paie directement
3. **Paiement** enregistré avec lien vers le service
4. **Entreprise** peut créer une tâche pour le service payé

## Structure de la base de données

### Tables principales
- **entreprises** : Profils des entreprises avec vérification
- **clients** : Profils des clients (particuliers/entreprises)
- **agents** : Agents Veryfy avec spécialités
- **employers** : Employés des entreprises
- **taches** : Tâches/chantiers/interventions
- **documents** : Table universelle pour tous les fichiers
- **notes** : Système de notation
- **commentaires** : Commentaires sur les prestations
- **checklists** : Listes de contrôle pour les tâches
- **paiements** : Transactions financières
- **demandes** : Demandes d'aide aux agents Veryfy
- **services** : Services proposés par les entreprises

### Relations clés
- **Documents** : Relation polymorphique avec entreprises, agents, tâches, clients
- **Notes** : Relation polymorphique avec entreprises et agents
- **Commentaires** : Relation polymorphique avec entreprises, agents, employers
- **Tâches ↔ Employés** : Relation many-to-many (table pivot)
- **Tâches ↔ Agents** : Relation many-to-many (table pivot)
- **Agents ↔ Entreprises** : Relation 1:n (un agent peut enrôler plusieurs entreprises)
- **Agents ↔ Clients** : Relation 1:n (un agent peut enrôler plusieurs clients)
- **Demandes ↔ Paiements** : Relation 1:1 (une demande ne peut être payée qu'une seule fois)
- **Services ↔ Paiements** : Relation 1:n (un service peut être payé plusieurs fois par différents clients)

## Architecture des applications

### **Ce projet = API Backend**
Ce projet Laravel est l'**API backend** qui va alimenter toutes les applications frontend de l'écosystème VERYFY.

### **Applications frontend existantes/à développer :**

#### 1. **Landing Page** ✅ (Existe déjà)
- Présentation des services Veryfy
- Inscription des clients et entreprises
- **Consomme l'API** : Endpoints d'inscription, présentation des services

#### 2. **Interface Client** ✅ (Existe déjà)
- Recherche d'entreprises vérifiées
- Demande de devis
- Suivi des chantiers
- Notation des prestations
- Signalement de problèmes
- **Consomme l'API** : Endpoints clients, recherche, notation, paiements

#### 3. **Application Mobile Client** ✅ (Existe déjà)
- Version mobile de l'interface client
- **Consomme l'API** : Mêmes endpoints que l'interface web client

#### 4. **Interface Entreprise** 🔄 (À développer)
- Création et gestion des employés
- Création de chantiers
- Affectation d'employés aux tâches
- Évaluation interne des employés
- Configuration des formulaires de rapports
- **Consommera l'API** : Endpoints entreprises, gestion employés, tâches

#### 5. **App Agents** 🔄 (À développer)
- Intervention sur les chantiers
- Envoi de rapports
- Réception de notifications
- **Consommera l'API** : Endpoints agents, tâches, rapports

#### 6. **Veryfy Admin** 🔄 (À développer)
- Gestion des entreprises, clients, agents
- Vérification des documents
- Attribution des badges de fiabilité
- Modération des avis et réclamations
- **Consommera l'API** : Endpoints admin, modération, vérification

## Architecture API Backend

### **Rôle de ce projet Laravel**
- **API REST** pour toutes les applications frontend
- **Authentification** et autorisation
- **Gestion des données** centralisée
- **Logique métier** partagée
- **Sécurité** et validation des données

### **Endpoints API développés :**

#### **Authentification (20 endpoints)**
- **Entreprises** : register, login, logout, profile
- **Agents** : register, login, logout, profile  
- **Clients** : register, login, logout, profile
- **Administrateurs** : register, login, logout, profile, updateProfile, changePassword

#### **Gestion des entités (94 endpoints)**
- **Entreprises** (6) : CRUD + verify + documents
- **Employés** (6) : CRUD + getByEntreprise
- **Agents Veryfy** (5) : CRUD
- **Clients** (5) : CRUD
- **Services** (6) : CRUD + getByEntreprise + documents
- **Tâches** (11) : CRUD + assignEmployers + assignAgents + getByEntreprise + getByClient + documents
- **Checklists** (9) : CRUD + getByTache + complete + incomplete + reorder
- **Demandes** (10) : CRUD + assignAgent + complete + getByClient + getByEntreprise + getByAgent
- **Paiements** (12) : CRUD + paid + failed + refund + getByClient + getByEntreprise + getByDemande + getByService
- **Commentaires** (8) : CRUD + getByTache + getByEntreprise + addToTache + addToEntreprise
- **Notes** (10) : CRUD + getByClient + getByEntreprise + getByAgent + rateEntreprise + rateAgent
- **Administrateurs** (8) : CRUD + changePassword + updatePermissions + reactivate

#### **Total : 114 endpoints API complets**

## Fonctionnalités clés

### Système de vérification
- **Vérification des entreprises** (pas des documents individuels)
- Les documents sont des **pièces justificatives** pour la vérification
- Attribution de badges de fiabilité aux entreprises
- Statuts de vérification des entreprises (en attente, validé, refusé)

### Système de notation
- Notes sur 5 avec critères (ponctualité, qualité, communication)
- Commentaires clients
- Historique des évaluations
- Calcul de moyennes

### Gestion des tâches
- Création de chantiers avec détails
- Affectation d'employés et d'agents
- Suivi des statuts
- Rapports d'intervention avec photos
- Checklists de contrôle

### Système de paiement
- **Paiements de demandes d'agents** (relation 1:1 avec les demandes)
- **Paiements de services** (relation 1:n avec les services)
- Paiements d'abonnements
- Paiements de prestations
- Suivi des transactions
- Méthodes de paiement multiples
- **Une demande ne peut être payée qu'une seule fois**
- **Un service peut être payé plusieurs fois par différents clients**

## Architecture technique

### **Gestion des migrations**
- **Problème résolu** : Références circulaires entre tables
- **Solution** : Création des tables d'abord, puis ajout des contraintes de clés étrangères dans une migration séparée
- **Migration spéciale** : `add_foreign_keys_constraints` pour gérer toutes les relations après création des tables

### **Structure des modèles**
- **Champs fillable** : Tous les modèles ont leurs champs fillable configurés
- **Relations Eloquent** : Toutes les relations sont définies dans les modèles
- **Casts** : Types de données appropriés (JSON, boolean, decimal, datetime)
- **Relations polymorphiques** : Documents, Notes, Commentaires

### **État actuel du projet**
- ✅ **Base de données** : 12 tables créées avec succès
- ✅ **Migrations** : Toutes les migrations exécutées sans erreur
- ✅ **Modèles** : 12 modèles configurés avec relations et fillable
- ✅ **Relations** : Toutes les relations (1:1, 1:n, n:n, polymorphiques) fonctionnelles
- ✅ **Contraintes** : Toutes les clés étrangères et contraintes d'intégrité en place
- ✅ **API Backend** : 114 endpoints développés et documentés
- ✅ **Authentification** : Système complet pour tous les types d'utilisateurs
- ✅ **Documentation** : API.md complet avec tous les endpoints
- 🔄 **Prochaines étapes** : Tests, déploiement et développement des applications frontend

## Points importants à retenir

1. **Les agents Veryfy ne sont PAS des employés des entreprises** - ce sont des employés de Veryfy
2. **Les employers sont les employés des entreprises clientes** de Veryfy
3. **La table documents est universelle** - elle stocke tous les fichiers (entreprises, agents, tâches, clients, services)
4. **Les relations polymorphiques** permettent la flexibilité pour les documents, notes et commentaires
5. **Le système de vérification** porte sur les **entreprises** (pas les documents), les documents sont des pièces justificatives
6. **Les demandes** permettent aux entreprises et clients de solliciter l'aide d'agents Veryfy
7. **Le système de notation** est bidirectionnel (clients notent entreprises/agents, entreprises notent employés)
8. **Gestion des références circulaires** : Les contraintes de clés étrangères sont ajoutées après création de toutes les tables
9. **Base de données fonctionnelle** : 12 tables créées avec succès et toutes les relations configurées
10. **API Backend complète** : 114 endpoints développés avec authentification Laravel Sanctum
11. **Architecture RESTful** : Tous les endpoints suivent les conventions REST
12. **Documentation complète** : API.md avec tous les endpoints documentés
13. **Authentification multi-types** : Système d'auth séparé pour entreprises, agents, clients et admins
14. **Gestion des fichiers** : Upload de documents avec détection automatique du type
15. **Relations complexes** : Gestion des relations many-to-many avec tables pivot

Cette architecture permet de créer un écosystème de confiance où tous les acteurs peuvent interagir de manière sécurisée et traçable. L'API backend est maintenant prête pour alimenter toutes les applications frontend de l'écosystème VERYFY.
