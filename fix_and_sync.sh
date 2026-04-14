#!/bin/bash
KEY="/Users/Modassir/Downloads/modassir.pem"
HOST="ubuntu@52.66.246.46"
REMOTE_DIR="/var/www/aimstors"

echo "Syncing local backend source to remote server..."
rsync -avz -e "ssh -i $KEY -o StrictHostKeyChecking=no" \
    --exclude 'node_modules' \
    --exclude 'dist' \
    --exclude '.git' \
    backend/ $HOST:$REMOTE_DIR/backend/

echo "Executing build and migration on remote server..."
ssh -i $KEY -o StrictHostKeyChecking=no $HOST "
    cd $REMOTE_DIR/backend
    npm install
    npm run build api
    echo 'Running TypeORM migrations...'
    # Run the typeorm migrations securely using the environment variables
    [ -f .env ] && export \$(grep -v '^#' .env | xargs)
    npm run migration:run
    
    echo 'Restarting Services...'
    pm2 restart aimstors-api
"
echo "Done!"
