import time
import datetime
from src.mqtt_utils import GreengrassTopicPublisher, GreengrassTopicSubscriber
from src.pi_utils import RaspberryPiUtils
import sys

args = sys.argv[1:]
argsMessage = args[0]
argsDevicePort = args[1]

print("::::>>>>", argsMessage)
print(argsDevicePort)


# Todo: move to env
device_id = "mypi123"

device_mac_address = RaspberryPiUtils.get_mac_address()
device_serial_number = RaspberryPiUtils.get_serial_number()

# API will listen to this /send
publish_topic_name_prefix = f"ggcore/{device_id}/gg_publish"  # /id
# API will publish to this /recive
listen_all_topic_name = f"ggcore/{device_id}/gg_listen/#"
listen_all_topic_name_prefix = f"ggcore/{device_id}/gg_listen"


print(f"MAC::: {device_mac_address}")
print(f"Serial Number::: {device_serial_number}")


# Initialize MQTT Publisher with a default topic
publisher = GreengrassTopicPublisher(topic=publish_topic_name_prefix)
# Initialize MQTT Subscriber with a default topic
subscriber = GreengrassTopicSubscriber(topic=listen_all_topic_name)


# Gives us the status of raspberry pi
def heartbeat():
    messageId = "pi_status"
    message = {
        "id": messageId,
        "timemillis": round(time.time() * 1000),
        "device_mac_address": device_mac_address,
        "device_serial_number": device_serial_number,
        "device_id": device_id,
        "timestamp": time.time(),
        "timestamp_iso": datetime.datetime.now(datetime.UTC).isoformat() + "Z",
        "using_device_port": argsDevicePort,
    }
    publisher.publish(message, topic=f"{publish_topic_name_prefix}/{messageId}")


# Subscription message handler for topic
def handle_incoming_message(topic, message):
    print("Recieved message from topic ::", topic)
    print("Message:: ", message)
    topic_id = topic.split("/")[3]
    #  Assuming that we have processed incomming message and sendin the response
    data = {
        "id": topic_id,
        "timemillis": round(time.time() * 1000),
        "device_mac_address": device_mac_address,
        "device_serial_number": device_serial_number,
        "device_id": device_id,
        "timestamp": time.time(),
        "timestamp_iso": datetime.datetime.now(datetime.UTC).isoformat() + "Z",
        "using_device_port": argsDevicePort,
    }
    print("Sending Data: ", data)
    publisher.publish(data, topic=f"{publish_topic_name_prefix}/{topic_id}")


# Subscribe to multiple topics
subscriber.subscribe(handle_incoming_message)


# Loop: Sleep to keep the component running + Sending us the status on 1min interval
while True:
    heartbeat()
    time.sleep(60)
