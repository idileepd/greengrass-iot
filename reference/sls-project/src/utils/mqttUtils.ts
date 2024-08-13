import { device as IoTDevice } from "aws-iot-device-sdk";
import { QoS } from "mqtt-packet";

const iotDevice = new IoTDevice({
  region: "us-east-1",
  host: process.env.IOT_ENDPOINT,
  protocol: "wss", // or 'mqtts' if using TLS
});

export const publish = (topic: string, message: object): Promise<void> => {
  console.log("publising--> ", topic);
  return new Promise((resolve, reject) => {
    iotDevice.publish(topic, JSON.stringify(message), {}, (err) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

export const subscribe = (
  topic: string,
  timeout: number = 10000,
  qos: QoS = 0
): Promise<string> => {
  console.log("Subbing");
  return new Promise((resolve, reject) => {
    const handleMessage = (receivedTopic: string, payload: Buffer) => {
      if (receivedTopic === topic) {
        iotDevice.removeListener("message", handleMessage); // Remove listener after receiving message
        resolve(payload.toString());
      }
    };

    iotDevice.on("message", handleMessage);

    iotDevice.subscribe(topic, { qos }, (err) => {
      if (err) {
        iotDevice.removeListener("message", handleMessage); // Clean up listener if error
        reject(err);
      }
    });

    // Handle timeout
    setTimeout(() => {
      iotDevice.removeListener("message", handleMessage); // Remove listener on timeout
      reject(new Error("Timeout waiting for MQTT response"));
    }, timeout); // Adjust timeout as needed
  });
};
