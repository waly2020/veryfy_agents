# Documentation API Veryfy

## Base URL
```
http://localhost:8000/api
```

## Authentification

L'API utilise Laravel Sanctum pour l'authentification. Chaque type d'utilisateur (Entreprise, Agent, Client) a ses propres endpoints d'authentification.

### Types d'authentification disponibles :
- **Entreprises** : Interface pour les entreprises inscrites
- **Agents Veryfy** : Interface pour les agents de Veryfy
- **Clients** : Interface pour les clients particuliers/entreprises

### Utilisation des tokens
Après connexion, un token d'accès est généré. Ce token doit être inclus dans l'en-tête `Authorization` des requêtes protégées :

```
Authorization: Bearer {token}
```

Les endpoints nécessitant une authentification utilisent le middleware `auth:sanctum`.

---

## Authentification

### Entreprises

#### 1. Inscription d'une entreprise

**Endpoint :** `POST /api/auth/entreprises/register`

**Description :** Permet à une entreprise de s'inscrire sur la plateforme avec upload de documents obligatoires.

**Content-Type :** `multipart/form-data`

##### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `nom` | string | ✅ | Nom de l'entreprise (max 255 caractères) |
| `email` | email | ✅ | Email unique de l'entreprise (max 255 caractères) |
| `password` | string | ✅ | Mot de passe (min 8 caractères) |
| `password_confirmation` | string | ✅ | Confirmation du mot de passe |
| `telephone` | string | ❌ | Numéro de téléphone (max 20 caractères) |
| `adresse` | string | ❌ | Adresse de l'entreprise (max 255 caractères) |
| `ville` | string | ❌ | Ville de l'entreprise (max 100 caractères) |
| `secteur_activite` | string | ❌ | Secteur d'activité (max 100 caractères) |
| `rccm` | string | ❌ | Numéro RCCM (max 50 caractères) |
| `nif` | string | ❌ | Numéro NIF (max 50 caractères) |
| `description` | text | ❌ | Description de l'entreprise |
| `site_web` | url | ❌ | Site web de l'entreprise (max 255 caractères) |
| `zones_geographiques` | array | ❌ | Zones géographiques couvertes |
| `agent_id` | integer | ❌ | ID de l'agent ayant enrôlé l'entreprise (si applicable) |
| `documents` | array | ✅ | Fichiers documents (min 1, max 10MB chacun) |
| `documents.*` | file | ✅ | Types autorisés: PDF, JPG, JPEG, PNG, DOC, DOCX |
| `document_types` | array | ❌ | Types de documents (détection automatique si non fourni) |
| `document_types.*` | string | ❌ | Types: rccm, nif, certificat, attestation, logo, etc. |

##### Exemple de requête

```bash
curl -X POST http://localhost:8000/api/auth/entreprises/register \
  -F "nom=Mon Entreprise SARL" \
  -F "email=contact@monentreprise.com" \
  -F "password=motdepasse123" \
  -F "password_confirmation=motdepasse123" \
  -F "telephone=+225 07 12 34 56 78" \
  -F "adresse=123 Avenue de la Paix" \
  -F "ville=Abidjan" \
  -F "secteur_activite=Nettoyage" \
  -F "rccm=CI-ABJ-2023-B-12345" \
  -F "nif=M123456789012345" \
  -F "description=Entreprise spécialisée dans le nettoyage" \
  -F "site_web=https://monentreprise.com" \
  -F "zones_geographiques[]=Abidjan" \
  -F "zones_geographiques[]=Yamoussoukro" \
  -F "agent_id=5" \
  -F "documents[]=@/path/to/rccm.pdf" \
  -F "documents[]=@/path/to/nif.pdf" \
  -F "documents[]=@/path/to/certificat.pdf" \
  -F "document_types[]=rccm" \
  -F "document_types[]=nif" \
  -F "document_types[]=certificat"
```

##### Réponse

```json
{
  "success": true,
  "message": "Entreprise inscrite avec succès",
  "data": {
    "entreprise": {
      "id": 1,
      "nom": "Mon Entreprise SARL",
      "email": "contact@monentreprise.com",
      "agent_id": 5,
      "verifie": false,
      "actif": true,
      "date_enrollement": "2023-09-21T12:00:00.000000Z",
      "documents": [
        {
          "id": 1,
          "type_document": "rccm",
          "chemin_fichier": "documents/entreprises/1/1234567890_rccm.pdf",
          "extension": "pdf",
          "taille_fichier": 245760,
          "description": "Document uploadé lors de l'inscription"
        },
        {
          "id": 2,
          "type_document": "nif",
          "chemin_fichier": "documents/entreprises/1/1234567891_nif.pdf",
          "extension": "pdf",
          "taille_fichier": 189440,
          "description": "Document uploadé lors de l'inscription"
        },
        {
          "id": 3,
          "type_document": "certificat",
          "chemin_fichier": "documents/entreprises/1/1234567892_certificat.pdf",
          "extension": "pdf",
          "taille_fichier": 321024,
          "description": "Document uploadé lors de l'inscription"
        }
      ]
    },
    "token": "1|abcdef123456789..."
  }
}
```

#### 2. Connexion d'une entreprise

**Endpoint :** `POST /api/auth/entreprises/login`

**Description :** Permet à une entreprise de se connecter.

##### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `email` | email | ✅ | Email de l'entreprise |
| `password` | string | ✅ | Mot de passe |

##### Exemple de requête

```bash
curl -X POST http://localhost:8000/api/auth/entreprises/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "contact@monentreprise.com",
    "password": "motdepasse123"
  }'
```

##### Réponse

```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "entreprise": {
      "id": 1,
      "nom": "Mon Entreprise SARL",
      "email": "contact@monentreprise.com",
      "verifie": false,
      "actif": true
    },
    "token": "1|abcdef123456789..."
  }
}
```

#### 3. Profil de l'entreprise connectée

**Endpoint :** `GET /api/auth/entreprises/profile`

**Description :** Récupère le profil de l'entreprise connectée.

**Authentification :** Requise

##### Exemple de requête

```bash
curl -X GET http://localhost:8000/api/auth/entreprises/profile \
  -H "Authorization: Bearer 1|abcdef123456789..."
```

##### Réponse

```json
{
  "success": true,
  "data": {
    "id": 1,
    "nom": "Mon Entreprise SARL",
    "email": "contact@monentreprise.com",
    "agent": null,
    "services": [...],
    "employers": [...]
  }
}
```

#### 4. Déconnexion d'une entreprise

**Endpoint :** `POST /api/auth/entreprises/logout`

**Description :** Déconnecte l'entreprise et invalide le token.

**Authentification :** Requise

##### Exemple de requête

```bash
curl -X POST http://localhost:8000/api/auth/entreprises/logout \
  -H "Authorization: Bearer 1|abcdef123456789..."
```

##### Réponse

```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

---

### Agents Veryfy

#### 1. Inscription d'un agent

**Endpoint :** `POST /api/auth/agents/register`

**Description :** Permet à un agent Veryfy de s'inscrire.

##### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `nom` | string | ✅ | Nom de l'agent (max 255 caractères) |
| `prenom` | string | ✅ | Prénom de l'agent (max 255 caractères) |
| `email` | email | ✅ | Email unique de l'agent (max 255 caractères) |
| `password` | string | ✅ | Mot de passe (min 8 caractères) |
| `password_confirmation` | string | ✅ | Confirmation du mot de passe |
| `telephone` | string | ❌ | Numéro de téléphone (max 20 caractères) |
| `adresse` | string | ❌ | Adresse de l'agent (max 255 caractères) |
| `ville` | string | ❌ | Ville de l'agent (max 100 caractères) |
| `poste` | string | ✅ | Poste de l'agent (max 100 caractères) |
| `specialites` | array | ❌ | Spécialités de l'agent |
| `zones_geographiques` | array | ❌ | Zones géographiques couvertes |

##### Exemple de requête

```bash
curl -X POST http://localhost:8000/api/auth/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Martin",
    "prenom": "Pierre",
    "email": "pierre.martin@veryfy.com",
    "password": "motdepasse123",
    "password_confirmation": "motdepasse123",
    "telephone": "+225 07 12 34 56 78",
    "adresse": "456 Rue de la République",
    "ville": "Abidjan",
    "poste": "Agent commercial",
    "specialites": ["Enrôlement", "Formation", "Suivi"],
    "zones_geographiques": ["Abidjan", "Yamoussoukro", "Bouaké"]
  }'
```

#### 2. Connexion d'un agent

**Endpoint :** `POST /api/auth/agents/login`

**Description :** Permet à un agent de se connecter.

##### Exemple de requête

```bash
curl -X POST http://localhost:8000/api/auth/agents/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pierre.martin@veryfy.com",
    "password": "motdepasse123"
  }'
```

#### 3. Profil de l'agent connecté

**Endpoint :** `GET /api/auth/agents/profile`

**Description :** Récupère le profil de l'agent connecté.

**Authentification :** Requise

#### 4. Déconnexion d'un agent

**Endpoint :** `POST /api/auth/agents/logout`

**Description :** Déconnecte l'agent et invalide le token.

**Authentification :** Requise

---

### Clients

#### 1. Inscription d'un client

**Endpoint :** `POST /api/auth/clients/register`

**Description :** Permet à un client de s'inscrire.

##### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `nom` | string | ✅ | Nom du client (max 255 caractères) |
| `prenom` | string | ✅ | Prénom du client (max 255 caractères) |
| `email` | email | ✅ | Email unique du client (max 255 caractères) |
| `password` | string | ✅ | Mot de passe (min 8 caractères) |
| `password_confirmation` | string | ✅ | Confirmation du mot de passe |
| `telephone` | string | ❌ | Numéro de téléphone (max 20 caractères) |
| `adresse` | string | ❌ | Adresse du client (max 255 caractères) |
| `ville` | string | ❌ | Ville du client (max 100 caractères) |
| `date_naissance` | date | ❌ | Date de naissance du client |
| `type` | string | ✅ | Type de client (particulier ou entreprise) |
| `agent_id` | integer | ❌ | ID de l'agent qui a enrôlé le client |

##### Exemple de requête

```bash
curl -X POST http://localhost:8000/api/auth/clients/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Marie",
    "email": "marie.dupont@email.com",
    "password": "motdepasse123",
    "password_confirmation": "motdepasse123",
    "telephone": "+225 07 12 34 56 78",
    "adresse": "789 Avenue des Cocotiers",
    "ville": "Abidjan",
    "date_naissance": "1990-05-15",
    "type": "particulier",
    "agent_id": 1
  }'
```

#### 2. Connexion d'un client

**Endpoint :** `POST /api/auth/clients/login`

**Description :** Permet à un client de se connecter.

##### Exemple de requête

```bash
curl -X POST http://localhost:8000/api/auth/clients/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "marie.dupont@email.com",
    "password": "motdepasse123"
  }'
```

#### 3. Profil du client connecté

**Endpoint :** `GET /api/auth/clients/profile`

**Description :** Récupère le profil du client connecté.

**Authentification :** Requise

#### 4. Déconnexion d'un client

**Endpoint :** `POST /api/auth/clients/logout`

**Description :** Déconnecte le client et invalide le token.

**Authentification :** Requise

---

## Entreprises

> **Note importante :** La création d'entreprises se fait via l'authentification : `POST /api/auth/entreprises/register`

### 1. Lister les entreprises

**Endpoint :** `GET /api/entreprises`

**Description :** Récupère la liste paginée des entreprises actives.

#### Paramètres de requête

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `page` | integer | ❌ | Numéro de page (défaut: 1) |
| `per_page` | integer | ❌ | Nombre d'éléments par page (défaut: 15) |

#### Exemple de requête

```bash
curl -X GET "http://localhost:8000/api/entreprises?page=1&per_page=10"
```

#### Réponse

##### ✅ Succès (200 OK)

```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "agent_id": null,
        "nom": "Mon Entreprise SARL",
        "email": "contact@monentreprise.com",
        "telephone": "+225 07 12 34 56 78",
        "adresse": "123 Avenue de la Paix",
        "ville": "Abidjan",
        "secteur_activite": "Nettoyage",
        "rccm": "CI-ABJ-2023-B-12345",
        "nif": "M123456789012345",
        "description": "Entreprise spécialisée dans le nettoyage",
        "logo": null,
        "site_web": null,
        "zones_geographiques": ["Abidjan", "Yamoussoukro"],
        "verifie": false,
        "actif": true,
        "badge_fiabilite": null,
        "date_verification": null,
        "date_enrollement": "2023-09-21T12:00:00.000000Z",
        "created_at": "2023-09-21T12:00:00.000000Z",
        "updated_at": "2023-09-21T12:00:00.000000Z",
        "agent": null,
        "services": []
      }
    ],
    "first_page_url": "http://localhost:8000/api/entreprises?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "http://localhost:8000/api/entreprises?page=1",
    "links": [...],
    "next_page_url": null,
    "path": "http://localhost:8000/api/entreprises",
    "per_page": 15,
    "prev_page_url": null,
    "to": 1,
    "total": 1
  }
}
```

---

### 2. Détails d'une entreprise

**Endpoint :** `GET /api/entreprises/{id}`

**Description :** Récupère les détails complets d'une entreprise.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID de l'entreprise |

#### Exemple de requête

```bash
curl -X GET http://localhost:8000/api/entreprises/1
```

#### Réponse

```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "nom": "Mon Entreprise SARL",
        "email": "contact@monentreprise.com",
        "verifie": false,
        "actif": true,
        "agent": null,
        "services": [],
        "employers": []
      }
    ],
    "first_page_url": "http://localhost:8000/api/entreprises?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "http://localhost:8000/api/entreprises?page=1",
    "links": [...],
    "next_page_url": null,
    "path": "http://localhost:8000/api/entreprises",
    "per_page": 15,
    "prev_page_url": null,
    "to": 1,
    "total": 1
  }
}
```

---

### 3. Détails d'une entreprise

**Endpoint :** `GET /api/entreprises/{id}`

**Description :** Récupère les détails complets d'une entreprise.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID de l'entreprise |

#### Exemple de requête

```bash
curl -X GET http://localhost:8000/api/entreprises/1
```

#### Réponse

```json
{
  "success": true,
  "data": {
    "id": 1,
    "nom": "Mon Entreprise SARL",
    "email": "contact@monentreprise.com",
    "agent": null,
    "services": [],
    "employers": [],
    "taches": [],
    "documents": [...],
    "notes": []
  }
}
```

---

### 4. Modifier une entreprise

**Endpoint :** `PUT /api/entreprises/{id}`

**Description :** Met à jour les informations d'une entreprise.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID de l'entreprise |

#### Body (JSON)

Mêmes paramètres que la création, mais tous optionnels (utiliser `sometimes`).

#### Exemple de requête

```bash
curl -X PUT http://localhost:8000/api/entreprises/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Mon Entreprise SARL - Modifiée",
    "description": "Nouvelle description"
  }'
```

#### Réponse

```json
{
  "success": true,
  "message": "Entreprise mise à jour avec succès",
  "data": {
    "id": 1,
    "nom": "Mon Entreprise SARL - Modifiée",
    "description": "Nouvelle description",
    "agent": null,
    "services": []
  }
}
```

---

### 5. Supprimer une entreprise

**Endpoint :** `DELETE /api/entreprises/{id}`

**Description :** Désactive une entreprise (soft delete).

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID de l'entreprise |

#### Exemple de requête

```bash
curl -X DELETE http://localhost:8000/api/entreprises/1
```

#### Réponse

```json
{
  "success": true,
  "message": "Entreprise désactivée avec succès"
}
```

---

### 6. Vérifier une entreprise

**Endpoint :** `POST /api/entreprises/{id}/verify`

**Description :** Marque une entreprise comme vérifiée (admin seulement).

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID de l'entreprise |

#### Exemple de requête

```bash
curl -X POST http://localhost:8000/api/entreprises/1/verify
```

#### Réponse

```json
{
  "success": true,
  "message": "Entreprise vérifiée avec succès",
  "data": {
    "id": 1,
    "nom": "Mon Entreprise SARL",
    "verifie": true,
    "date_verification": "2023-09-21T12:00:00.000000Z",
    "badge_fiabilite": "verified"
  }
}
```

---

### 7. Ajouter des documents à une entreprise

**Endpoint :** `POST /api/entreprises/{id}/documents`

**Description :** Ajoute des documents à une entreprise existante.

**Content-Type :** `multipart/form-data`

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID de l'entreprise |
| `documents` | array | ✅ | Fichiers documents (min 1, max 10MB chacun) |
| `documents.*` | file | ✅ | Types autorisés: PDF, JPG, JPEG, PNG, DOC, DOCX |
| `document_types` | array | ❌ | Types de documents (détection automatique si non fourni) |
| `document_types.*` | string | ❌ | Types: rccm, nif, certificat, attestation, logo, etc. |

#### Exemple de requête

```bash
curl -X POST http://localhost:8000/api/entreprises/1/documents \
  -F "documents[]=@/path/to/nouveau_document.pdf" \
  -F "documents[]=@/path/to/photo_entreprise.jpg" \
  -F "document_types[]=contrat" \
  -F "document_types[]=photo"
```

#### Réponse

```json
{
  "success": true,
  "message": "Documents ajoutés avec succès",
  "data": {
    "id": 1,
    "nom": "Mon Entreprise SARL",
    "email": "contact@monentreprise.com",
    "documents": [
      {
        "id": 4,
        "type_document": "contrat",
        "chemin_fichier": "documents/entreprises/1/1234567893_nouveau_document.pdf",
        "extension": "pdf",
        "taille_fichier": 156789,
        "description": "Document ajouté ultérieurement"
      },
      {
        "id": 5,
        "type_document": "photo",
        "chemin_fichier": "documents/entreprises/1/1234567894_photo_entreprise.jpg",
        "extension": "jpg",
        "taille_fichier": 89234,
        "description": "Document ajouté ultérieurement"
      }
    ]
  }
}
```

---

### 8. Supprimer un document d'une entreprise

**Endpoint :** `DELETE /api/entreprises/{id}/documents/{documentId}`

**Description :** Supprime un document spécifique d'une entreprise.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID de l'entreprise |
| `documentId` | integer | ✅ | ID du document à supprimer |

#### Exemple de requête

```bash
curl -X DELETE http://localhost:8000/api/entreprises/1/documents/4
```

#### Réponse

```json
{
  "success": true,
  "message": "Document supprimé avec succès"
}
```

---

### 9. Récupérer les entreprises d'un agent

**Endpoint :** `GET /api/entreprises/agent/{agentId}`

**Description :** Récupère les entreprises enrôlées par un agent spécifique (paginées).

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `agentId` | integer | ✅ | ID de l'agent |

#### Paramètres de requête

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `page` | integer | ❌ | Numéro de page (défaut: 1) |
| `per_page` | integer | ❌ | Nombre d'éléments par page (défaut: 15) |

#### Exemple de requête

```bash
curl -X GET "http://localhost:8000/api/entreprises/agent/5?page=1&per_page=10"
```

#### Exemple de réponse

```json
{
  "success": true,
  "data": {
    "agent": {
      "id": 5,
      "nom": "Martin",
      "prenom": "Pierre",
      "email": "pierre.martin@veryfy.com"
    },
    "entreprises": {
      "current_page": 1,
      "data": [
        {
          "id": 12,
          "nom": "CleanPro",
          "email": "contact@cleanpro.com",
          "ville": "Abidjan",
          "verifie": true,
          "actif": true
        }
      ],
      "per_page": 15,
      "total": 8
    }
  }
}
```

---

## Codes de statut HTTP

| Code | Description |
|------|-------------|
| 200 | OK - Requête réussie |
| 201 | Created - Ressource créée avec succès |
| 404 | Not Found - Ressource non trouvée |
| 422 | Unprocessable Entity - Erreur de validation |
| 500 | Internal Server Error - Erreur serveur |

---

## Types de documents supportés

| Type | Extensions | Taille max |
|------|------------|------------|
| PDF | .pdf | 10MB |
| Images | .jpg, .jpeg, .png | 10MB |
| Documents | .doc, .docx | 10MB |

---

## Détection automatique du type de document

Le système détecte automatiquement le type de document basé sur le nom du fichier :

- **RCCM** : Si le nom contient "rccm"
- **NIF** : Si le nom contient "nif" ou "numero_identification"
- **Certificat** : Si le nom contient "certificat"
- **Attestation** : Si le nom contient "attestation"
- **Photo** : Si le nom contient "photo" ou "image"
- **Logo** : Si le nom contient "logo"
- **Contrat** : Si le nom contient "contrat"
- **Facture** : Si le nom contient "facture"
- **Garantie** : Si le nom contient "garantie"
- **Assurance** : Si le nom contient "assurance"
- **Autre** : Par défaut

---

## Employés

### 1. Créer un employé

**Endpoint :** `POST /api/employers`

**Description :** Crée un nouvel employé pour une entreprise.

**Content-Type :** `application/json`

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `entreprise_id` | integer | ✅ | ID de l'entreprise (doit exister) |
| `nom` | string | ✅ | Nom de l'employé (max 255 caractères) |
| `prenom` | string | ✅ | Prénom de l'employé (max 255 caractères) |
| `email` | email | ✅ | Email unique de l'employé (max 255 caractères) |
| `telephone` | string | ❌ | Numéro de téléphone (max 20 caractères) |
| `poste` | string | ✅ | Poste de l'employé (max 100 caractères) |
| `specialites` | array | ❌ | Spécialités de l'employé |

#### Exemple de requête

```bash
curl -X POST http://localhost:8000/api/employers \
  -H "Content-Type: application/json" \
  -d '{
    "entreprise_id": 1,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@monentreprise.com",
    "telephone": "+225 07 12 34 56 78",
    "poste": "Chef de projet",
    "specialites": ["Gestion", "Nettoyage", "Supervision"]
  }'
```

#### Réponse

```json
{
  "success": true,
  "message": "Employé créé avec succès",
  "data": {
    "id": 1,
    "entreprise_id": 1,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@monentreprise.com",
    "telephone": "+225 07 12 34 56 78",
    "poste": "Chef de projet",
    "specialites": ["Gestion", "Nettoyage", "Supervision"],
    "actif": true,
    "note_moyenne": null,
    "nombre_evaluations": 0,
    "nombre_taches_completees": 0,
    "created_at": "2023-09-21T12:00:00.000000Z",
    "updated_at": "2023-09-21T12:00:00.000000Z",
    "entreprise": {
      "id": 1,
      "nom": "Mon Entreprise SARL",
      "email": "contact@monentreprise.com"
    }
  }
}
```

---

### 2. Lister les employés

**Endpoint :** `GET /api/employers`

**Description :** Récupère la liste paginée de tous les employés (actifs et inactifs).

> **Note :** Cette API retourne tous les employés pour permettre à l'interface admin de gérer l'ensemble des employés. Les applications frontend peuvent filtrer les employés actifs côté client en utilisant le champ `actif` dans la réponse.

#### Paramètres de requête

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `page` | integer | ❌ | Numéro de page (défaut: 1) |
| `per_page` | integer | ❌ | Nombre d'éléments par page (défaut: 15) |

#### Exemple de requête

```bash
curl -X GET "http://localhost:8000/api/employers?page=1&per_page=10"
```

#### Réponse

```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "entreprise_id": 1,
        "nom": "Dupont",
        "prenom": "Jean",
        "email": "jean.dupont@monentreprise.com",
        "poste": "Chef de projet",
        "actif": true,
        "entreprise": {
          "id": 1,
          "nom": "Mon Entreprise SARL",
          "email": "contact@monentreprise.com"
        }
      }
    ],
    "first_page_url": "http://localhost:8000/api/employers?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "http://localhost:8000/api/employers?page=1",
    "links": [...],
    "next_page_url": null,
    "path": "http://localhost:8000/api/employers",
    "per_page": 15,
    "prev_page_url": null,
    "to": 1,
    "total": 1
  }
}
```

---

### 3. Détails d'un employé

**Endpoint :** `GET /api/employers/{id}`

**Description :** Récupère les détails complets d'un employé.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID de l'employé |

#### Exemple de requête

```bash
curl -X GET http://localhost:8000/api/employers/1
```

#### Réponse

```json
{
  "success": true,
  "data": {
    "id": 1,
    "entreprise_id": 1,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@monentreprise.com",
    "telephone": "+225 07 12 34 56 78",
    "poste": "Chef de projet",
    "specialites": ["Gestion", "Nettoyage", "Supervision"],
    "actif": true,
    "note_moyenne": null,
    "nombre_evaluations": 0,
    "nombre_taches_completees": 0,
    "created_at": "2023-09-21T12:00:00.000000Z",
    "updated_at": "2023-09-21T12:00:00.000000Z",
    "entreprise": {
      "id": 1,
      "nom": "Mon Entreprise SARL",
      "email": "contact@monentreprise.com"
    },
    "taches": [
      {
        "id": 1,
        "titre": "Nettoyage bureau",
        "statut": "en_cours",
        "date_debut": "2023-09-21",
        "date_fin": "2023-09-22"
      }
    ]
  }
}
```

---

### 4. Modifier un employé

**Endpoint :** `PUT /api/employers/{id}`

**Description :** Met à jour les informations d'un employé.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID de l'employé |

#### Body (JSON)

Mêmes paramètres que la création, mais tous optionnels (utiliser `sometimes`).

#### Exemple de requête

```bash
curl -X PUT http://localhost:8000/api/employers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "poste": "Directeur de projet",
    "specialites": ["Gestion", "Nettoyage", "Supervision", "Management"]
  }'
```

#### Réponse

```json
{
  "success": true,
  "message": "Employé mis à jour avec succès",
  "data": {
    "id": 1,
    "nom": "Dupont",
    "prenom": "Jean",
    "poste": "Directeur de projet",
    "specialites": ["Gestion", "Nettoyage", "Supervision", "Management"],
    "entreprise": {
      "id": 1,
      "nom": "Mon Entreprise SARL",
      "email": "contact@monentreprise.com"
    }
  }
}
```

---

### 5. Supprimer un employé

**Endpoint :** `DELETE /api/employers/{id}`

**Description :** Supprime définitivement un employé de la base de données.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID de l'employé |

#### Exemple de requête

```bash
curl -X DELETE http://localhost:8000/api/employers/1
```

#### Réponse

```json
{
  "success": true,
  "message": "Employé supprimé avec succès"
}
```

---

### 6. Désactiver un employé

**Endpoint :** `PATCH /api/employers/{id}/deactivate`

**Description :** Désactive un employé (met le champ actif à false). L'employé reste dans la base de données mais ne sera plus visible dans les listes d'employés actifs.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID de l'employé |

#### Exemple de requête

```bash
curl -X PATCH http://localhost:8000/api/employers/1/deactivate
```

#### Réponse

```json
{
  "success": true,
  "message": "Employé désactivé avec succès",
  "data": {
    "id": 1,
    "entreprise_id": 1,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@monentreprise.com",
    "telephone": "+225 07 12 34 56 78",
    "poste": "Chef de projet",
    "specialites": ["Gestion", "Nettoyage", "Supervision"],
    "actif": false,
    "note_moyenne": null,
    "nombre_evaluations": 0,
    "nombre_taches_completees": 0,
    "created_at": "2023-09-21T12:00:00.000000Z",
    "updated_at": "2023-09-21T12:00:00.000000Z",
    "entreprise": {
      "id": 1,
      "nom": "Mon Entreprise SARL",
      "email": "contact@monentreprise.com"
    }
  }
}
```

---

### 7. Réactiver un employé

**Endpoint :** `PATCH /api/employers/{id}/reactivate`

**Description :** Réactive un employé désactivé (met le champ actif à true).

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID de l'employé |

#### Exemple de requête

```bash
curl -X PATCH http://localhost:8000/api/employers/1/reactivate
```

#### Réponse

```json
{
  "success": true,
  "message": "Employé réactivé avec succès",
  "data": {
    "id": 1,
    "entreprise_id": 1,
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@monentreprise.com",
    "telephone": "+225 07 12 34 56 78",
    "poste": "Chef de projet",
    "specialites": ["Gestion", "Nettoyage", "Supervision"],
    "actif": true,
    "note_moyenne": null,
    "nombre_evaluations": 0,
    "nombre_taches_completees": 0,
    "created_at": "2023-09-21T12:00:00.000000Z",
    "updated_at": "2023-09-21T12:00:00.000000Z",
    "entreprise": {
      "id": 1,
      "nom": "Mon Entreprise SARL",
      "email": "contact@monentreprise.com"
    }
  }
}
```

---

### 8. Récupérer les employés d'une entreprise

**Endpoint :** `GET /api/employers/entreprise/{entrepriseId}`

**Description :** Récupère tous les employés (actifs et inactifs) d'une entreprise spécifique.

> **Note :** Cette API retourne tous les employés de l'entreprise pour permettre à l'interface admin de gérer l'ensemble des employés. Les applications frontend peuvent filtrer les employés actifs côté client.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `entrepriseId` | integer | ✅ | ID de l'entreprise |

#### Paramètres de requête

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `page` | integer | ❌ | Numéro de page (défaut: 1) |
| `per_page` | integer | ❌ | Nombre d'éléments par page (défaut: 15) |

#### Exemple de requête

```bash
curl -X GET "http://localhost:8000/api/employers/entreprise/1?page=1&per_page=10"
```

#### Réponse

```json
{
  "success": true,
  "data": {
    "entreprise": {
      "id": 1,
      "nom": "Mon Entreprise SARL",
      "email": "contact@monentreprise.com"
    },
    "employers": {
      "current_page": 1,
      "data": [
        {
          "id": 1,
          "entreprise_id": 1,
          "nom": "Dupont",
          "prenom": "Jean",
          "email": "jean.dupont@monentreprise.com",
          "telephone": "+225 07 12 34 56 78",
          "poste": "Chef de projet",
          "specialites": ["Gestion", "Nettoyage", "Supervision"],
          "actif": true,
          "note_moyenne": null,
          "nombre_evaluations": 0,
          "nombre_taches_completees": 0,
          "created_at": "2023-09-21T12:00:00.000000Z",
          "updated_at": "2023-09-21T12:00:00.000000Z",
          "taches": [
            {
              "id": 1,
              "titre": "Nettoyage bureau",
              "statut": "en_cours",
              "date_debut": "2023-09-21",
              "date_fin": "2023-09-22"
            }
          ]
        }
      ],
      "first_page_url": "http://localhost:8000/api/employers/entreprise/1?page=1",
      "from": 1,
      "last_page": 1,
      "last_page_url": "http://localhost:8000/api/employers/entreprise/1?page=1",
      "links": [...],
      "next_page_url": null,
      "path": "http://localhost:8000/api/employers/entreprise/1",
      "per_page": 15,
      "prev_page_url": null,
      "to": 1,
      "total": 1
    }
  }
}
```

---

## Agents Veryfy

### 1. Créer un agent

**Endpoint :** `POST /api/agents`

**Description :** Crée un nouvel agent Veryfy.

**Content-Type :** `application/json`

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `nom` | string | ✅ | Nom de l'agent (max 255 caractères) |
| `prenom` | string | ✅ | Prénom de l'agent (max 255 caractères) |
| `email` | email | ✅ | Email unique de l'agent (max 255 caractères) |
| `telephone` | string | ❌ | Numéro de téléphone (max 20 caractères) |
| `adresse` | string | ❌ | Adresse de l'agent (max 255 caractères) |
| `ville` | string | ❌ | Ville de l'agent (max 100 caractères) |
| `poste` | string | ✅ | Poste de l'agent (max 100 caractères) |
| `specialites` | array | ❌ | Spécialités de l'agent |
| `zones_geographiques` | array | ❌ | Zones géographiques couvertes |

#### Exemple de requête

```bash
curl -X POST http://localhost:8000/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Martin",
    "prenom": "Pierre",
    "email": "pierre.martin@veryfy.com",
    "telephone": "+225 07 12 34 56 78",
    "adresse": "456 Rue de la République",
    "ville": "Abidjan",
    "poste": "Agent commercial",
    "specialites": ["Enrôlement", "Formation", "Suivi"],
    "zones_geographiques": ["Abidjan", "Yamoussoukro", "Bouaké"]
  }'
```

#### Réponse

```json
{
  "success": true,
  "message": "Agent créé avec succès",
  "data": {
    "id": 1,
    "nom": "Martin",
    "prenom": "Pierre",
    "email": "pierre.martin@veryfy.com",
    "telephone": "+225 07 12 34 56 78",
    "adresse": "456 Rue de la République",
    "ville": "Abidjan",
    "poste": "Agent commercial",
    "specialites": ["Enrôlement", "Formation", "Suivi"],
    "zones_geographiques": ["Abidjan", "Yamoussoukro", "Bouaké"],
    "actif": true,
    "nombre_enrollements": 0,
    "note_moyenne": null,
    "created_at": "2023-09-21T12:00:00.000000Z",
    "updated_at": "2023-09-21T12:00:00.000000Z"
  }
}
```

---

### 2. Lister les agents

**Endpoint :** `GET /api/agents`

**Description :** Récupère la liste paginée de tous les agents (actifs et inactifs).

> **Note :** Cette API retourne tous les agents pour permettre à l'interface admin de gérer l'ensemble des agents. Les applications frontend peuvent filtrer les agents actifs côté client en utilisant le champ `actif` dans la réponse.

#### Paramètres de requête

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `page` | integer | ❌ | Numéro de page (défaut: 1) |
| `per_page` | integer | ❌ | Nombre d'éléments par page (défaut: 15) |

#### Exemple de requête

```bash
curl -X GET "http://localhost:8000/api/agents?page=1&per_page=10"
```

#### Réponse

```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "nom": "Martin",
        "prenom": "Pierre",
        "email": "pierre.martin@veryfy.com",
        "poste": "Agent commercial",
        "actif": true,
        "nombre_enrollements": 0,
        "note_moyenne": null,
        "entreprises": [
          {
            "id": 1,
            "nom": "Mon Entreprise SARL",
            "email": "contact@monentreprise.com"
          }
        ],
        "clients": [
          {
            "id": 1,
            "nom": "Dupont",
            "prenom": "Jean",
            "email": "jean.dupont@client.com"
          }
        ]
      }
    ],
    "first_page_url": "http://localhost:8000/api/agents?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "http://localhost:8000/api/agents?page=1",
    "links": [...],
    "next_page_url": null,
    "path": "http://localhost:8000/api/agents",
    "per_page": 15,
    "prev_page_url": null,
    "to": 1,
    "total": 1
  }
}
```

---

### 3. Détails d'un agent

**Endpoint :** `GET /api/agents/{id}`

**Description :** Récupère les détails complets d'un agent.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID de l'agent |

#### Exemple de requête

```bash
curl -X GET http://localhost:8000/api/agents/1
```

#### Réponse

```json
{
  "success": true,
  "data": {
    "id": 1,
    "nom": "Martin",
    "prenom": "Pierre",
    "email": "pierre.martin@veryfy.com",
    "telephone": "+225 07 12 34 56 78",
    "adresse": "456 Rue de la République",
    "ville": "Abidjan",
    "poste": "Agent commercial",
    "specialites": ["Enrôlement", "Formation", "Suivi"],
    "zones_geographiques": ["Abidjan", "Yamoussoukro", "Bouaké"],
    "actif": true,
    "nombre_enrollements": 5,
    "note_moyenne": 4.5,
    "created_at": "2023-09-21T12:00:00.000000Z",
    "updated_at": "2023-09-21T12:00:00.000000Z",
    "entreprises": [
      {
        "id": 1,
        "nom": "Mon Entreprise SARL",
        "email": "contact@monentreprise.com",
        "verifie": true
      }
    ],
    "clients": [
      {
        "id": 1,
        "nom": "Dupont",
        "prenom": "Jean",
        "email": "jean.dupont@client.com"
      }
    ],
    "demandes": [
      {
        "id": 1,
        "titre": "Demande de nettoyage",
        "statut": "en_cours",
        "date_affectation_agent": "2023-09-21T12:00:00.000000Z"
      }
    ]
  }
}
```

---

### 4. Statistiques d'un agent

**Endpoint :** `GET /api/agents/{id}/statistics`

**Description :** Retourne les indicateurs clés d'un agent (clients et entreprises enrôlés, tâches par statut, tâches urgentes). Les données proviennent de la vue `agent_statistics_view`.

#### Exemple de réponse

```json
{
  "success": true,
  "data": {
    "agent": {
      "id": 1,
      "nom": "Martin",
      "prenom": "Pierre",
      "email": "pierre.martin@veryfy.com"
    },
    "statistics": {
      "total_clients": 24,
      "total_entreprises": 8,
      "total_taches": 15,
      "taches_en_attente": 3,
      "taches_en_cours": 6,
      "taches_terminees": 4,
      "taches_annulees": 2,
      "taches_urgentes": 5
    }
  }
}
```

---

### 5. Modifier un agent

**Endpoint :** `PUT /api/agents/{id}`

**Description :** Met à jour les informations d'un agent.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID de l'agent |

#### Body (JSON)

Mêmes paramètres que la création, mais tous optionnels (utiliser `sometimes`).

#### Exemple de requête

```bash
curl -X PUT http://localhost:8000/api/agents/1 \
  -H "Content-Type: application/json" \
  -d '{
    "poste": "Superviseur commercial",
    "specialites": ["Enrôlement", "Formation", "Suivi", "Management"],
    "zones_geographiques": ["Abidjan", "Yamoussoukro", "Bouaké", "San-Pédro"]
  }'
```

#### Réponse

```json
{
  "success": true,
  "message": "Agent mis à jour avec succès",
  "data": {
    "id": 1,
    "nom": "Martin",
    "prenom": "Pierre",
    "poste": "Superviseur commercial",
    "specialites": ["Enrôlement", "Formation", "Suivi", "Management"],
    "zones_geographiques": ["Abidjan", "Yamoussoukro", "Bouaké", "San-Pédro"]
  }
}
```

---

### 6. Supprimer un agent

**Endpoint :** `DELETE /api/agents/{id}`

**Description :** Supprime définitivement un agent de la base de données.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID de l'agent |

#### Exemple de requête

```bash
curl -X DELETE http://localhost:8000/api/agents/1
```

#### Réponse

```json
{
  "success": true,
  "message": "Agent supprimé avec succès"
}
```

---

### 7. Désactiver un agent

**Endpoint :** `PATCH /api/agents/{id}/deactivate`

**Description :** Désactive un agent (met le champ actif à false). L'agent reste dans la base de données mais ne sera plus visible dans les listes d'agents actifs.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID de l'agent |

#### Exemple de requête

```bash
curl -X PATCH http://localhost:8000/api/agents/1/deactivate
```

#### Réponse

```json
{
  "success": true,
  "message": "Agent désactivé avec succès",
  "data": {
    "id": 1,
    "nom": "Martin",
    "prenom": "Pierre",
    "email": "pierre.martin@veryfy.com",
    "telephone": "+225 07 12 34 56 78",
    "adresse": "456 Rue de la République",
    "ville": "Abidjan",
    "poste": "Agent commercial",
    "specialites": ["Enrôlement", "Formation", "Suivi"],
    "zones_geographiques": ["Abidjan", "Yamoussoukro", "Bouaké"],
    "actif": false,
    "nombre_enrollements": 5,
    "note_moyenne": 4.5,
    "created_at": "2023-09-21T12:00:00.000000Z",
    "updated_at": "2023-09-21T12:00:00.000000Z"
  }
}
```

---

### 8. Réactiver un agent

**Endpoint :** `PATCH /api/agents/{id}/reactivate`

**Description :** Réactive un agent désactivé (met le champ actif à true).

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID de l'agent |

#### Exemple de requête

```bash
curl -X PATCH http://localhost:8000/api/agents/1/reactivate
```

#### Réponse

```json
{
  "success": true,
  "message": "Agent réactivé avec succès",
  "data": {
    "id": 1,
    "nom": "Martin",
    "prenom": "Pierre",
    "email": "pierre.martin@veryfy.com",
    "telephone": "+225 07 12 34 56 78",
    "adresse": "456 Rue de la République",
    "ville": "Abidjan",
    "poste": "Agent commercial",
    "specialites": ["Enrôlement", "Formation", "Suivi"],
    "zones_geographiques": ["Abidjan", "Yamoussoukro", "Bouaké"],
    "actif": true,
    "nombre_enrollements": 5,
    "note_moyenne": 4.5,
    "created_at": "2023-09-21T12:00:00.000000Z",
    "updated_at": "2023-09-21T12:00:00.000000Z"
  }
}
```

---

## Clients

### 1. Créer un client

**Endpoint :** `POST /api/clients`

**Description :** Crée un nouveau client.

**Content-Type :** `application/json`

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `nom` | string | ✅ | Nom du client (max 255 caractères) |
| `prenom` | string | ✅ | Prénom du client (max 255 caractères) |
| `email` | email | ✅ | Email unique du client (max 255 caractères) |
| `telephone` | string | ❌ | Numéro de téléphone (max 20 caractères) |
| `adresse` | string | ❌ | Adresse du client (max 255 caractères) |
| `ville` | string | ❌ | Ville du client (max 100 caractères) |
| `date_naissance` | date | ❌ | Date de naissance du client |
| `type` | string | ✅ | Type de client (particulier ou entreprise) |
| `agent_id` | integer | ❌ | ID de l'agent qui a enrôlé le client |

#### Exemple de requête

```bash
curl -X POST http://localhost:8000/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Marie",
    "email": "marie.dupont@email.com",
    "telephone": "+225 07 12 34 56 78",
    "adresse": "789 Avenue des Cocotiers",
    "ville": "Abidjan",
    "date_naissance": "1990-05-15",
    "type": "particulier",
    "agent_id": 1
  }'
```

#### Réponse

```json
{
  "success": true,
  "message": "Client créé avec succès",
  "data": {
    "id": 1,
    "nom": "Dupont",
    "prenom": "Marie",
    "email": "marie.dupont@email.com",
    "telephone": "+225 07 12 34 56 78",
    "adresse": "789 Avenue des Cocotiers",
    "ville": "Abidjan",
    "date_naissance": "1990-05-15",
    "type": "particulier",
    "actif": true,
    "date_enrollement": null,
    "agent_id": 1,
    "created_at": "2023-09-21T12:00:00.000000Z",
    "updated_at": "2023-09-21T12:00:00.000000Z",
    "agent": {
      "id": 1,
      "nom": "Martin",
      "prenom": "Pierre",
      "email": "pierre.martin@veryfy.com"
    }
  }
}
```

---

### 2. Lister les clients

**Endpoint :** `GET /api/clients`

**Description :** Récupère la liste paginée des clients actifs.

#### Paramètres de requête

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `page` | integer | ❌ | Numéro de page (défaut: 1) |
| `per_page` | integer | ❌ | Nombre d'éléments par page (défaut: 15) |

#### Exemple de requête

```bash
curl -X GET "http://localhost:8000/api/clients?page=1&per_page=10"
```

#### Réponse

```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "nom": "Dupont",
        "prenom": "Marie",
        "email": "marie.dupont@email.com",
        "telephone": "+225 07 12 34 56 78",
        "ville": "Abidjan",
        "type": "particulier",
        "actif": true,
        "agent": {
          "id": 1,
          "nom": "Martin",
          "prenom": "Pierre",
          "email": "pierre.martin@veryfy.com"
        }
      }
    ],
    "first_page_url": "http://localhost:8000/api/clients?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "http://localhost:8000/api/clients?page=1",
    "links": [...],
    "next_page_url": null,
    "path": "http://localhost:8000/api/clients",
    "per_page": 15,
    "prev_page_url": null,
    "to": 1,
    "total": 1
  }
}
```

---

### 3. Détails d'un client

**Endpoint :** `GET /api/clients/{id}`

**Description :** Récupère les détails complets d'un client.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID du client |

#### Exemple de requête

```bash
curl -X GET http://localhost:8000/api/clients/1
```

#### Réponse

```json
{
  "success": true,
  "data": {
    "id": 1,
    "nom": "Dupont",
    "prenom": "Marie",
    "email": "marie.dupont@email.com",
    "telephone": "+225 07 12 34 56 78",
    "adresse": "789 Avenue des Cocotiers",
    "ville": "Abidjan",
    "date_naissance": "1990-05-15",
    "type": "particulier",
    "actif": true,
    "date_enrollement": null,
    "agent_id": 1,
    "created_at": "2023-09-21T12:00:00.000000Z",
    "updated_at": "2023-09-21T12:00:00.000000Z",
    "agent": {
      "id": 1,
      "nom": "Martin",
      "prenom": "Pierre",
      "email": "pierre.martin@veryfy.com"
    },
    "taches": [
      {
        "id": 1,
        "titre": "Nettoyage domicile",
        "statut": "en_cours",
        "date_debut": "2023-09-21",
        "date_fin": "2023-09-22"
      }
    ],
    "demandes": [
      {
        "id": 1,
        "titre": "Demande de nettoyage",
        "statut": "en_cours",
        "date_affectation_agent": "2023-09-21T12:00:00.000000Z"
      }
    ],
    "paiements": [
      {
        "id": 1,
        "montant": 50000,
        "statut": "paye",
        "date_paiement": "2023-09-21T12:00:00.000000Z"
      }
    ]
  }
}
```

---

### 4. Modifier un client

**Endpoint :** `PUT /api/clients/{id}`

**Description :** Met à jour les informations d'un client.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID du client |

#### Body (JSON)

Mêmes paramètres que la création, mais tous optionnels (utiliser `sometimes`).

#### Exemple de requête

```bash
curl -X PUT http://localhost:8000/api/clients/1 \
  -H "Content-Type: application/json" \
  -d '{
    "telephone": "+225 07 98 76 54 32",
    "ville": "Yamoussoukro",
    "type": "entreprise"
  }'
```

#### Réponse

```json
{
  "success": true,
  "message": "Client mis à jour avec succès",
  "data": {
    "id": 1,
    "nom": "Dupont",
    "prenom": "Marie",
    "telephone": "+225 07 98 76 54 32",
    "ville": "Yamoussoukro",
    "type": "entreprise",
    "agent": {
      "id": 1,
      "nom": "Martin",
      "prenom": "Pierre",
      "email": "pierre.martin@veryfy.com"
    }
  }
}
```

---

### 5. Supprimer un client

**Endpoint :** `DELETE /api/clients/{id}`

**Description :** Désactive un client (soft delete).

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID du client |

#### Exemple de requête

```bash
curl -X DELETE http://localhost:8000/api/clients/1
```

#### Réponse

```json
{
  "success": true,
  "message": "Client désactivé avec succès"
}
```

---

### 6. Récupérer les clients d'un agent

**Endpoint :** `GET /api/clients/agent/{agentId}`

**Description :** Récupère les clients enrôlés par un agent spécifique (paginés).

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `agentId` | integer | ✅ | ID de l'agent |

#### Paramètres de requête

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `page` | integer | ❌ | Numéro de page (défaut: 1) |
| `per_page` | integer | ❌ | Nombre d'éléments par page (défaut: 15) |

#### Exemple de requête

```bash
curl -X GET "http://localhost:8000/api/clients/agent/5?page=1&per_page=10"
```

#### Exemple de réponse

```json
{
  "success": true,
  "data": {
    "agent": {
      "id": 5,
      "nom": "Martin",
      "prenom": "Pierre",
      "email": "pierre.martin@veryfy.com"
    },
    "clients": {
      "current_page": 1,
      "data": [
        {
          "id": 21,
          "nom": "Kouassi",
          "prenom": "Awa",
          "email": "awa.kouassi@example.com",
          "ville": "Abidjan",
          "type": "particulier",
          "actif": true
        }
      ],
      "per_page": 15,
      "total": 12
    }
  }
}
```

---

## Tâches

### 1. Créer une tâche

**Endpoint :** `POST /api/taches`

**Description :** Crée une nouvelle tâche avec possibilité d'ajouter des employés et agents.

**Content-Type :** `application/json`

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `entreprise_id` | integer | ✅ | ID de l'entreprise (doit exister) |
| `client_id` | integer | ✅ | ID du client (doit exister) |
| `titre` | string | ✅ | Titre de la tâche (max 255 caractères) |
| `description` | string | ❌ | Description de la tâche |
| `statut` | string | ✅ | Statut de la tâche (en_attente, en_cours, terminee, annulee) |
| `priorite` | string | ✅ | Priorité de la tâche (basse, normale, haute, urgente) |
| `adresse` | string | ❌ | Adresse de la tâche (max 255 caractères) |
| `ville` | string | ❌ | Ville de la tâche (max 100 caractères) |
| `date_debut` | date | ❌ | Date de début de la tâche |
| `date_fin` | date | ❌ | Date de fin de la tâche (≥ date_debut) |
| `employer_ids` | array | ❌ | IDs des employés à assigner |
| `agent_ids` | array | ❌ | IDs des agents à assigner |

#### Exemple de requête

```bash
curl -X POST http://localhost:8000/api/taches \
  -H "Content-Type: application/json" \
  -d '{
    "entreprise_id": 1,
    "client_id": 1,
    "titre": "Nettoyage de bureaux",
    "description": "Nettoyage complet des bureaux de l'entreprise",
    "statut": "en_attente",
    "priorite": "normale",
    "adresse": "123 Avenue de la Paix",
    "ville": "Abidjan",
    "date_debut": "2023-09-25",
    "date_fin": "2023-09-26",
    "employer_ids": [1, 2],
    "agent_ids": [1]
  }'
```

#### Réponse

```json
{
  "success": true,
  "message": "Tâche créée avec succès",
  "data": {
    "id": 1,
    "entreprise_id": 1,
    "client_id": 1,
    "titre": "Nettoyage de bureaux",
    "description": "Nettoyage complet des bureaux de l'entreprise",
    "statut": "en_attente",
    "priorite": "normale",
    "adresse": "123 Avenue de la Paix",
    "ville": "Abidjan",
    "date_debut": "2023-09-25",
    "date_fin": "2023-09-26",
    "created_at": "2023-09-21T12:00:00.000000Z",
    "updated_at": "2023-09-21T12:00:00.000000Z",
    "entreprise": {
      "id": 1,
      "nom": "Mon Entreprise SARL",
      "email": "contact@monentreprise.com"
    },
    "client": {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Marie",
      "email": "marie.dupont@email.com"
    },
    "employers": [
      {
        "id": 1,
        "nom": "Martin",
        "prenom": "Pierre",
        "email": "pierre.martin@entreprise.com",
        "poste": "Agent de nettoyage"
      }
    ],
    "agents": [
      {
        "id": 1,
        "nom": "Kouassi",
        "prenom": "Jean",
        "email": "jean.kouassi@veryfy.com",
        "poste": "Superviseur"
      }
    ]
  }
}
```

---

### 2. Lister les tâches

**Endpoint :** `GET /api/taches`

**Description :** Récupère la liste paginée des tâches.

#### Paramètres de requête

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `page` | integer | ❌ | Numéro de page (défaut: 1) |
| `per_page` | integer | ❌ | Nombre d'éléments par page (défaut: 15) |

#### Exemple de requête

```bash
curl -X GET "http://localhost:8000/api/taches?page=1&per_page=10"
```

#### Réponse

```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "entreprise_id": 1,
        "client_id": 1,
        "titre": "Nettoyage de bureaux",
        "statut": "en_attente",
        "priorite": "normale",
        "date_debut": "2023-09-25",
        "date_fin": "2023-09-26",
        "entreprise": {
          "id": 1,
          "nom": "Mon Entreprise SARL",
          "email": "contact@monentreprise.com"
        },
        "client": {
          "id": 1,
          "nom": "Dupont",
          "prenom": "Marie",
          "email": "marie.dupont@email.com"
        },
        "employers": [...],
        "agents": [...]
      }
    ],
    "first_page_url": "http://localhost:8000/api/taches?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "http://localhost:8000/api/taches?page=1",
    "links": [...],
    "next_page_url": null,
    "path": "http://localhost:8000/api/taches",
    "per_page": 15,
    "prev_page_url": null,
    "to": 1,
    "total": 1
  }
}
```

---

### 3. Détails d'une tâche

**Endpoint :** `GET /api/taches/{id}`

**Description :** Récupère les détails complets d'une tâche avec toutes ses relations (entreprise, client, employés, agents, documents, commentaires, checklists).

> **Note :** Cette API utilise les ressources API Laravel pour retourner des données structurées et cohérentes. Les dates sont formatées au format `Y-m-d H:i:s`.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID de la tâche |

#### Exemple de requête

```bash
curl -X GET http://localhost:8000/api/taches/1
```

#### Réponse

```json
{
  "success": true,
  "data": {
    "id": 1,
    "entreprise_id": 1,
    "client_id": 1,
    "titre": "Nettoyage de bureaux",
    "description": "Nettoyage complet des bureaux de l'entreprise",
    "statut": "en_attente",
    "priorite": "normale",
    "adresse": "123 Avenue de la Paix",
    "ville": "Abidjan",
    "date_debut": "2023-09-25",
    "date_fin": "2023-09-26",
    "created_at": "2023-09-21 12:00:00",
    "updated_at": "2023-09-21 12:00:00",
    "entreprise": {
      "id": 1,
      "nom": "Mon Entreprise SARL",
      "email": "contact@monentreprise.com",
      "telephone": "+225 07 12 34 56 78"
    },
    "client": {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Marie",
      "email": "marie.dupont@email.com",
      "telephone": "+225 07 12 34 56 78"
    },
    "employers": [
      {
        "id": 1,
        "nom": "Martin",
        "prenom": "Pierre",
        "email": "pierre.martin@entreprise.com",
        "poste": "Agent de nettoyage",
        "specialites": ["Nettoyage", "Désinfection"]
      }
    ],
    "agents": [
      {
        "id": 1,
        "nom": "Kouassi",
        "prenom": "Jean",
        "email": "jean.kouassi@veryfy.com",
        "poste": "Superviseur",
        "specialites": ["Supervision", "Formation"]
      }
    ],
    "documents": [
      {
        "id": 1,
        "type_document": "plan",
        "chemin_fichier": "documents/taches/1/plan.pdf",
        "extension": "pdf",
        "taille_fichier": 245760,
        "description": "Plan de nettoyage",
        "created_at": "2023-09-21 12:00:00",
        "updated_at": "2023-09-21 12:00:00"
      }
    ],
    "commentaires": [
      {
        "id": 1,
        "contenu": "Tâche bien définie",
        "created_at": "2023-09-21 12:00:00",
        "updated_at": "2023-09-21 12:00:00"
      }
    ],
    "checklists": [
      {
        "id": 1,
        "titre": "Nettoyage des bureaux",
        "description": "Nettoyer tous les bureaux",
        "termine": false,
        "ordre": 1,
        "created_at": "2023-09-21 12:00:00",
        "updated_at": "2023-09-21 12:00:00"
      }
    ]
  }
}
```

#### Structure de la réponse

La réponse est structurée avec les ressources API Laravel :

- **TacheResource** : Contient toutes les informations de la tâche
- **EntrepriseResource** : Informations de l'entreprise (id, nom, email, telephone)
- **ClientResource** : Informations du client (id, nom, prenom, email, telephone)
- **EmployerResource[]** : Collection des employés assignés (id, nom, prenom, email, poste, specialites)
- **AgentResource[]** : Collection des agents assignés (id, nom, prenom, email, poste, specialites)
- **DocumentResource[]** : Collection des documents (id, type_document, chemin_fichier, extension, taille_fichier, description, dates)
- **CommentaireResource[]** : Collection des commentaires (id, contenu, dates)
- **ChecklistResource[]** : Collection des checklists (id, titre, description, termine, ordre, dates)

#### Notes importantes

1. **Format des dates** : Toutes les dates sont retournées au format `Y-m-d H:i:s` (ex: "2023-09-21 12:00:00")
2. **Relations lazy loading** : Les relations ne sont chargées que si elles existent
3. **Documents** : Inclut maintenant l'extension et la taille du fichier en octets
4. **Timestamps** : Tous les objets relationnels incluent `created_at` et `updated_at`

---

### 4. Modifier une tâche

**Endpoint :** `PUT /api/taches/{id}`

**Description :** Met à jour les informations d'une tâche.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID de la tâche |

#### Body (JSON)

Mêmes paramètres que la création, mais tous optionnels (utiliser `sometimes`).

#### Exemple de requête

```bash
curl -X PUT http://localhost:8000/api/taches/1 \
  -H "Content-Type: application/json" \
  -d '{
    "statut": "en_cours",
    "priorite": "haute",
    "employer_ids": [1, 2, 3],
    "agent_ids": [1, 2]
  }'
```

#### Réponse

```json
{
  "success": true,
  "message": "Tâche mise à jour avec succès",
  "data": {
    "id": 1,
    "titre": "Nettoyage de bureaux",
    "statut": "en_cours",
    "priorite": "haute",
    "entreprise": {
      "id": 1,
      "nom": "Mon Entreprise SARL",
      "email": "contact@monentreprise.com"
    },
    "client": {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Marie",
      "email": "marie.dupont@email.com"
    },
    "employers": [...],
    "agents": [...]
  }
}
```

---

### 5. Supprimer une tâche

**Endpoint :** `DELETE /api/taches/{id}`

**Description :** Supprime une tâche et détache tous les employés/agents associés.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID de la tâche |

#### Exemple de requête

```bash
curl -X DELETE http://localhost:8000/api/taches/1
```

#### Réponse

```json
{
  "success": true,
  "message": "Tâche supprimée avec succès"
}
```

---

### 6. Ajouter des employés à une tâche

**Endpoint :** `POST /api/taches/{id}/employers`

**Description :** Ajoute des employés à une tâche existante.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID de la tâche |

#### Body (JSON)

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `employer_ids` | array | ✅ | IDs des employés à ajouter |
| `role` | string | ❌ | Rôle des employés (défaut: "employe") |

#### Exemple de requête

```bash
curl -X POST http://localhost:8000/api/taches/1/employers \
  -H "Content-Type: application/json" \
  -d '{
    "employer_ids": [1, 2],
    "role": "responsable"
  }'
```

#### Réponse

```json
{
  "success": true,
  "message": "Employés ajoutés à la tâche avec succès",
  "data": {
    "employers": [
      {
        "id": 1,
        "nom": "Martin",
        "prenom": "Pierre",
        "email": "pierre.martin@entreprise.com",
        "poste": "Agent de nettoyage"
      },
      {
        "id": 2,
        "nom": "Kouame",
        "prenom": "Paul",
        "email": "paul.kouame@entreprise.com",
        "poste": "Superviseur"
      }
    ]
  }
}
```

---

### 7. Ajouter des agents à une tâche

**Endpoint :** `POST /api/taches/{id}/agents`

**Description :** Ajoute des agents Veryfy à une tâche existante.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID de la tâche |

#### Body (JSON)

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `agent_ids` | array | ✅ | IDs des agents à ajouter |
| `role` | string | ❌ | Rôle des agents (défaut: "agent") |

#### Exemple de requête

```bash
curl -X POST http://localhost:8000/api/taches/1/agents \
  -H "Content-Type: application/json" \
  -d '{
    "agent_ids": [1],
    "role": "superviseur"
  }'
```

#### Réponse

```json
{
  "success": true,
  "message": "Agents ajoutés à la tâche avec succès",
  "data": {
    "agents": [
      {
        "id": 1,
        "nom": "Kouassi",
        "prenom": "Jean",
        "email": "jean.kouassi@veryfy.com",
        "poste": "Superviseur"
      }
    ]
  }
}
```

---

### 8. Récupérer les tâches d'une entreprise

**Endpoint :** `GET /api/taches/entreprise/{entrepriseId}`

**Description :** Récupère toutes les tâches d'une entreprise spécifique.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `entrepriseId` | integer | ✅ | ID de l'entreprise |

#### Paramètres de requête

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `page` | integer | ❌ | Numéro de page (défaut: 1) |
| `per_page` | integer | ❌ | Nombre d'éléments par page (défaut: 15) |

#### Exemple de requête

```bash
curl -X GET "http://localhost:8000/api/taches/entreprise/1?page=1&per_page=10"
```

#### Réponse

```json
{
  "success": true,
  "data": {
    "entreprise": {
      "id": 1,
      "nom": "Mon Entreprise SARL",
      "email": "contact@monentreprise.com"
    },
    "taches": {
      "current_page": 1,
      "data": [
        {
          "id": 1,
          "entreprise_id": 1,
          "client_id": 1,
          "titre": "Nettoyage de bureaux",
          "statut": "en_attente",
          "priorite": "normale",
          "date_debut": "2023-09-25",
          "date_fin": "2023-09-26",
          "client": {
            "id": 1,
            "nom": "Dupont",
            "prenom": "Marie",
            "email": "marie.dupont@email.com"
          },
          "employers": [...],
          "agents": [...]
        }
      ],
      "first_page_url": "http://localhost:8000/api/taches/entreprise/1?page=1",
      "from": 1,
      "last_page": 1,
      "last_page_url": "http://localhost:8000/api/taches/entreprise/1?page=1",
      "links": [...],
      "next_page_url": null,
      "path": "http://localhost:8000/api/taches/entreprise/1",
      "per_page": 15,
      "prev_page_url": null,
      "to": 1,
      "total": 1
    }
  }
}
```

---

### 9. Récupérer les tâches d'un client

**Endpoint :** `GET /api/taches/client/{clientId}`

**Description :** Récupère toutes les tâches d'un client spécifique.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `clientId` | integer | ✅ | ID du client |

#### Paramètres de requête

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `page` | integer | ❌ | Numéro de page (défaut: 1) |
| `per_page` | integer | ❌ | Nombre d'éléments par page (défaut: 15) |

#### Exemple de requête

```bash
curl -X GET "http://localhost:8000/api/taches/client/1?page=1&per_page=10"
```

#### Réponse

```json
{
  "success": true,
  "data": {
    "client": {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Marie",
      "email": "marie.dupont@email.com"
    },
    "taches": {
      "current_page": 1,
      "data": [
        {
          "id": 1,
          "entreprise_id": 1,
          "client_id": 1,
          "titre": "Nettoyage de bureaux",
          "statut": "en_attente",
          "priorite": "normale",
          "date_debut": "2023-09-25",
          "date_fin": "2023-09-26",
          "entreprise": {
            "id": 1,
            "nom": "Mon Entreprise SARL",
            "email": "contact@monentreprise.com"
          },
          "employers": [...],
          "agents": [...]
        }
      ],
      "first_page_url": "http://localhost:8000/api/taches/client/1?page=1",
      "from": 1,
      "last_page": 1,
      "last_page_url": "http://localhost:8000/api/taches/client/1?page=1",
      "links": [...],
      "next_page_url": null,
      "path": "http://localhost:8000/api/taches/client/1",
      "per_page": 15,
      "prev_page_url": null,
      "to": 1,
      "total": 1
    }
  }
}
```

---

### 10. Récupérer les tâches d'un agent (vue liste)

**Endpoint :** `GET /api/taches/agent/{agentId}`

**Description :** Retourne les tâches assignées à un agent Veryfy sans charger les relations lourdes (optimisé pour l'écran de liste).

#### Exemple de réponse

```json
{
  "success": true,
  "data": {
    "agent": {
      "id": 5,
      "nom": "Martin",
      "prenom": "Pierre",
      "email": "pierre.martin@veryfy.com"
    },
    "taches": {
      "current_page": 1,
      "data": [
        {
          "id": 12,
          "titre": "Inspection chantier Riviera",
          "statut": "en_cours",
          "priorite": "haute",
          "date_debut": "2025-01-10",
          "date_fin": "2025-01-12",
          "ville": "Abidjan",
          "pivot": {
            "role": "superviseur",
            "date_intervention": "2025-01-10T08:00:00Z"
          }
        }
      ],
      "per_page": 15,
      "total": 8
    }
  }
}
```

---

### 11. Récupérer une tâche assignée à un agent (vue détaillée)

**Endpoint :** `GET /api/taches/agent/{agentId}/{tacheId}`

**Description :** Retourne la tâche (si l'agent y est assigné) avec toutes ses relations : entreprise, client, employés, autres agents, documents, checklists, commentaires, etc.

#### Exemple de réponse

```json
{
  "success": true,
  "data": {
    "id": 12,
    "titre": "Inspection chantier Riviera",
    "statut": "en_cours",
    "entreprise": {
      "id": 3,
      "nom": "CleanPro"
    },
    "client": {
      "id": 9,
      "nom": "Kouassi",
      "prenom": "Awa"
    },
    "employers": [
      {
        "id": 4,
        "nom": "Koné",
        "prenom": "Jacques",
        "poste": "Chef d'équipe"
      }
    ],
    "agents": [
      {
        "id": 5,
        "nom": "Martin",
        "prenom": "Pierre"
      }
    ],
    "documents": [
      {
        "id": 33,
        "type_document": "rapport"
      }
    ],
    "checklists": [
      {
        "id": 77,
        "titre": "Contrôle sécurité"
      }
    ]
  }
}
```

---

## Services

### 1. Créer un service

**Endpoint :** `POST /api/services`

**Description :** Crée un nouveau service pour une entreprise.

**Content-Type :** `application/json`

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `entreprise_id` | integer | ✅ | ID de l'entreprise (doit exister) |
| `nom` | string | ✅ | Nom du service (max 255 caractères) |
| `description` | text | ❌ | Description du service |
| `categorie` | string | ✅ | Catégorie du service (max 100 caractères) |
| `prix_minimum` | numeric | ❌ | Prix minimum du service (≥ 0) |
| `prix_maximum` | numeric | ❌ | Prix maximum du service (≥ prix_minimum) |
| `unite_prix` | string | ❌ | Unité de prix (max 50 caractères) |
| `zones_geographiques` | array | ❌ | Zones géographiques couvertes |

#### Exemple de requête

```bash
curl -X POST http://localhost:8000/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "entreprise_id": 1,
    "nom": "Nettoyage de bureaux",
    "description": "Service de nettoyage professionnel pour bureaux et espaces de travail",
    "categorie": "Nettoyage",
    "prix_minimum": 25000,
    "prix_maximum": 100000,
    "unite_prix": "par m²",
    "zones_geographiques": ["Abidjan", "Yamoussoukro", "Bouaké"]
  }'
```

#### Réponse

```json
{
  "success": true,
  "message": "Service créé avec succès",
  "data": {
    "id": 1,
    "entreprise_id": 1,
    "nom": "Nettoyage de bureaux",
    "description": "Service de nettoyage professionnel pour bureaux et espaces de travail",
    "categorie": "Nettoyage",
    "prix_minimum": 25000,
    "prix_maximum": 100000,
    "unite_prix": "par m²",
    "zones_geographiques": ["Abidjan", "Yamoussoukro", "Bouaké"],
    "actif": true,
    "created_at": "2023-09-21T12:00:00.000000Z",
    "updated_at": "2023-09-21T12:00:00.000000Z",
    "entreprise": {
      "id": 1,
      "nom": "Mon Entreprise SARL",
      "email": "contact@monentreprise.com",
      "verifie": true
    }
  }
}
```

---

### 2. Lister les services

**Endpoint :** `GET /api/services`

**Description :** Récupère la liste paginée des services actifs.

#### Paramètres de requête

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `page` | integer | ❌ | Numéro de page (défaut: 1) |
| `per_page` | integer | ❌ | Nombre d'éléments par page (défaut: 15) |

#### Exemple de requête

```bash
curl -X GET "http://localhost:8000/api/services?page=1&per_page=10"
```

#### Réponse

```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "entreprise_id": 1,
        "nom": "Nettoyage de bureaux",
        "categorie": "Nettoyage",
        "prix_minimum": 25000,
        "prix_maximum": 100000,
        "unite_prix": "par m²",
        "actif": true,
        "entreprise": {
          "id": 1,
          "nom": "Mon Entreprise SARL",
          "email": "contact@monentreprise.com",
          "verifie": true
        }
      }
    ],
    "first_page_url": "http://localhost:8000/api/services?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "http://localhost:8000/api/services?page=1",
    "links": [...],
    "next_page_url": null,
    "path": "http://localhost:8000/api/services",
    "per_page": 15,
    "prev_page_url": null,
    "to": 1,
    "total": 1
  }
}
```

---

### 3. Détails d'un service

**Endpoint :** `GET /api/services/{id}`

**Description :** Récupère les détails complets d'un service.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID du service |

#### Exemple de requête

```bash
curl -X GET http://localhost:8000/api/services/1
```

#### Réponse

```json
{
  "success": true,
  "data": {
    "id": 1,
    "entreprise_id": 1,
    "nom": "Nettoyage de bureaux",
    "description": "Service de nettoyage professionnel pour bureaux et espaces de travail",
    "categorie": "Nettoyage",
    "prix_minimum": 25000,
    "prix_maximum": 100000,
    "unite_prix": "par m²",
    "zones_geographiques": ["Abidjan", "Yamoussoukro", "Bouaké"],
    "actif": true,
    "created_at": "2023-09-21T12:00:00.000000Z",
    "updated_at": "2023-09-21T12:00:00.000000Z",
    "entreprise": {
      "id": 1,
      "nom": "Mon Entreprise SARL",
      "email": "contact@monentreprise.com",
      "verifie": true
    },
    "paiements": [
      {
        "id": 1,
        "montant": 50000,
        "statut": "paye",
        "date_paiement": "2023-09-21T12:00:00.000000Z"
      }
    ],
    "documents": [
      {
        "id": 1,
        "type_document": "certificat",
        "chemin_fichier": "documents/services/1/certificat.pdf",
        "description": "Certificat de qualité du service"
      }
    ]
  }
}
```

---

### 4. Modifier un service

**Endpoint :** `PUT /api/services/{id}`

**Description :** Met à jour les informations d'un service.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID du service |

#### Body (JSON)

Mêmes paramètres que la création, mais tous optionnels (utiliser `sometimes`).

#### Exemple de requête

```bash
curl -X PUT http://localhost:8000/api/services/1 \
  -H "Content-Type: application/json" \
  -d '{
    "prix_minimum": 30000,
    "prix_maximum": 120000,
    "zones_geographiques": ["Abidjan", "Yamoussoukro", "Bouaké", "San-Pédro"]
  }'
```

#### Réponse

```json
{
  "success": true,
  "message": "Service mis à jour avec succès",
  "data": {
    "id": 1,
    "nom": "Nettoyage de bureaux",
    "prix_minimum": 30000,
    "prix_maximum": 120000,
    "zones_geographiques": ["Abidjan", "Yamoussoukro", "Bouaké", "San-Pédro"],
    "entreprise": {
      "id": 1,
      "nom": "Mon Entreprise SARL",
      "email": "contact@monentreprise.com",
      "verifie": true
    }
  }
}
```

---

### 5. Supprimer un service

**Endpoint :** `DELETE /api/services/{id}`

**Description :** Désactive un service (soft delete).

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID du service |

#### Exemple de requête

```bash
curl -X DELETE http://localhost:8000/api/services/1
```

#### Réponse

```json
{
  "success": true,
  "message": "Service désactivé avec succès"
}
```

---

### 6. Récupérer les services d'une entreprise

**Endpoint :** `GET /api/services/entreprise/{entrepriseId}`

**Description :** Récupère tous les services actifs d'une entreprise spécifique.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `entrepriseId` | integer | ✅ | ID de l'entreprise |

#### Paramètres de requête

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `page` | integer | ❌ | Numéro de page (défaut: 1) |
| `per_page` | integer | ❌ | Nombre d'éléments par page (défaut: 15) |

#### Exemple de requête

```bash
curl -X GET "http://localhost:8000/api/services/entreprise/1?page=1&per_page=10"
```

#### Réponse

```json
{
  "success": true,
  "data": {
    "entreprise": {
      "id": 1,
      "nom": "Mon Entreprise SARL",
      "email": "contact@monentreprise.com",
      "verifie": true
    },
    "services": {
      "current_page": 1,
      "data": [
        {
          "id": 1,
          "entreprise_id": 1,
          "nom": "Nettoyage de bureaux",
          "description": "Service de nettoyage professionnel pour bureaux et espaces de travail",
          "categorie": "Nettoyage",
          "prix_minimum": 25000,
          "prix_maximum": 100000,
          "unite_prix": "par m²",
          "zones_geographiques": ["Abidjan", "Yamoussoukro", "Bouaké"],
          "actif": true,
          "created_at": "2023-09-21T12:00:00.000000Z",
          "updated_at": "2023-09-21T12:00:00.000000Z",
          "paiements": [
            {
              "id": 1,
              "montant": 50000,
              "statut": "paye",
              "date_paiement": "2023-09-21T12:00:00.000000Z"
            }
          ]
        }
      ],
      "first_page_url": "http://localhost:8000/api/services/entreprise/1?page=1",
      "from": 1,
      "last_page": 1,
      "last_page_url": "http://localhost:8000/api/services/entreprise/1?page=1",
      "links": [...],
      "next_page_url": null,
      "path": "http://localhost:8000/api/services/entreprise/1",
      "per_page": 15,
      "prev_page_url": null,
      "to": 1,
      "total": 1
    }
  }
}
```

---

## Administrateurs

### Authentification

#### Inscription d'un administrateur
**Endpoint :** `POST /api/auth/admins/register`

**Paramètres :**
- `nom`, `prenom`, `email`, `password`, `password_confirmation` (requis)
- `telephone`, `poste`, `permissions` (optionnels)

#### Connexion d'un administrateur
**Endpoint :** `POST /api/auth/admins/login`

**Paramètres :**
- `email`, `password` (requis)

#### Profil de l'administrateur
**Endpoint :** `GET /api/auth/admins/profile`
**Authentification :** Requise

#### Mise à jour du profil
**Endpoint :** `PUT /api/auth/admins/profile`
**Authentification :** Requise

#### Changement de mot de passe
**Endpoint :** `PATCH /api/auth/admins/password`
**Authentification :** Requise

### Gestion des administrateurs

#### Lister les administrateurs
**Endpoint :** `GET /api/admins`

#### Créer un administrateur
**Endpoint :** `POST /api/admins`

#### Détails d'un administrateur
**Endpoint :** `GET /api/admins/{id}`

#### Modifier un administrateur
**Endpoint :** `PUT /api/admins/{id}`

#### Désactiver un administrateur
**Endpoint :** `DELETE /api/admins/{id}`

#### Changer le mot de passe d'un administrateur
**Endpoint :** `PATCH /api/admins/{id}/password`

#### Mettre à jour les permissions
**Endpoint :** `PATCH /api/admins/{id}/permissions`

#### Réactiver un administrateur
**Endpoint :** `PATCH /api/admins/{id}/reactivate`

---

## Commentaires

### Système de commentaires

Les commentaires utilisent une **relation polymorphique** pour identifier l'auteur. Chaque commentaire est lié à :
- **Une tâche** (`tache_id`) : Sur quelle tâche porte le commentaire
- **Un auteur** (`commentable_type` + `commentable_id`) : Qui a écrit le commentaire

#### Types d'auteurs autorisés

| Type | Model | Description |
|------|-------|-------------|
| **Client** | `App\Models\Client` | Clients particuliers ou entreprises |
| **Agent Veryfy** | `App\Models\Agent` | Agents employés de Veryfy |
| **Employé** | `App\Models\Employer` | Employés des entreprises clientes |
| **Administrateur** | `App\Models\User` | Administrateurs de la plateforme |
| **Entreprise** | `App\Models\Entreprise` | Entreprises inscrites sur la plateforme |

---

#### Lister les commentaires
**Endpoint :** `GET /api/commentaires`

**Description :** Récupère la liste paginée de tous les commentaires.

---

#### Créer un commentaire
**Endpoint :** `POST /api/commentaires`

**Description :** Crée un nouveau commentaire sur une tâche.

**Content-Type :** `application/json`

**Paramètres :**

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `tache_id` | integer | ✅ | ID de la tâche (doit exister) |
| `contenu` | string | ✅ | Contenu du commentaire (max 1000 caractères) |
| `commentable_type` | string | ✅ | Type d'auteur (`App\Models\Client`, `App\Models\Agent`, `App\Models\Employer`, `App\Models\User`, `App\Models\Entreprise`) |
| `commentable_id` | integer | ✅ | ID de l'auteur du commentaire |

**Exemple de requête (Admin qui commente) :**

```bash
curl -X POST http://localhost:8000/api/commentaires \
  -H "Content-Type: application/json" \
  -d '{
    "tache_id": 1,
    "contenu": "Tâche vérifiée et validée par l'\''admin",
    "commentable_type": "App\\Models\\User",
    "commentable_id": 1
  }'
```

**Exemple de requête (Client qui commente) :**

```bash
curl -X POST http://localhost:8000/api/commentaires \
  -H "Content-Type: application/json" \
  -d '{
    "tache_id": 1,
    "contenu": "Le travail a été bien fait, merci !",
    "commentable_type": "App\\Models\\Client",
    "commentable_id": 5
  }'
```

---

#### Détails d'un commentaire
**Endpoint :** `GET /api/commentaires/{id}`

**Description :** Récupère les détails d'un commentaire spécifique.

---

#### Modifier un commentaire
**Endpoint :** `PUT /api/commentaires/{id}`

**Description :** Met à jour le contenu d'un commentaire.

**Paramètres :**
- `contenu` (string, max 1000 caractères)

---

#### Supprimer un commentaire
**Endpoint :** `DELETE /api/commentaires/{id}`

**Description :** Supprime définitivement un commentaire.

---

#### Commentaires d'une tâche
**Endpoint :** `GET /api/commentaires/tache/{tacheId}`

**Description :** Récupère tous les commentaires d'une tâche spécifique, triés par date (du plus récent au plus ancien).

---

#### Commentaires d'une entreprise
**Endpoint :** `GET /api/commentaires/entreprise/{entrepriseId}`

**Description :** Récupère tous les commentaires liés à une entreprise, triés par date (du plus récent au plus ancien).

---

#### Ajouter un commentaire à une tâche
**Endpoint :** `POST /api/commentaires/tache/{tacheId}`

**Description :** Ajoute un commentaire directement à une tâche spécifique.

**Paramètres :**
- `contenu` (requis)
- `commentable_type` (requis) : `App\Models\Client`, `App\Models\Agent`, `App\Models\Employer`, `App\Models\User`, ou `App\Models\Entreprise`
- `commentable_id` (requis) : ID de l'auteur

---

#### Ajouter un commentaire à une entreprise
**Endpoint :** `POST /api/commentaires/entreprise/{entrepriseId}`

**Description :** Ajoute un commentaire lié à une entreprise (avec ou sans tâche spécifique).

**Paramètres :**
- `contenu` (requis)
- `commentable_type` (requis) : `App\Models\Client`, `App\Models\Agent`, `App\Models\Employer`, `App\Models\User`, ou `App\Models\Entreprise`
- `commentable_id` (requis) : ID de l'auteur
- `tache_id` (optionnel) : ID de la tâche si le commentaire est lié à une tâche spécifique

---

## Notes

#### Lister les notes
**Endpoint :** `GET /api/notes`

#### Créer une note
**Endpoint :** `POST /api/notes`

**Paramètres :**
- `client_id`, `note` (0-5), `notable_type`, `notable_id` (requis)

#### Détails d'une note
**Endpoint :** `GET /api/notes/{id}`

#### Modifier une note
**Endpoint :** `PUT /api/notes/{id}`

#### Supprimer une note
**Endpoint :** `DELETE /api/notes/{id}`

#### Notes d'un client
**Endpoint :** `GET /api/notes/client/{clientId}`

#### Notes d'une entreprise
**Endpoint :** `GET /api/notes/entreprise/{entrepriseId}`

#### Notes d'un agent
**Endpoint :** `GET /api/notes/agent/{agentId}`

#### Noter une entreprise
**Endpoint :** `POST /api/notes/entreprise/{entrepriseId}/rate`

#### Noter un agent
**Endpoint :** `POST /api/notes/agent/{agentId}/rate`

---

## Paiements

#### Lister les paiements
**Endpoint :** `GET /api/paiements`

#### Créer un paiement
**Endpoint :** `POST /api/paiements`

**Paramètres :**
- `client_id`, `montant`, `type_paiement`, `statut`, `methode_paiement` (requis)
- `entreprise_id`, `demande_id`, `service_id`, `reference_transaction`, `description` (optionnels)

#### Détails d'un paiement
**Endpoint :** `GET /api/paiements/{id}`

#### Modifier un paiement
**Endpoint :** `PUT /api/paiements/{id}`

#### Supprimer un paiement
**Endpoint :** `DELETE /api/paiements/{id}`

#### Marquer comme payé
**Endpoint :** `PATCH /api/paiements/{id}/paid`

#### Marquer comme échoué
**Endpoint :** `PATCH /api/paiements/{id}/failed`

#### Rembourser un paiement
**Endpoint :** `PATCH /api/paiements/{id}/refund`

#### Paiements d'un client
**Endpoint :** `GET /api/paiements/client/{clientId}`

#### Paiements d'une entreprise
**Endpoint :** `GET /api/paiements/entreprise/{entrepriseId}`

#### Paiements d'une demande
**Endpoint :** `GET /api/paiements/demande/{demandeId}`

#### Paiements d'un service
**Endpoint :** `GET /api/paiements/service/{serviceId}`

---

## Demandes

#### Lister les demandes
**Endpoint :** `GET /api/demandes`

**Description :** Récupère toutes les demandes (actives et inactives) avec leurs relations (client, entreprise, agent, paiement). Aucun filtre sur le statut `actif` n'est appliqué pour permettre à l'interface admin de voir l'ensemble des demandes.

#### Créer une demande
**Endpoint :** `POST /api/demandes`

**Paramètres :**
- `client_id` (requis) : ID du client
- `entreprise_id` (optionnel) : ID de l'entreprise
- `titre` (requis) : Titre de la demande
- `description` (requis) : Description de la demande
- `type_demande` (requis) : Type de demande (`enrollement`, `support`, `intervention`)
- `statut` (requis) : Statut (`en_attente`, `en_cours`, `terminee`, `annulee`, `payee`)
- `priorite` (requis) : Priorité de la demande (texte libre)
- `agent_id` (optionnel) : ID de l'agent assigné
- `prix_fixe` (optionnel) : Prix fixé par l'agent

#### Détails d'une demande
**Endpoint :** `GET /api/demandes/{id}`

#### Modifier une demande
**Endpoint :** `PUT /api/demandes/{id}`

#### Supprimer une demande
**Endpoint :** `DELETE /api/demandes/{id}`

#### Assigner un agent
**Endpoint :** `POST /api/demandes/{id}/assign-agent`

#### Marquer comme terminée
**Endpoint :** `PATCH /api/demandes/{id}/complete`

#### Demandes d'un client
**Endpoint :** `GET /api/demandes/client/{clientId}`

#### Demandes d'une entreprise
**Endpoint :** `GET /api/demandes/entreprise/{entrepriseId}`

#### Demandes d'un agent
**Endpoint :** `GET /api/demandes/agent/{agentId}`

---

## Checklists

#### Lister les checklists
**Endpoint :** `GET /api/checklists`

#### Créer une checklist
**Endpoint :** `POST /api/checklists`

**Paramètres :**
- `tache_id`, `titre` (requis)
- `description`, `ordre` (optionnels)

#### Détails d'une checklist
**Endpoint :** `GET /api/checklists/{id}`

#### Modifier une checklist
**Endpoint :** `PUT /api/checklists/{id}`

#### Supprimer une checklist
**Endpoint :** `DELETE /api/checklists/{id}`

#### Checklists d'une tâche
**Endpoint :** `GET /api/checklists/tache/{tacheId}`

#### Marquer comme terminée
**Endpoint :** `PATCH /api/checklists/{id}/complete`

#### Marquer comme incomplète
**Endpoint :** `PATCH /api/checklists/{id}/incomplete`

#### Réorganiser les checklists
**Endpoint :** `POST /api/checklists/tache/{tacheId}/reorder`

---

## Dashboard Admin

### Vue d'ensemble

L'API Dashboard fournit toutes les statistiques nécessaires pour l'interface d'administration Veryfy. Elle permet d'avoir une vue d'ensemble complète de la plateforme avec des métriques en temps réel.

### 1. Statistiques complètes du dashboard (version standard)

**Endpoint :** `GET /api/dashboard`

**Description :** Récupère toutes les statistiques du dashboard admin en une seule requête (approche standard avec requêtes Eloquent).

### 2. Statistiques optimisées du dashboard (version avec vues de base de données)

**Endpoint :** `GET /api/dashboard/optimized`

**Description :** Récupère toutes les statistiques du dashboard admin avec des vues de base de données optimisées. **Recommandé pour la production**.

#### Avantages de l'approche optimisée

- ⚡ **Performance** : 3-5x plus rapide que la version standard
- 🎯 **Précision** : Calculs effectués directement en base de données
- 💾 **Cache automatique** : Optimisé par le moteur PostgreSQL
- 📊 **Métriques en temps réel** : Données toujours à jour
- 🔧 **Maintenance** : Vues mises à jour automatiquement
- 📈 **Scalabilité** : Performance constante même avec de gros volumes de données

#### Vues de base de données utilisées

L'approche optimisée utilise 8 vues PostgreSQL spécialement conçues :

1. **`dashboard_overview`** - Statistiques générales par entité avec tendances 30 jours
2. **`dashboard_tasks_by_status`** - Répartition des tâches par statut avec pourcentages
3. **`dashboard_requests_by_status`** - Répartition des demandes par statut avec pourcentages
4. **`dashboard_employee_performance`** - Performance des employés (top 10) avec scores
5. **`dashboard_recent_activity`** - Activité récente (tâches et demandes) triée par date
6. **`dashboard_storage_stats`** - Statistiques de stockage par type/entité
7. **`dashboard_storage_overview`** - Vue globale du stockage (taille totale, moyenne)
8. **`dashboard_verified_stats`** - Statistiques de vérification des entreprises

#### Comparaison des performances

| Métrique | Version Standard | Version Optimisée | Amélioration |
|----------|------------------|-------------------|--------------|
| **Requêtes SQL** | 20+ requêtes complexes | 7 requêtes simples | -65% |
| **Temps de réponse** | 200-500ms | 50-100ms | -75% |
| **Charge CPU** | Élevée (calculs PHP) | Faible (calculs DB) | -80% |
| **Mémoire utilisée** | Élevée (relations chargées) | Faible (données pré-calculées) | -70% |
| **Cache** | Aucun | Automatique (PostgreSQL) | +100% |
| **Maintenance** | Facile | Moyenne | -20% |
| **Flexibilité** | Haute | Moyenne | -30% |

#### Recommandations d'utilisation

- **Développement** : Utilisez `/api/dashboard` (version standard) pour la flexibilité
- **Production** : Utilisez `/api/dashboard/optimized` (version optimisée) pour les performances
- **Tests de charge** : La version optimisée supporte 10x plus de requêtes simultanées
- **Monitoring** : Surveillez les temps de réponse pour choisir la version appropriée

#### Exemples de requêtes

**Version standard (développement) :**
```bash
curl -X GET http://localhost:8000/api/dashboard
```

**Version optimisée (production) :**
```bash
curl -X GET http://localhost:8000/api/dashboard/optimized
```

#### Routes disponibles

| Route | Méthode | Description | Usage |
|-------|---------|-------------|-------|
| `/api/dashboard` | GET | Version standard avec Eloquent | Développement |
| `/api/dashboard/optimized` | GET | Version optimisée avec vues DB | Production |

#### Réponse

```json
{
  "success": true,
  "data": {
    "overview": {
      "total_taches": {
        "value": 24,
        "in_progress": 8,
        "trend": {
          "percentage": 12.5,
          "trend": "up",
          "current": 24,
          "previous": 20
        }
      },
      "total_services": {
        "value": 15,
        "active": 12,
        "trend": {
          "percentage": 8.3,
          "trend": "up",
          "current": 15,
          "previous": 13
        }
      },
      "total_demandes": {
        "value": 8,
        "pending": 3,
        "trend": {
          "percentage": -12.5,
          "trend": "down",
          "current": 8,
          "previous": 10
        }
      },
      "total_documents": {
        "value": 3,
        "size_mb": 0.2,
        "trend": {
          "percentage": 25.0,
          "trend": "up",
          "current": 3,
          "previous": 2
        }
      },
      "entreprises": {
        "value": 5,
        "active": 4,
        "verified": 3,
        "trend": {
          "percentage": 0.0,
          "trend": "stable",
          "current": 5,
          "previous": 5
        }
      },
      "clients": {
        "value": 12,
        "active": 10,
        "trend": {
          "percentage": 20.0,
          "trend": "up",
          "current": 12,
          "previous": 10
        }
      },
      "agents_veryfy": {
        "value": 3,
        "active": 3,
        "trend": {
          "percentage": 0.0,
          "trend": "stable",
          "current": 3,
          "previous": 3
        }
      },
      "employes": {
        "value": 18,
        "active": 16,
        "trend": {
          "percentage": 12.5,
          "trend": "up",
          "current": 18,
          "previous": 16
        }
      }
    },
    "tasks_by_status": {
      "total": 24,
      "by_status": [
        {
          "status": "en_attente",
          "label": "À faire",
          "count": 4,
          "percentage": 16.7
        },
        {
          "status": "en_cours",
          "label": "En cours",
          "count": 8,
          "percentage": 33.3
        },
        {
          "status": "terminee",
          "label": "Terminées",
          "count": 10,
          "percentage": 41.7
        },
        {
          "status": "en_pause",
          "label": "En pause",
          "count": 1,
          "percentage": 4.2
        },
        {
          "status": "annulee",
          "label": "Annulées",
          "count": 1,
          "percentage": 4.2
        }
      ],
      "chart_data": {
        "labels": ["À faire", "En cours", "Terminées", "En pause", "Annulées"],
        "values": [4, 8, 10, 1, 1],
        "percentages": [16.7, 33.3, 41.7, 4.2, 4.2]
      }
    },
    "requests_by_status": {
      "total": 8,
      "by_status": [
        {
          "status": "en_attente",
          "label": "En attente",
          "count": 3,
          "percentage": 37.5
        },
        {
          "status": "en_cours",
          "label": "En cours",
          "count": 2,
          "percentage": 25.0
        },
        {
          "status": "payee",
          "label": "Payée",
          "count": 2,
          "percentage": 25.0
        },
        {
          "status": "terminee",
          "label": "Terminée",
          "count": 1,
          "percentage": 12.5
        },
        {
          "status": "annulee",
          "label": "Annulée",
          "count": 0,
          "percentage": 0.0
        }
      ],
      "chart_data": {
        "labels": ["En attente", "En cours", "Payée", "Terminée", "Annulée"],
        "values": [3, 2, 2, 1, 0],
        "percentages": [37.5, 25.0, 25.0, 12.5, 0.0]
      }
    },
    "employee_performance": {
      "employees": [
        {
          "id": 1,
          "nom": "Jean",
          "prenom": "Dupont",
          "performance": 93.0,
          "total_notes": 5,
          "taches_completed": 12
        },
        {
          "id": 2,
          "nom": "Marie",
          "prenom": "Martin",
          "performance": 90.0,
          "total_notes": 3,
          "taches_completed": 8
        }
      ],
      "chart_data": [
        {
          "name": "Jean Dupont",
          "performance": 93.0
        },
        {
          "name": "Marie Martin",
          "performance": 90.0
        }
      ]
    },
    "recent_activity": {
      "recent_tasks": [
        {
          "type": "task",
          "id": 1,
          "title": "Nettoyage bureau",
          "status": "en_cours",
          "entreprise": "Clean Corp",
          "client": "Client ABC",
          "created_at": "2023-09-21T10:00:00.000000Z"
        }
      ],
      "recent_demandes": [
        {
          "type": "demande",
          "id": 1,
          "title": "Besoin d'aide technique",
          "status": "en_attente",
          "client": "Client XYZ",
          "entreprise": "Tech Solutions",
          "agent": "Agent Alpha",
          "created_at": "2023-09-21T09:30:00.000000Z"
        }
      ],
      "combined": [
        {
          "type": "task",
          "id": 1,
          "title": "Nettoyage bureau",
          "status": "en_cours",
          "entreprise": "Clean Corp",
          "client": "Client ABC",
          "created_at": "2023-09-21T10:00:00.000000Z"
        }
      ]
    },
    "storage_stats": {
      "total_size_bytes": 209715,
      "total_size_mb": 0.2,
      "by_type": {
        "rccm": {
          "count": 1,
          "size": 104857,
          "size_mb": 0.1
        },
        "photo": {
          "count": 2,
          "size": 104858,
          "size_mb": 0.1
        }
      },
      "by_entity": {
        "App\\Models\\Entreprise": {
          "count": 1,
          "size": 104857,
          "size_mb": 0.1
        },
        "App\\Models\\Tache": {
          "count": 2,
          "size": 104858,
          "size_mb": 0.1
        }
      },
      "average_size_mb": 0.07
    }
  }
}
```

#### Structure des données

| Section | Description |
|---------|-------------|
| `overview` | Statistiques générales (cartes du haut) |
| `tasks_by_status` | Répartition des tâches par statut |
| `requests_by_status` | Répartition des demandes par statut |
| `employee_performance` | Performance des employés (top 10) |
| `recent_activity` | Activité récente (tâches et demandes) |
| `storage_stats` | Statistiques de stockage des documents |

#### Métriques de tendance

Chaque métrique inclut une tendance calculée sur 30 jours :
- `percentage` : Pourcentage de variation
- `trend` : Direction ("up", "down", "stable")
- `current` : Valeur actuelle
- `previous` : Valeur précédente

#### Structure de la réponse optimisée

La réponse de l'API optimisée est identique à la version standard, mais générée beaucoup plus rapidement grâce aux vues de base de données.

#### Exemple de réponse optimisée

```json
{
  "success": true,
  "data": {
    "overview": {
      "taches": {
        "value": 24,
        "active_count": 8,
        "trend": {
          "percentage": 12.5,
          "trend": "up",
          "current": 24,
          "previous": 20
        }
      },
      "services": {
        "value": 15,
        "active_count": 12,
        "trend": {
          "percentage": 8.3,
          "trend": "up",
          "current": 15,
          "previous": 13
        }
      }
    },
    "tasks_by_status": {
      "total": 24,
      "by_status": [
        {
          "status": "en_cours",
          "label": "En cours",
          "count": 8,
          "percentage": 33.3
        }
      ],
      "chart_data": {
        "labels": ["En cours", "Terminées", "À faire"],
        "values": [8, 10, 4],
        "percentages": [33.3, 41.7, 16.7]
      }
    },
    "employee_performance": {
      "employees": [
        {
          "id": 1,
          "nom": "Dupont",
          "prenom": "Jean",
          "performance": 93.0,
          "total_notes": 5,
          "taches_completed": 12
        }
      ]
    },
    "recent_activity": {
      "recent_tasks": [...],
      "recent_demandes": [...],
      "combined": [...]
    },
    "storage_stats": {
      "total_size_bytes": 209715,
      "total_size_mb": 0.2,
      "by_type": {...},
      "by_entity": {...},
      "average_size_mb": 0.07
    },
    "verified_stats": {
      "total_entreprises": 5,
      "verified_count": 3,
      "active_count": 4,
      "verification_rate": 60.0
    }
  },
  "meta": {
    "optimized": true,
    "source": "database_views",
    "query_count": 7
  }
}
```

#### Métadonnées de performance

La réponse inclut des métadonnées spécifiques à la version optimisée :

| Champ | Type | Description |
|-------|------|-------------|
| `optimized` | boolean | `true` pour indiquer l'utilisation des vues |
| `source` | string | `"database_views"` pour identifier la source |
| `query_count` | integer | Nombre de requêtes SQL exécutées (7) |

#### Maintenance des vues

Les vues de base de données sont automatiquement mises à jour lorsque les données sources changent. Aucune intervention manuelle n'est requise.

**Pour recréer les vues** (si nécessaire) :
```bash
php artisan migrate:refresh --path=database/migrations/2025_10_11_224413_create_dashboard_views.php
```

---

## Documents (Gestion Admin)

### Vue d'ensemble

L'API de gestion des documents permet aux administrateurs de visualiser, filtrer et supprimer tous les documents de la plateforme de manière centralisée.

> **Note :** Toutes les réponses utilisent `DocumentResource` pour une structure cohérente des données.

#### Structure de DocumentResource

| Champ | Type | Description |
|-------|------|-------------|
| `id` | integer | ID du document |
| `documentable_type` | string | Type d'entité propriétaire (App\Models\Entreprise, etc.) |
| `documentable_id` | integer | ID de l'entité propriétaire |
| `type_document` | string | Type de document (rccm, nif, certificat, photo, etc.) |
| `chemin_fichier` | string | Chemin du fichier avec préfixe "storage/" |
| `extension` | string | Extension du fichier (pdf, jpg, png, etc.) |
| `taille_fichier` | integer | Taille en octets |
| `taille_fichier_mb` | float | Taille en mégaoctets (MB) |
| `description` | string | Description du document |
| `created_at` | string | Date de création (format: Y-m-d H:i:s) |
| `updated_at` | string | Date de mise à jour (format: Y-m-d H:i:s) |
| `documentable` | object | Entité propriétaire (si relation chargée) |

#### Structure de l'entité documentable

| Champ | Type | Description |
|-------|------|-------------|
| `type` | string | Type simplifié (Entreprise, Tache, Agent, etc.) |
| `id` | integer | ID de l'entité |
| `nom` | string | Nom de l'entité |
| `prenom` | string\|null | Prénom (pour Client, Agent, Employer) |
| `email` | string | Email de l'entité |

---

### 1. Lister tous les documents

**Endpoint :** `GET /api/documents`

**Description :** Récupère la liste paginée de tous les documents de la plateforme avec filtrage optionnel.

#### Paramètres de requête (optionnels)

| Paramètre | Type | Description |
|-----------|------|-------------|
| `page` | integer | Numéro de page (défaut: 1) |
| `per_page` | integer | Nombre d'éléments par page (défaut: 15) |
| `type_document` | string | Filtrer par type de document (rccm, nif, certificat, photo, etc.) |
| `documentable_type` | string | Filtrer par type d'entité (App\Models\Entreprise, App\Models\Tache, etc.) |

#### Exemple de requête

```bash
# Lister tous les documents
curl -X GET "http://localhost:8000/api/documents?page=1&per_page=20"

# Filtrer par type de document
curl -X GET "http://localhost:8000/api/documents?type_document=rccm"

# Filtrer par type d'entité
curl -X GET "http://localhost:8000/api/documents?documentable_type=App\Models\Entreprise"
```

#### Réponse

> **Note :** Cette API utilise `DocumentResource` pour retourner des données structurées avec le préfixe "storage/" pour les chemins de fichiers et la taille en MB.

```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "documentable_type": "App\\Models\\Entreprise",
        "documentable_id": 5,
        "type_document": "rccm",
        "chemin_fichier": "storage/documents/entreprises/5/1234567890_rccm.pdf",
        "extension": "pdf",
        "taille_fichier": 245760,
        "taille_fichier_mb": 0.23,
        "description": "Document RCCM de l'entreprise",
        "created_at": "2023-09-21 12:00:00",
        "updated_at": "2023-09-21 12:00:00",
        "documentable": {
          "type": "Entreprise",
          "id": 5,
          "nom": "Mon Entreprise SARL",
          "prenom": null,
          "email": "contact@entreprise.com"
        }
      }
    ],
    "first_page_url": "http://localhost:8000/api/documents?page=1",
    "from": 1,
    "last_page": 10,
    "per_page": 15,
    "to": 15,
    "total": 150
  }
}
```

---

### 2. Détails d'un document

**Endpoint :** `GET /api/documents/{id}`

**Description :** Récupère les détails complets d'un document spécifique avec l'entité propriétaire.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID du document |

#### Exemple de requête

```bash
curl -X GET http://localhost:8000/api/documents/1
```

#### Réponse

```json
{
  "success": true,
  "data": {
    "id": 1,
    "documentable_type": "App\\Models\\Entreprise",
    "documentable_id": 5,
    "type_document": "rccm",
    "chemin_fichier": "storage/documents/entreprises/5/1234567890_rccm.pdf",
    "extension": "pdf",
    "taille_fichier": 245760,
    "taille_fichier_mb": 0.23,
    "description": "Document RCCM de l'entreprise",
    "created_at": "2023-09-21 12:00:00",
    "updated_at": "2023-09-21 12:00:00",
    "documentable": {
      "type": "Entreprise",
      "id": 5,
      "nom": "Mon Entreprise SARL",
      "prenom": null,
      "email": "contact@entreprise.com"
    }
  }
}
```

---

### 3. Supprimer un document

**Endpoint :** `DELETE /api/documents/{id}`

**Description :** Supprime définitivement un document (fichier physique + enregistrement BDD).

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID du document |

#### Exemple de requête

```bash
curl -X DELETE http://localhost:8000/api/documents/1
```

#### Réponse

```json
{
  "success": true,
  "message": "Document supprimé avec succès"
}
```

#### Mécanisme de suppression

La suppression se fait en **2 étapes** :

1. **Suppression du fichier physique** :
   ```
   Chemin en BDD : "documents/entreprises/1/fichier.pdf"
                        ↓
   Storage::disk('public')->delete(...)
                        ↓
   Fichier supprimé : storage/app/public/documents/entreprises/1/fichier.pdf
   ```

2. **Suppression de l'enregistrement** : L'enregistrement est supprimé de la table `documents`

> **Note importante :** `Storage::disk('public')` pointe automatiquement vers `storage/app/public/`. Le chemin enregistré en base de données (`documents/entreprises/1/fichier.pdf`) est donc correct et la suppression se fait bien dans le bon dossier.

---

### 4. Documents par type d'entité

**Endpoint :** `GET /api/documents/entity/{entityType}`

**Description :** Récupère tous les documents d'un type d'entité spécifique (entreprises, tâches, agents, clients, services).

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `entityType` | string | ✅ | Type d'entité (`entreprises`, `taches`, `agents`, `clients`, `services`) |

#### Paramètres de requête

| Paramètre | Type | Description |
|-----------|------|-------------|
| `page` | integer | Numéro de page (défaut: 1) |
| `per_page` | integer | Nombre d'éléments par page (défaut: 15) |

#### Exemple de requête

```bash
# Documents des entreprises
curl -X GET "http://localhost:8000/api/documents/entity/entreprises"

# Documents des tâches
curl -X GET "http://localhost:8000/api/documents/entity/taches"

# Documents des agents
curl -X GET "http://localhost:8000/api/documents/entity/agents"
```

#### Réponse

```json
{
  "success": true,
  "data": {
    "entity_type": "entreprises",
    "documents": {
      "current_page": 1,
      "data": [
        {
          "id": 1,
          "documentable_type": "App\\Models\\Entreprise",
          "documentable_id": 5,
          "type_document": "rccm",
          "chemin_fichier": "storage/documents/entreprises/5/rccm.pdf",
          "extension": "pdf",
          "taille_fichier": 245760,
          "taille_fichier_mb": 0.23,
          "description": "Document RCCM",
          "created_at": "2023-09-21 12:00:00",
          "updated_at": "2023-09-21 12:00:00",
          "documentable": {
            "type": "Entreprise",
            "id": 5,
            "nom": "Mon Entreprise SARL",
            "prenom": null,
            "email": "contact@entreprise.com"
          }
        }
      ],
      "total": 135
    }
  }
}
```

---

### 5. Statistiques des documents

**Endpoint :** `GET /api/documents/statistics`

**Description :** Récupère les statistiques globales des documents de la plateforme (nombre total, répartition par type, taille totale).

#### Exemple de requête

```bash
curl -X GET http://localhost:8000/api/documents/statistics
```

#### Réponse

```json
{
  "success": true,
  "data": {
    "total_documents": 245,
    "par_type": [
      {
        "type_document": "rccm",
        "total": 45
      },
      {
        "type_document": "nif",
        "total": 45
      },
      {
        "type_document": "certificat",
        "total": 67
      },
      {
        "type_document": "photo",
        "total": 55
      },
      {
        "type_document": "autre",
        "total": 33
      }
    ],
    "par_entite": [
      {
        "documentable_type": "Entreprise",
        "total": 135
      },
      {
        "documentable_type": "Tache",
        "total": 78
      },
      {
        "documentable_type": "Service",
        "total": 32
      }
    ],
    "taille_totale": 125829120,
    "taille_totale_mb": 120.0
  }
}
```

#### Description des statistiques

| Champ | Type | Description |
|-------|------|-------------|
| `total_documents` | integer | Nombre total de documents dans la plateforme |
| `par_type` | array | Répartition des documents par type (rccm, nif, certificat, etc.) |
| `par_entite` | array | Répartition des documents par type d'entité (Entreprise, Tache, etc.) |
| `taille_totale` | integer | Taille totale en octets |
| `taille_totale_mb` | float | Taille totale en mégaoctets (MB) |

---

## Gestion des documents (Spécifiques aux entités)

### Documents pour les tâches

#### Ajouter un document à une tâche
**Endpoint :** `POST /api/taches/{id}/documents`

**Content-Type :** `multipart/form-data`

**Paramètres :**
- `document` (fichier requis)
- `description` (optionnel)

#### Supprimer un document d'une tâche
**Endpoint :** `DELETE /api/taches/{tacheId}/documents/{documentId}`

#### Récupérer les documents d'une tâche
**Endpoint :** `GET /api/taches/{id}/documents`

### Documents pour les entreprises

#### Ajouter des documents à une entreprise
**Endpoint :** `POST /api/entreprises/{id}/documents`

**Content-Type :** `multipart/form-data`

**Paramètres :**
- `documents[]` (fichiers requis, min 1)
- `document_types[]` (optionnel, détection automatique si non fourni)

#### Supprimer un document d'une entreprise
**Endpoint :** `DELETE /api/entreprises/{id}/documents/{documentId}`

#### Récupérer les documents d'une entreprise
Les documents d'une entreprise sont automatiquement inclus dans la réponse des endpoints :
- `GET /api/entreprises/{id}` (détails d'une entreprise)
- `POST /api/auth/entreprises/register` (inscription avec documents)

---

## Réclamations

### Vue d'ensemble

Le système de réclamations permet aux clients, entreprises et agents de faire des réclamations sur la plateforme. Les administrateurs peuvent gérer et suivre ces réclamations avec des statuts et priorités.

#### Types de réclamations supportés

| Type | Description |
|------|-------------|
| **Client** | Les clients peuvent faire des réclamations |
| **Entreprise** | Les entreprises peuvent faire des réclamations |
| **Agent** | Les agents Veryfy peuvent faire des réclamations |

#### Statuts de réclamation

| Statut | Description |
|--------|-------------|
| **En attente** | Réclamation créée, en attente de traitement |
| **En cours** | Réclamation en cours de traitement |
| **Résolue** | Réclamation traitée et résolue |
| **Rejetée** | Réclamation rejetée (avec justification) |

#### Niveaux de priorité

| Priorité | Description |
|----------|-------------|
| **Faible** | Réclamations non urgentes |
| **Moyenne** | Réclamations standard (par défaut) |
| **Haute** | Réclamations importantes |
| **Critique** | Réclamations urgentes nécessitant une attention immédiate |

---

### 1. Lister les réclamations

**Endpoint :** `GET /api/reclamations`

**Description :** Récupère la liste paginée des réclamations avec filtrage et tri.

#### Paramètres de requête (optionnels)

| Paramètre | Type | Description |
|-----------|------|-------------|
| `page` | integer | Numéro de page (défaut: 1) |
| `per_page` | integer | Nombre d'éléments par page (défaut: 15) |
| `statut` | string | Filtrer par statut (en_attente, en_cours, resolue, rejetee) |
| `priorite` | string | Filtrer par priorité (faible, moyenne, haute, critique) |
| `type_reclamation` | string | Filtrer par type (client, entreprise, agent) |
| `reclamant_id` | integer | Filtrer par ID du réclamant |
| `sort_by` | string | Champ de tri (défaut: date_creation) |
| `sort_order` | string | Ordre de tri (asc, desc - défaut: desc) |

#### Exemple de requête

```bash
# Lister toutes les réclamations
curl -X GET "http://localhost:8000/api/reclamations?page=1&per_page=20"

# Filtrer par statut et priorité
curl -X GET "http://localhost:8000/api/reclamations?statut=en_attente&priorite=critique"

# Filtrer par type de réclamant
curl -X GET "http://localhost:8000/api/reclamations?type_reclamation=client"
```

#### Réponse

```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "type_reclamation": "client",
        "reclamant_id": 5,
        "objet_reclamation": "Problème avec un service",
        "description": "Le service n'a pas été effectué selon les spécifications",
        "statut": "en_attente",
        "priorite": "haute",
        "date_creation": "2023-10-18T10:00:00.000000Z",
        "date_resolution": null,
        "resolution_notes": null,
        "created_at": "2023-10-18T10:00:00.000000Z",
        "updated_at": "2023-10-18T10:00:00.000000Z",
        "client": {
          "id": 5,
          "nom": "Dupont",
          "prenom": "Marie",
          "email": "marie.dupont@email.com"
        },
        "entreprise": null,
        "agent": null
      }
    ],
    "first_page_url": "http://localhost:8000/api/reclamations?page=1",
    "from": 1,
    "last_page": 5,
    "last_page_url": "http://localhost:8000/api/reclamations?page=5",
    "links": [...],
    "next_page_url": "http://localhost:8000/api/reclamations?page=2",
    "path": "http://localhost:8000/api/reclamations",
    "per_page": 15,
    "prev_page_url": null,
    "to": 15,
    "total": 75
  }
}
```

---

### 2. Créer une réclamation

**Endpoint :** `POST /api/reclamations`

**Description :** Crée une nouvelle réclamation.

**Content-Type :** `application/json`

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `type_reclamation` | string | ✅ | Type de réclamant (client, entreprise, agent) |
| `reclamant_id` | integer | ✅ | ID du réclamant selon le type |
| `objet_reclamation` | string | ✅ | Objet de la réclamation (max 255 caractères) |
| `description` | string | ✅ | Description détaillée de la réclamation |
| `priorite` | string | ❌ | Priorité (faible, moyenne, haute, critique - défaut: moyenne) |

#### Exemple de requête

```bash
curl -X POST http://localhost:8000/api/reclamations \
  -H "Content-Type: application/json" \
  -d '{
    "type_reclamation": "client",
    "reclamant_id": 5,
    "objet_reclamation": "Problème avec un service",
    "description": "Le service n'a pas été effectué selon les spécifications convenues",
    "priorite": "haute"
  }'
```

#### Réponse

```json
{
  "success": true,
  "message": "Réclamation créée avec succès",
  "data": {
    "id": 1,
    "type_reclamation": "client",
    "reclamant_id": 5,
    "objet_reclamation": "Problème avec un service",
    "description": "Le service n'a pas été effectué selon les spécifications convenues",
    "statut": "en_attente",
    "priorite": "haute",
    "date_creation": "2023-10-18T10:00:00.000000Z",
    "date_resolution": null,
    "resolution_notes": null,
    "created_at": "2023-10-18T10:00:00.000000Z",
    "updated_at": "2023-10-18T10:00:00.000000Z",
    "client": {
      "id": 5,
      "nom": "Dupont",
      "prenom": "Marie",
      "email": "marie.dupont@email.com"
    },
    "entreprise": null,
    "agent": null
  }
}
```

---

### 3. Détails d'une réclamation

**Endpoint :** `GET /api/reclamations/{id}`

**Description :** Récupère les détails complets d'une réclamation.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID de la réclamation |

#### Exemple de requête

```bash
curl -X GET http://localhost:8000/api/reclamations/1
```

#### Réponse

```json
{
  "success": true,
  "data": {
    "id": 1,
    "type_reclamation": "client",
    "reclamant_id": 5,
    "objet_reclamation": "Problème avec un service",
    "description": "Le service n'a pas été effectué selon les spécifications convenues",
    "statut": "en_attente",
    "priorite": "haute",
    "date_creation": "2023-10-18T10:00:00.000000Z",
    "date_resolution": null,
    "resolution_notes": null,
    "created_at": "2023-10-18T10:00:00.000000Z",
    "updated_at": "2023-10-18T10:00:00.000000Z",
    "client": {
      "id": 5,
      "nom": "Dupont",
      "prenom": "Marie",
      "email": "marie.dupont@email.com",
      "telephone": "+225 07 12 34 56 78"
    },
    "entreprise": null,
    "agent": null
  }
}
```

---

### 4. Modifier une réclamation

**Endpoint :** `PUT /api/reclamations/{id}`

**Description :** Met à jour le statut et les informations d'une réclamation.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID de la réclamation |

#### Body (JSON)

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `statut` | string | ❌ | Nouveau statut (en_attente, en_cours, resolue, rejetee) |
| `priorite` | string | ❌ | Nouvelle priorité (faible, moyenne, haute, critique) |
| `resolution_notes` | string | ❌ | Notes de résolution |

#### Exemple de requête

```bash
curl -X PUT http://localhost:8000/api/reclamations/1 \
  -H "Content-Type: application/json" \
  -d '{
    "statut": "en_cours",
    "priorite": "critique",
    "resolution_notes": "Réclamation prise en charge par l'équipe technique"
  }'
```

#### Réponse

```json
{
  "success": true,
  "message": "Réclamation mise à jour avec succès",
  "data": {
    "id": 1,
    "type_reclamation": "client",
    "reclamant_id": 5,
    "objet_reclamation": "Problème avec un service",
    "description": "Le service n'a pas été effectué selon les spécifications convenues",
    "statut": "en_cours",
    "priorite": "critique",
    "date_creation": "2023-10-18T10:00:00.000000Z",
    "date_resolution": null,
    "resolution_notes": "Réclamation prise en charge par l'équipe technique",
    "created_at": "2023-10-18T10:00:00.000000Z",
    "updated_at": "2023-10-18T11:30:00.000000Z",
    "client": {
      "id": 5,
      "nom": "Dupont",
      "prenom": "Marie",
      "email": "marie.dupont@email.com"
    },
    "entreprise": null,
    "agent": null
  }
}
```

#### Mise à jour automatique de la date de résolution

Lorsque le statut change vers `resolue` ou `rejetee`, la `date_resolution` est automatiquement mise à jour avec l'heure actuelle.

---

### 5. Supprimer une réclamation

**Endpoint :** `DELETE /api/reclamations/{id}`

**Description :** Supprime définitivement une réclamation.

#### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | integer | ✅ | ID de la réclamation |

#### Exemple de requête

```bash
curl -X DELETE http://localhost:8000/api/reclamations/1
```

#### Réponse

```json
{
  "success": true,
  "message": "Réclamation supprimée avec succès"
}
```

---

### 6. Statistiques des réclamations

**Endpoint :** `GET /api/reclamations/statistics`

**Description :** Récupère les statistiques globales des réclamations.

#### Exemple de requête

```bash
curl -X GET http://localhost:8000/api/reclamations/statistics
```

#### Réponse

```json
{
  "success": true,
  "data": {
    "total": 75,
    "en_attente": 15,
    "en_cours": 25,
    "resolues": 30,
    "rejetees": 5,
    "par_priorite": {
      "faible": 10,
      "moyenne": 35,
      "haute": 25,
      "critique": 5
    },
    "par_type": {
      "client": 45,
      "entreprise": 20,
      "agent": 10
    }
  }
}
```

#### Description des statistiques

| Champ | Type | Description |
|-------|------|-------------|
| `total` | integer | Nombre total de réclamations |
| `en_attente` | integer | Réclamations en attente |
| `en_cours` | integer | Réclamations en cours |
| `resolues` | integer | Réclamations résolues |
| `rejetees` | integer | Réclamations rejetées |
| `par_priorite` | object | Répartition par priorité |
| `par_type` | object | Répartition par type de réclamant |

---

### Fonctionnalités avancées

#### Validation automatique des réclamants

Le système vérifie automatiquement que le réclamant existe selon le type spécifié :
- **Client** : Vérifie l'existence dans la table `clients`
- **Entreprise** : Vérifie l'existence dans la table `entreprises`
- **Agent** : Vérifie l'existence dans la table `agents`

#### Relations polymorphes

Les réclamations utilisent des relations polymorphes pour lier le réclamant :
- `type_reclamation` : Type du réclamant (client, entreprise, agent)
- `reclamant_id` : ID du réclamant dans sa table respective

#### Filtrage et tri

- **Filtrage** : Par statut, priorité, type et réclamant
- **Tri** : Par date de création, statut, priorité
- **Pagination** : Support complet avec métadonnées

#### Gestion des statuts

- **Transition automatique** : Mise à jour de `date_resolution` lors du changement de statut
- **Notes de résolution** : Possibilité d'ajouter des commentaires lors de la résolution
- **Historique** : Suivi complet des modifications

---

## Statistiques des Entreprises

### Vue d'ensemble

Le système de statistiques des entreprises fournit une analyse complète des performances et activités de toutes les entreprises de la plateforme. Il utilise des vues de base de données optimisées pour des requêtes rapides et des calculs automatiques de métriques.

#### Types de statistiques disponibles

| Type | Description |
|------|-------------|
| **Générales** | Vue d'ensemble de toutes les entreprises |
| **Paiements** | Analyse des transactions financières |
| **Tâches** | Performance et completion des tâches |
| **Services** | Analyse des services proposés |
| **Employés** | Statistiques des équipes |
| **Notes** | Évaluations et réputation |
| **Réclamations** | Gestion des réclamations |
| **Documents** | Gestion documentaire |

### Endpoints disponibles

#### 1. Statistiques générales

**GET** `/api/entreprise-statistics/generales`

Retourne les statistiques globales de la plateforme.

**Paramètres de requête :** Aucun

**Exemple de requête :**
```bash
curl -X GET "http://localhost:8000/api/entreprise-statistics/generales"
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "total_entreprises": 150,
    "entreprises_verifiees": 120,
    "entreprises_actives": 145,
    "total_employes_globaux": 1250,
    "total_services_globaux": 890,
    "total_taches_globales": 2100,
    "total_paiements_globaux": 3400,
    "montant_total_global": "125000.00",
    "note_moyenne_globale": "4.2",
    "total_reclamations_globales": 45
  }
}
```

#### 2. Liste des entreprises avec filtres

**GET** `/api/entreprise-statistics/`

Retourne la liste des entreprises avec leurs statistiques, avec filtrage et pagination.

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `verifie` | boolean | Filtrer par statut de vérification |
| `actif` | boolean | Filtrer par statut actif |
| `secteur_activite` | string | Filtrer par secteur d'activité |
| `ville` | string | Filtrer par ville |
| `badge_fiabilite` | string | Filtrer par badge de fiabilité |
| `sort_by` | string | Champ de tri (défaut: montant_total) |
| `sort_order` | string | Ordre de tri (asc/desc, défaut: desc) |
| `per_page` | integer | Nombre d'éléments par page (défaut: 15) |
| `page` | integer | Numéro de page |

**Exemple de requête :**
```bash
curl -X GET "http://localhost:8000/api/entreprise-statistics/?verifie=true&secteur_activite=construction&sort_by=note_moyenne&sort_order=desc&per_page=20"
```

#### 3. Top des entreprises

**GET** `/api/entreprise-statistics/top`

Retourne le top des entreprises selon un critère.

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `limit` | integer | Nombre d'entreprises à retourner (défaut: 10) |
| `critere` | string | Critère de classement (défaut: montant_total) |

**Critères disponibles :**
- `montant_total` - Par montant total des paiements
- `note_moyenne` - Par note moyenne
- `total_taches` - Par nombre de tâches
- `total_services` - Par nombre de services
- `total_employes` - Par nombre d'employés

**Exemple de requête :**
```bash
curl -X GET "http://localhost:8000/api/entreprise-statistics/top?limit=5&critere=note_moyenne"
```

#### 4. Statistiques par secteur

**GET** `/api/entreprise-statistics/par-secteur`

Retourne les statistiques agrégées par secteur d'activité.

**Exemple de requête :**
```bash
curl -X GET "http://localhost:8000/api/entreprise-statistics/par-secteur"
```

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "secteur_activite": "Construction",
      "nombre_entreprises": 45,
      "note_moyenne_secteur": "4.3",
      "montant_total_secteur": "75000.00",
      "total_taches_secteur": 890
    },
    {
      "secteur_activite": "Électricité",
      "nombre_entreprises": 32,
      "note_moyenne_secteur": "4.1",
      "montant_total_secteur": "45000.00",
      "total_taches_secteur": 650
    }
  ]
}
```

#### 5. Statistiques par ville

**GET** `/api/entreprise-statistics/par-ville`

Retourne les statistiques agrégées par ville.

**Exemple de requête :**
```bash
curl -X GET "http://localhost:8000/api/entreprise-statistics/par-ville"
```

#### 6. Statistiques des paiements

**GET** `/api/entreprise-statistics/paiements`

Retourne les statistiques détaillées des paiements par entreprise.

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `entreprise_id` | integer | Filtrer par ID d'entreprise |
| `min_montant` | decimal | Montant minimum |
| `max_montant` | decimal | Montant maximum |
| `sort_by` | string | Champ de tri (défaut: montant_total) |
| `sort_order` | string | Ordre de tri (asc/desc, défaut: desc) |
| `per_page` | integer | Nombre d'éléments par page |

**Exemple de requête :**
```bash
curl -X GET "http://localhost:8000/api/entreprise-statistics/paiements?min_montant=1000&sort_by=montant_total&sort_order=desc"
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "entreprise_id": 1,
        "nom": "Entreprise ABC",
        "email": "contact@abc.com",
        "total_paiements": 25,
        "montant_total": "15000.00",
        "paiements_valides": 23,
        "paiements_en_attente": 2,
        "paiements_echoues": 0,
        "paiements_rembourses": 0,
        "montant_valide": "14500.00",
        "montant_en_attente": "500.00",
        "montant_echoue": "0.00",
        "montant_rembourse": "0.00",
        "mobile_money_count": 15,
        "banque_transfert_count": 8,
        "carte_bancaire_count": 2,
        "especes_count": 0,
        "demande_agent_count": 5,
        "service_count": 18,
        "abonnement_count": 2,
        "prestation_count": 0,
        "taux_conversion": "92.00",
        "moyenne_paiement": "630.43"
      }
    ]
  }
}
```

#### 7. Statistiques des tâches

**GET** `/api/entreprise-statistics/taches`

Retourne les statistiques des tâches par entreprise.

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `entreprise_id` | integer | Filtrer par ID d'entreprise |
| `min_taches` | integer | Nombre minimum de tâches |
| `max_taches` | integer | Nombre maximum de tâches |
| `sort_by` | string | Champ de tri (défaut: total_taches) |
| `sort_order` | string | Ordre de tri (asc/desc, défaut: desc) |

**Exemple de requête :**
```bash
curl -X GET "http://localhost:8000/api/entreprise-statistics/taches?min_taches=10&sort_by=taux_completion&sort_order=desc"
```

#### 8. Statistiques des services

**GET** `/api/entreprise-statistics/services`

Retourne les statistiques des services par entreprise.

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `entreprise_id` | integer | Filtrer par ID d'entreprise |
| `categorie` | string | Filtrer par catégorie de service |
| `actif` | boolean | Filtrer les services actifs uniquement |

**Exemple de requête :**
```bash
curl -X GET "http://localhost:8000/api/entreprise-statistics/services?categorie=électricité&actif=true"
```

#### 9. Statistiques des employés

**GET** `/api/entreprise-statistics/employes`

Retourne les statistiques des employés par entreprise.

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `entreprise_id` | integer | Filtrer par ID d'entreprise |
| `min_employes` | integer | Nombre minimum d'employés |
| `max_employes` | integer | Nombre maximum d'employés |

**Exemple de requête :**
```bash
curl -X GET "http://localhost:8000/api/entreprise-statistics/employes?min_employes=5&sort_by=note_moyenne_globale&sort_order=desc"
```

#### 10. Statistiques des notes

**GET** `/api/entreprise-statistics/notes`

Retourne les statistiques des notes et évaluations par entreprise.

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `entreprise_id` | integer | Filtrer par ID d'entreprise |
| `min_note` | decimal | Note minimum |
| `max_note` | decimal | Note maximum |

**Exemple de requête :**
```bash
curl -X GET "http://localhost:8000/api/entreprise-statistics/notes?min_note=4.0&sort_by=note_moyenne&sort_order=desc"
```

#### 11. Statistiques des réclamations

**GET** `/api/entreprise-statistics/reclamations`

Retourne les statistiques des réclamations par entreprise.

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `entreprise_id` | integer | Filtrer par ID d'entreprise |
| `min_reclamations` | integer | Nombre minimum de réclamations |
| `max_reclamations` | integer | Nombre maximum de réclamations |

**Exemple de requête :**
```bash
curl -X GET "http://localhost:8000/api/entreprise-statistics/reclamations?sort_by=taux_resolution&sort_order=desc"
```

#### 12. Statistiques des documents

**GET** `/api/entreprise-statistics/documents`

Retourne les statistiques des documents par entreprise.

**Paramètres de requête :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `entreprise_id` | integer | Filtrer par ID d'entreprise |
| `min_documents` | integer | Nombre minimum de documents |
| `max_documents` | integer | Nombre maximum de documents |

**Exemple de requête :**
```bash
curl -X GET "http://localhost:8000/api/entreprise-statistics/documents?sort_by=taille_totale_mb&sort_order=desc"
```

#### 13. Dashboard complet d'une entreprise

**GET** `/api/entreprise-statistics/dashboard/{entrepriseId}`

Retourne un dashboard complet avec toutes les statistiques d'une entreprise spécifique.

**Paramètres d'URL :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `entrepriseId` | integer | ID de l'entreprise |

**Exemple de requête :**
```bash
curl -X GET "http://localhost:8000/api/entreprise-statistics/dashboard/1"
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "overview": {
      "entreprise_id": 1,
      "nom": "Entreprise ABC",
      "email": "contact@abc.com",
      "verifie": true,
      "actif": true,
      "total_employes": 15,
      "employes_actifs": 14,
      "total_services": 8,
      "services_actifs": 7,
      "total_taches": 45,
      "taches_terminees": 38,
      "total_demandes": 12,
      "demandes_terminees": 10,
      "total_paiements": 25,
      "montant_total": "15000.00",
      "paiements_valides": 23,
      "note_moyenne": "4.2",
      "total_notes": 15,
      "total_documents": 8,
      "taille_documents_mb": "25.5",
      "total_reclamations": 2,
      "reclamations_resolues": 1
    },
    "paiements": {
      "total_paiements": 25,
      "montant_total": "15000.00",
      "taux_conversion": "92.00",
      "moyenne_paiement": "630.43"
    },
    "taches": {
      "total_taches": 45,
      "taches_terminees": 38,
      "taux_completion": "84.44",
      "employes_moyen": "2.5",
      "agents_moyen": "1.2"
    },
    "services": {
      "total_services": 8,
      "services_actifs": 7,
      "categories_count": 3,
      "prix_moyen": "1250.00"
    },
    "employes": {
      "total_employes": 15,
      "employes_actifs": 14,
      "note_moyenne_globale": "4.1",
      "taches_completees_total": 120
    },
    "notes": {
      "total_notes": 15,
      "note_moyenne": "4.2",
      "pourcentage_5_etoiles": "60.00",
      "pourcentage_4_etoiles": "33.33",
      "pourcentage_3_etoiles": "6.67"
    },
    "reclamations": {
      "total_reclamations": 2,
      "reclamations_resolues": 1,
      "taux_resolution": "50.00",
      "temps_moyen_resolution": "3.5"
    },
    "documents": {
      "total_documents": 8,
      "taille_totale_mb": "25.5",
      "types_count": 4
    }
  }
}
```

#### 14. Statistiques d'une entreprise spécifique

**GET** `/api/entreprise-statistics/{entrepriseId}`

Retourne les statistiques d'ensemble d'une entreprise spécifique.

**Paramètres d'URL :**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `entrepriseId` | integer | ID de l'entreprise |

**Exemple de requête :**
```bash
curl -X GET "http://localhost:8000/api/entreprise-statistics/1"
```

### Codes de réponse

| Code | Description |
|------|-------------|
| `200` | Succès |
| `404` | Entreprise non trouvée |
| `500` | Erreur serveur |

### Gestion des erreurs

Toutes les erreurs retournent une réponse JSON avec la structure suivante :

```json
{
  "success": false,
  "message": "Description de l'erreur",
  "error": "Détails techniques de l'erreur"
}
```

### Notes importantes

- Toutes les statistiques sont calculées en temps réel à partir des vues de base de données
- Les vues sont optimisées pour des performances maximales
- La pagination est disponible sur tous les endpoints de liste
- Les filtres peuvent être combinés pour des requêtes complexes
- Les statistiques incluent des calculs automatiques de ratios et pourcentages

---

*Cette documentation sera mise à jour au fur et à mesure de l'ajout de nouvelles API.*
