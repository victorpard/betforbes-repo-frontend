#!/bin/bash
set -e
cd /root/betforbes-repo-frontend

echo "Building frontend..."
npm run build

echo "Fixing permissions for nginx"
sudo chown -R www-data:www-data dist
sudo chmod -R u=rwX,g=rX,o=rX dist

echo "Validating nginx config..."
sudo nginx -t

echo "Reloading nginx..."
sudo systemctl reload nginx

echo "Frontend deployed."
