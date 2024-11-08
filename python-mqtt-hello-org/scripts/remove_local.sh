# sudo rm /greengrass/v2/logs/com.example.PythonMqttHello.log
# sudo touch /greengrass/v2/logs/com.example.PythonMqttHello.log
sudo /greengrass/v2/bin/greengrass-cli deployment create --remove "com.example.PythonMqttHello"