import { APIGatewayProxyHandler } from "aws-lambda";
import * as AWS from "aws-sdk";
import { mqtt, iot } from "aws-iot-device-sdk-v2";

const iotClient = new AWS.Iot();

let iotdata: AWS.IotData;
let cachedEndpoint: string | null = null;

async function getIotEndpoint(): Promise<string> {
  if (cachedEndpoint) {
    return cachedEndpoint;
  }
  const endpointData = await iotClient
    .describeEndpoint({ endpointType: "iot:Data-ATS" })
    .promise();
  cachedEndpoint = endpointData.endpointAddress!;
  return cachedEndpoint;
}

export const publish: APIGatewayProxyHandler = async (event) => {
  try {
    const endpoint = await getIotEndpoint();
    if (!iotdata) {
      iotdata = new AWS.IotData({ endpoint });
    }
    const topic = "my/test/topic";
    const message = JSON.parse(event.body || "{}");
    const params = {
      topic,
      payload: JSON.stringify(message),
      qos: 0,
    };
    await iotdata.publish(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Message published successfully" }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to publish message" }),
    };
  }
};

export const subscribeAndWait: APIGatewayProxyHandler = async (event) => {
  try {
    const endpoint = await getIotEndpoint();
    const clientId = `test-client-${Date.now()}`;
    const topic = "my/test/topic";
    const timeoutMs = 10000; // 10 seconds timeout

    const config = iot.AwsIotMqttConnectionConfigBuilder.new_with_websockets()
      .with_clean_session(true)
      .with_client_id(clientId)
      .with_endpoint(endpoint)
      .build();

    const client = new mqtt.MqttClient();
    const connection = client.new_connection(config);

    await connection.connect();

    return new Promise((resolve) => {
      let messageReceived = false;
      const timer = setTimeout(() => {
        if (!messageReceived) {
          connection.disconnect();
          resolve({
            statusCode: 408,
            body: JSON.stringify({ message: "Timeout: No message received" }),
          });
        }
      }, timeoutMs);

      connection.subscribe(topic, mqtt.QoS.AtLeastOnce, (topic, payload) => {
        clearTimeout(timer);
        messageReceived = true;
        const message = payload.toString();
        console.log(`Message received on topic ${topic}: ${message}`);
        connection.disconnect();
        resolve({
          statusCode: 200,
          body: JSON.stringify({ message: "Message received", data: message }),
        });
      });
    });
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to subscribe or receive message" }),
    };
  }
};
