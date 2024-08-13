import sys
from src.app import App

args = sys.argv[1:]
device_id = args[0]
device_port = args[1]
enable_heartbeat = args[2]


print(":::initializing app")
print("deviceId:: ", device_id)
print("device_port:: ", device_port)
print("enable_heartbeat:: ", enable_heartbeat, "Type: ", type(enable_heartbeat))


if (
    device_id == "<<DevicePort Placeholder>>"
    or device_port == "<<DeviceId Placeholder>>"
):
    raise Exception(
        "Deviceport or DeviceId Config error, Please edit the component config"
    )

try:
    # Initialize the application with the device ID
    app = App(
        device_id=device_id, device_port=device_port, enable_heartbeat=enable_heartbeat
    )
    app.start()
except Exception as e:
    print("ERROR:::::::")
    print(e)
