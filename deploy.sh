#!/bin/bash

# deploy.sh - Automate migration from Docker Compose to Kubernetes on MacBook M2
# Run this script in your project root (where docker-compose.yml is).
# Assumptions: Homebrew is installed. Docker Desktop is running.
# This script installs tools if missing, starts Minikube, converts Compose,
# builds and loads images, creates namespace, and applies manifests.
# NOTE: Custom YAML edits (e.g., probes, resources) are NOT automated here.
# After running, check/edit k8s/ files manually if needed, then re-run 'kubectl apply -f k8s/ -n sampark-infra'.
# If Minikube crashes due to low RAM, reduce --memory in minikube start.

set -e  # Exit on error

# Function to check and install a brew package
install_if_missing() {
  if ! command -v "$1" &> /dev/null; then
    echo "Installing $1..."
    brew install "$1"
  else
    echo "$1 is already installed."
  fi
}

# Step 1: Install required tools
install_if_missing kubectl
install_if_missing minikube
install_if_missing kompose

# Step 2: Start Minikube (if not running)
if ! minikube status | grep -q "host: Running"; then
  echo "Starting Minikube..."
  minikube start --driver=docker --cpus=4 --memory=6144mb
else
  echo "Minikube is already running."
fi

# Set kubectl context
kubectl config use-context minikube

# Step 3: Convert Docker Compose to K8s files (if k8s/ doesn't exist)
if [ ! -d "k8s" ]; then
  echo "Converting docker-compose.yml to K8s manifests..."
  kompose convert -f docker-compose.yml --out k8s/
else
  echo "k8s/ directory already exists. Skipping conversion."
fi

# Step 4: Build Docker images for services with build contexts
echo "Building Docker images..."

# nth-switch
docker build -t nth-service:latest ./nth

# babu-rao-ganpatrao-bank-service
docker build -t babu-rao-ganpatrao-bank-service:latest ./banks/babu-rao-ganpatrao-bank

# chai-pani-service
docker build -t chai-pani-service:latest ./banks/chai-pani-bank

# chinta-mat-karo-service
docker build -t chinta-mat-karo-service:latest ./banks/chinta-mat-karo-bank

# paisa-vasool-bank-service
docker build -t paisa-vasool-bank-service:latest ./banks/paisa-vasool-bank

# bazzar-pe-service
docker build -t bazzar-pe-service:latest ./tpap/BazaarPe

# chillar-pay-service
docker build -t chillar-pay-service:latest ./tpap/ChillarPay

# Step 5: Load images into Minikube
echo "Loading images into Minikube..."
minikube image load nth-service:latest
minikube image load babu-rao-ganpatrao-bank-service:latest
minikube image load chai-pani-service:latest
minikube image load chinta-mat-karo-service:latest
minikube image load paisa-vasool-bank-service:latest
minikube image load bazzar-pe-service:latest
minikube image load chillar-pay-service:latest

# Step 6: Update image names in K8s YAMLs (if needed; assuming tags match)
# This is optional; Kompose uses paths, but we built with tags, so sed to replace if necessary.
# For example, if YAML has 'image: ./nth', replace with 'nth-service:latest'
# Uncomment and adjust if your YAMLs need it:
# find k8s/ -type f -name '*-deployment.yaml' -exec sed -i '' 's|image: ./nth|image: nth-service:latest|g' {} \;
# Repeat for others...

# Step 7: Create namespace (if not exists)
if ! kubectl get namespace sampark-infra &> /dev/null; then
  echo "Creating namespace sampark-infra..."
  kubectl create namespace sampark-infra
else
  echo "Namespace sampark-infra already exists."
fi

# Step 8: Apply all K8s manifests
echo "Applying K8s manifests..."
kubectl apply -f k8s/ -n sampark-infra

# Step 9: Monitor pods
echo "Deployment started. Monitoring pods (will run for 60s; Ctrl+C to stop)..."
kubectl get pods -n sampark-infra -w & sleep 60; kill $!

echo "Setup complete! Access services with 'minikube service <service-name> -n sampark-infra'."
echo "If issues, check logs with 'kubectl logs <pod-name> -n sampark-infra'."
echo "To clean up: minikube stop; minikube delete (or kubectl delete -f k8s/ -n sampark-infra)."