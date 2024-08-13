#!/bin/bash

# Navigate to the script's directory
echo "Navigating to the script's directory..."
cd "$(dirname "$0")"/..

# Fetch the current username
USERNAME=$(whoami)
echo "Current username: $USERNAME"

# Define the virtual environment directory
ENV_DIR="/home/$USERNAME/.local/.greengrass-env"

# Create the virtual environment if it doesn't exist
if [ ! -d "$ENV_DIR" ]; then
  echo "Creating virtual environment at $ENV_DIR"
  python3 -m venv "$ENV_DIR"
else
  echo "Virtual environment already exists at $ENV_DIR"
fi

# Activate the virtual environment
echo "Activating virtual environment from $ENV_DIR"
source "$ENV_DIR/bin/activate"

# Upgrade pip and install the required package
echo "Upgrading pip in the virtual environment"
"$ENV_DIR/bin/pip" install --upgrade pip

echo "Installing AWS Greengrass GDK CLI"
"$ENV_DIR/bin/pip" install git+https://github.com/aws-greengrass/aws-greengrass-gdk-cli.git@v1.6.2

# Echo the installed version of gdk
echo "Installed GDK version:"
"$ENV_DIR/bin/gdk" --version

# Build the component
echo "Building the Greengrass component..."
"$ENV_DIR/bin/gdk" component build

# Create deployment and capture the output and status
echo "Creating deployment..."
# DEPLOYMENT_OUTPUT=$(sudo /greengrass/v2/bin/greengrass-cli deployment create \
#   --recipeDir $PWD/greengrass-build/recipes \
#   --artifactDir $PWD/greengrass-build/artifacts \
#   --merge "com.example.PythonMqttHello=1.0.0" 2>&1)
# DEPLOYMENT_STATUS=$?
sudo /greengrass/v2/bin/greengrass-cli deployment create \
  --recipeDir $PWD/greengrass-build/recipes \
  --artifactDir $PWD/greengrass-build/artifacts \
  --merge "com.example.PythonMqttHello=1.0.0"

# # Check if the deployment failed
# if [ $DEPLOYMENT_STATUS -ne 0 ]; then
#   echo "Deployment failed. Output:"
#   echo "$DEPLOYMENT_OUTPUT"

#   # Extract deployment ID from the output
#   echo "Extracting deployment ID from the output..."
#   DEPLOYMENT_ID=$(echo "$DEPLOYMENT_OUTPUT" | grep -oP '(?<=Deployment Id: )[^ ]+')

#   if [ -n "$DEPLOYMENT_ID" ]; then
#     echo "Removing failed deployment with ID: $DEPLOYMENT_ID"
#     sudo /greengrass/v2/bin/greengrass-cli deployment delete --deploymentId $DEPLOYMENT_ID
#   else
#     echo "Failed to extract deployment ID from the output."
#   fi

#   exit 1
# else
#   echo "Deployment submitted!"
#   exit 0
# fi
