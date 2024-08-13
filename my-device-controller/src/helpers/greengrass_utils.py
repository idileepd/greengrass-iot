import traceback
import json
import awsiot.greengrasscoreipc
import awsiot.greengrasscoreipc.client as client
from awsiot.greengrasscoreipc.model import (
    IoTCoreMessage,
    QOS,
    PublishToIoTCoreRequest,
    SubscribeToIoTCoreRequest,
)


class GreengrassTopicPublisher:
    def __init__(self, topic=None, qos=QOS.AT_LEAST_ONCE, timeoutSec=10):
        self.topic = topic
        self.qos = qos
        self.ipc_client = awsiot.greengrasscoreipc.connect()
        self.timeoutSec = timeoutSec

    def set_default_topic(self, topic):
        self.topic = topic

    def publish(self, message, topic=None):
        try:
            if not topic:
                topic = self.topic
            if not topic:
                raise ValueError("--->Publish topic not provided")

            msgstring = json.dumps(message)
            pubrequest = PublishToIoTCoreRequest()
            pubrequest.topic_name = topic
            pubrequest.payload = bytes(msgstring, "utf-8")
            pubrequest.qos = self.qos
            operation = self.ipc_client.new_publish_to_iot_core()
            operation.activate(pubrequest)
            future = operation.get_response()
            future.result(self.timeoutSec)
            print(f"--->Published to {topic}: {message}")
        except Exception as e:
            print(f"--->Failed to publish to {topic}: {e}")


class GreengrassTopicSubscriber:
    def __init__(self, topic=None, qos=QOS.AT_MOST_ONCE, timeoutSec=10):
        self.topic = topic
        self.qos = qos
        self.ipc_client = awsiot.greengrasscoreipc.connect()
        self.timeoutSec = timeoutSec

    def set_default_topic(self, topic):
        self.topic = topic

    def subscribe(self, callback, topic=None):
        try:
            if not topic:
                topic = self.topic
            if not topic:
                raise ValueError("--->Subscribe topic not provided")

            handler = SubHandler(callback)
            subrequest = SubscribeToIoTCoreRequest()
            subrequest.topic_name = topic
            subrequest.qos = self.qos
            operation = self.ipc_client.new_subscribe_to_iot_core(handler)
            future = operation.activate(subrequest)
            future.result(self.timeoutSec)
            print(f"--->Subscribed to {topic}")
        except Exception as e:
            print(f"--->Failed to subscribe to {topic}: {e}")


class SubHandler(client.SubscribeToIoTCoreStreamHandler):
    def __init__(self, callback):
        super().__init__()
        self.callback = callback

    def on_stream_event(self, event: IoTCoreMessage) -> None:
        try:
            message = str(event.message.payload, "utf-8")
            self.callback(event.message.topic_name, json.loads(message))
        except:
            traceback.print_exc()

    def on_stream_error(self, error: Exception) -> bool:
        return True  # Return True to close stream, False to keep stream open.

    def on_stream_closed(self) -> None:
        pass
