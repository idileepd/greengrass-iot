import time
from .helpers.message_handler import *
from .helpers.gateway_controller import GatewayController


class App:
    def _get_publish_topic_name_prefix(self):
        return f"ggcore/{self.device_id}/gg_publish"

    def _get_listen_all_topic_name(self):
        return f"ggcore/{self.device_id}/gg_listen/#"

    def __init__(self, device_id, device_port, enable_heartbeat) -> None:
        self.device_port = device_port
        self.device_id = device_id
        self.enable_heartbeat = True if enable_heartbeat == "True" else False

    def start(self) -> None:
        publish_topic_name_prefix = self._get_publish_topic_name_prefix()
        listen_all_topic_name = self._get_listen_all_topic_name()

        message_handler = MessageHandler(self.device_id, self.device_port)

        # Will start the heartbeat thread and init listners
        self.gateway_controller = GatewayController(
            publish_topic_name_prefix,
            listen_all_topic_name,
            message_handler.heartbeat_handler,
            message_handler.message_handler,
            enable_heartbeat=self.enable_heartbeat,
        )
        self.message_handler = message_handler

        # Set Main Thread in loop
        while True:
            # Loop -- 1hr interval
            time.sleep(60 * 60)
