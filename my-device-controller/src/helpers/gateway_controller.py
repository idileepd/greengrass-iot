import time
import threading
from typing import Callable
from .greengrass_utils import (
    GreengrassTopicPublisher,
    GreengrassTopicSubscriber,
)


class GatewayController:
    def __init__(
        self,
        publish_topic_name_prefix: str,
        listen_all_topic_name: str,
        heartbeat_handler: Callable[[], dict[str, str]],
        message_handler: Callable[[str, dict[str, str]], dict[str, str]],
        enable_heartbeat: bool = True,
        heartbeat_interval: int = 60,
    ):
        self._publish_topic_name_prefix = publish_topic_name_prefix
        self._listen_all_topic_name = listen_all_topic_name
        self._publisher = GreengrassTopicPublisher(
            topic=self._publish_topic_name_prefix
        )
        self._listener = GreengrassTopicSubscriber(topic=self._listen_all_topic_name)
        self._message_handler = message_handler
        self._heartbeat_handler = heartbeat_handler

        # Start the listener: calls the message_handler(topic, message)
        self._listener.subscribe(callback=self._handle_incoming_message)

        if enable_heartbeat:
            # Start heartbeat in a separate thread:
            self._start_heartbeat_thread(heartbeat_interval)

    def _handle_incoming_message(self, topic: str, message: dict[str, str]):
        message = self._message_handler(topic, message)
        topic_id = topic.split("/")[3]
        if message:
            # NOTE: IF we want to publish all in single topic use self.publish_topic_name_prefix, instead of unique
            self._publisher.publish(
                message, f"{self._publish_topic_name_prefix}/{topic_id}"
            )

    def _start_heartbeat_thread(self, interval: int = 60):
        def run_heartbeat():
            while True:
                message = self._heartbeat_handler()
                if message:
                    self._publisher.publish(message, self._publish_topic_name_prefix)
                # Sleep for interval seconds before sending the next heartbeat
                time.sleep(interval)

        heartbeat_thread = threading.Thread(target=run_heartbeat)
        heartbeat_thread.start()
