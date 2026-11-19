# Activation du Showroom

## Configuration nécessaire

1. Exécuter `supabase/migrations/202611190001_showroom.sql` dans le SQL Editor du projet Supabase, ou via `supabase db push` si le projet CLI est lié. La migration est transactionnelle et peut être rejouée.
2. Ajouter `SUPABASE_SERVICE_ROLE_KEY` à l'environnement serveur (`.env.local` pour le développement, variables serveur de l'hébergeur pour la production). Ne jamais utiliser un préfixe `NEXT_PUBLIC_` pour cette clé. Le client serveur privilégié existant du projet est réutilisé.
3. Relancer l'application. La publication est refusée tant que cette clé manque.

La migration ajoute les réglages à `vehicles`, les choix de visibilité à `entries`, une fonction de sauvegarde atomique et les protections de lecture RLS sur les tables brutes. Elle nécessite les tables déjà existantes `vehicles`, `entries`, `event_files`.

Les requêtes publiques passent par le serveur, qui produit une liste explicite de champs autorisés. Le rôle privilégié ne sert qu'aux lectures publiques vérifiant `is_public`. Les mutations et l'aperçu utilisent la session du propriétaire. Les images publiques passent par un proxy sans cache pour contrôler publication et visibilité à chaque requête. Un fichier déjà téléchargé par un visiteur ne peut évidemment pas être révoqué sur son appareil.

## Routes

- `/garage/[vehicleSlug]/showroom` : aperçu privé, personnalisation, partage.
- `/s/[token]` : dossier public, URL opaque permanente, sans indexation.
- `/api/showroom/[token]/media` : images autorisées uniquement, jamais les factures.

## Pièces jointes et galerie

Les pièces jointes historiques n'ont pas de type métier permettant de distinguer une facture scannée d'une photo. Toutes restent donc des cartes privées par défaut ; le propriétaire sélectionne explicitement les images à partager comme photos. Les PDF ne peuvent pas devenir des photos publiques. Aucun nom de fichier ni URL originale de justificatif privé n'est transmis au visiteur.

La galerie utilise le bucket privé existant `vehicle-media`, sous `<owner>/<vehicle>/showroom-gallery/<uuid>.<extension>`. Les règles d'upload existantes doivent autoriser le propriétaire à écrire dans ce dossier, comme dans `cover-image` et `event-documents`. Limite de l'interface : 20 photos, 10 Mo par photo. Retirer une photo retire sa publication ; les fichiers sont conservés dans le stockage et supprimés lors de la suppression complète du véhicule.

## Vérification manuelle après activation

- Propriétaire : ouvrir Showroom depuis le garage, personnaliser, publier et copier le lien.
- Fenêtre privée : ouvrir le lien sans compte ; vérifier masquage VIN/montants/notes, absence des événements exclus et absence de requêtes vers les documents privés.
- Ajouter un événement sur un showroom publié : répondre Afficher/Garder privé, mémoriser puis modifier la préférence dans Personnaliser.
- Dépublier : vérifier que le lien et une URL de média copiée renvoient 404 pour un visiteur ; republier avec le même lien.
- Autre compte : vérifier qu'il ne peut ni voir l'aperçu ni modifier les réglages du véhicule.

## Vérifications locales

`npm test`, `npx tsc --noEmit`, `npm run build`. Le build Next télécharge la police Google Lexend. Le lint global contient des erreurs préexistantes dans d'autres composants ; les fichiers ajoutés et modifiés pour le showroom sont vérifiés séparément.

Le contrôle SQL peut être reproduit sans base distante ni dépendance ajoutée au projet :

```sh
npm install --prefix /tmp/vintrace-db-check --no-save @electric-sql/pglite
PGLITE_MODULE_PATH=file:///tmp/vintrace-db-check/node_modules/@electric-sql/pglite/dist/index.js npm run test:db
```

Il crée une base éphémère avec un schéma minimal et vérifie la migration rejouable, les protections RLS, la sauvegarde atomique et la préférence de visibilité. Il ne valide pas les policies Storage déjà installées sur le vrai projet.

Après un build, lancer `npm run start -- --port 8766` puis `npm run test:http` pour vérifier les routes anonymes et le rejet du proxy de médias par l'optimiseur Next. Les images locales `/images/**` restent optimisables.

Validation effectuée le 19 novembre 2026 : 4 tests de projection/visibilité, 7 contrôles SQL dans PostgreSQL embarqué, 5 contrôles HTTP, TypeScript et build réussis ; lint ciblé sans erreur. Le lint global reste en échec avec 33 erreurs et 6 avertissements préexistants dans les autres fichiers. Le parcours réel a ensuite été vérifié : voir l’état d’activation ci-dessous.

## État de l’activation distante

Le 19 novembre 2026, la migration a été exécutée sur le projet `twehizpuhmnhkfmdkqmr` avec succès. Après accord explicite du propriétaire, la clé secrète existante `default` a été configurée dans `.env.local` sous `SUPABASE_SERVICE_ROLE_KEY`. Le fichier est ignoré par Git et protégé en mode 600. Aucun secret n'a été affiché en clair dans le chat.

Vérifications sur la vraie base : accès serveur valide, lectures anonymes des trois tables privées bloquées, sauvegarde anonyme refusée. Le test complet via le build local a vérifié aperçu propriétaire, refus avant publication, contenu public filtré, image sans cache, pièce jointe privée inaccessible, révocation de la page et du média après dépublication, puis republication avec le même lien. Le compte, le véhicule, les événements et l'image temporaires ont été supprimés. Aucun véhicule préexistant n'a été publié ou modifié.

Pour reproduire ce test : démarrer le build sur le port 8766 puis lancer `npm run test:e2e`. Attention : ce test crée un compte et un dossier temporaires sur la base configurée dans `.env.local`, puis les supprime. Il ne fait pas partie de `npm test`.

L'environnement de production hébergé et le déploiement ne sont pas modifiés par cette configuration locale.

## Présentation du showroom

La présentation reprend la maquette claire : couverture et identité côte à côte sur ordinateur, empilées sur téléphone ; historique sur fond blanc et archives privées sur fond sombre. Le showroom possède son propre pied de page et masque la navigation globale du garage. Aucun badge de certification ni contenu de justificatif n'est ajouté.

Les boutons Retour et Paramètres reprennent le traitement de la fiche véhicule. Les formulaires réutilisent Checkbox, RadioGroup et DocumentUploader. Personnaliser et Partager utilisent un drawer sous 768 px ; la personnalisation conserve son bouton d'enregistrement visible en bas pendant le défilement. Au-dessus, personnalisation en dialogue et partage en popover. L'upload permet la sélection multiple (jusqu'à 20 images, 10 Mo chacune), y compris les extensions de caméra en majuscules.

Vérification navigateur : vues 1440 × 1000 et 390 × 844, absence de débordement horizontal, composants du formulaire, drawer de partage et enregistrement du masquage du VIN vérifiés sur un dossier temporaire ensuite supprimé.
