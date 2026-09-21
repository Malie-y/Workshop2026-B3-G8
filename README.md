# Workshop2026-B3-G8
# commande pour enlever un conteneur
docker compose down
# commande pour construire un conteneur:
docker compose up -d --build

# Backup - Permet de voir le volume
docker volume ls
# Backup du projet
docker run --rm \
  -v workshop2026-b3-g8_db_data:/volume \
  -v $(pwd):/backup \
  alpine tar czf /backup/backup-$(date +%Y-%m-%d_%H-%M).tar.gz -C /volume .
# Vérification
ls -lh backup-*.tar.gz

# Restauration Backup - arrêter le service
docker compose down
# Lancer la restauration
docker run --rm \
  -v NOM_DE_TON_VOLUME:/volume \
  -v $(pwd):/backup \
  alpine sh -c "rm -rf /volume/* && tar xzf /backup/NOM_DU_FICHIER.tar.gz -C /volume"