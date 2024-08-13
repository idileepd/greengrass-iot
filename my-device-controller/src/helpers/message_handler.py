import time
import datetime
from .device_util import DeviceUtil


class MessageHandler:

    def __init__(self, device_id, device_port) -> None:
        self.device_id = device_id
        self.device_port = device_port

    def message_handler(self, topic: str, message: dict[str, str]) -> dict[str, str]:
        print("Message Handler :: ", message)
        print("Received message from topic ::", topic)

        # TODO: Move this to handler
        topic_id = topic.split("/")[3]
        message.update(
            {
                "topic_id": topic_id,
                "update": "<Added updated !! from message handler>",
                "topic": topic,
                "device_id": self.device_id,
                "device_port": self.device_port,
                "timestamp": time.time(),
                "timestamp_iso": datetime.datetime.now(datetime.UTC).isoformat() + "Z",
            }
        )
        return message

    def heartbeat_handler(self) -> dict[str, str]:
        message = DeviceUtil().to_dict()
        message.update(
            {
                "topic_id": "heartbeat",
                "device_id": self.device_id,
                "device_port": self.device_port,
                "timestamp": time.time(),
                "timestamp_iso": datetime.datetime.now(datetime.UTC).isoformat() + "Z",
            }
        )
        print(f"Heartbeat Handler :: {message}")
        return message
