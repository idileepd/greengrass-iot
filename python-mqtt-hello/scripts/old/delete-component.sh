#!/bin/bash

# Function to display usage
usage() {
  echo "Usage: $0 -c <ComponentName> -v <ComponentVersion>"
  exit 1
}

# Parse command line arguments
while getopts "c:v:" opt; do
  case ${opt} in
    c)
      COMPONENT_NAME=$OPTARG
      ;;
    v)
      COMPONENT_VERSION=$OPTARG
      ;;
    *)
      usage
      ;;
  esac
done

# Check if component name and version are provided
if [ -z "$COMPONENT_NAME" ] || [ -z "$COMPONENT_VERSION" ]; then
  usage
fi

# Function to delete deployment
delete_deployment() {
  echo "Fetching deployment ID for component $COMPONENT_NAME version $COMPONENT_VERSION..."

  # Fetch all deployments
  DEPLOYMENTS=$(sudo /greengrass/v2/bin/greengrass-cli deployment list)
  
  # Extract deployment ID
  DEPLOYMENT_ID=$(echo "$DEPLOYMENTS" | grep -B1 "$COMPONENT_NAME@$COMPONENT_VERSION" | grep -oP '(?<=Deployment Id: )[^ ]+')

  if [ -n "$DEPLOYMENT_ID" ]; then
    echo "Found deployment ID: $DEPLOYMENT_ID"
    echo "Deleting deployment with ID: $DEPLOYMENT_ID"
    sudo /greengrass/v2/bin/greengrass-cli deployment delete --deploymentId $DEPLOYMENT_ID

    if [ $? -eq 0 ]; then
      echo "Deployment deleted successfully."
    else
      echo "Failed to delete deployment."
      exit 1
    fi
  else
    echo "No deployment found for component $COMPONENT_NAME version $COMPONENT_VERSION."
    exit 1
  fi
}

# Call the delete deployment function
delete_deployment
