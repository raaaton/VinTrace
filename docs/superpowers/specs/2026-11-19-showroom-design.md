# Showroom VinTrace

Décisions validées avec le propriétaire le 19 novembre 2026 ; il demande maintenant l'implémentation.

Objectif : dossier de revente (75 %) et présentation de passionné (25 %), sans prix de vente, contact ou statut à vendre.

Le bouton Showroom du garage ouvre un aperçu privé fidèle au public. Personnaliser permet de choisir les événements, leurs notes (privées par défaut), les montants (visibles par défaut), le masquage des six derniers caractères du VIN via maskVIN, le texte facultatif et une galerie facultative ordonnée. Les factures restent des cartes Contenu privé, sans original ni aperçu public. Les pièces jointes étant aujourd'hui non catégorisées, seules les images explicitement sélectionnées deviennent des photos publiques.

Partager : publier, badge actif, copier le lien, ouvrir la page publique, dépublier. Un identifiant opaque permanent reste identique lors des republications. Les modifications enregistrées sont immédiatement effectives. Par défaut les événements existants sont sélectionnés pour la première publication ; les nouveaux événements sur un showroom publié demandent Afficher/Garder privé et proposent Mémoriser mon choix. Personnaliser expose Toujours demander/Afficher automatiquement/Garder privés automatiquement. Aucun dialogue avant première publication.

Présentation : couverture et identité (marque, modèle, année, kilométrage, VIN), mot du propriétaire, galerie, historique décroissant. Style du garage, contrôles réservés au propriétaire. Page accessible sans compte ; absence d'indexation choisie comme défaut prudent, réversible ultérieurement.

Sécurité : contrôle propriétaire pour toute mutation et aperçu ; aucune lecture publique des tables brutes. Projection serveur sur liste blanche, pas de VIN complet lorsque masqué, pas de coûts/notes masqués, pas de noms ni URL des documents. Médias servis via un endpoint qui contrôle publication/visibilité à chaque accès, sans cache. La présence de justificatifs ne constitue pas une certification.

Validation : tests de projection des secrets et de visibilité, compilation TypeScript, lint, build ; migration SQL avec RLS et déclencheur de visibilité. Application distante seulement si accès de migration disponible ; signaler explicitement sinon.
