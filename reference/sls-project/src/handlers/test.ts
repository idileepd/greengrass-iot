import { APIGatewayProxyHandler, Handler } from "aws-lambda";
import * as mqtt from "mqtt";
import { v4 as uuidv4 } from "uuid";

// Fetch AWS IoT endpoint and credentials from environment variables
const AWS_IOT_ENDPOINT = process.env.AWS_IOT_ENDPOINT || "your-iot-endpoint";
const REQUEST_TOPIC = process.env.REQUEST_TOPIC || "your/request/topic";
const RESPONSE_TOPIC_PREFIX =
  process.env.RESPONSE_TOPIC_PREFIX || "your/response/topic/";
const TIMEOUT_MS = parseInt(process.env.SUBSCRIPTION_TIMEOUT_MS || "10000"); // 10 seconds timeout

export const mqttHandler: Handler = async (event) => {
  console.log(event);
  const requestId = uuidv4(); // Generate a unique request ID
  const responseTopic = `${RESPONSE_TOPIC_PREFIX}${requestId}`; // Unique response topic

  try {
    const client = mqtt.connect(`wss://${AWS_IOT_ENDPOINT}/mqtt`);

    // Publish request to the request topic with the unique request ID
    client.publish(REQUEST_TOPIC, JSON.stringify({ requestId }), { qos: 1 });

    const responsePromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        client.end(); // Close the connection if the timeout occurs
        reject("Request timed out");
      }, TIMEOUT_MS);

      client.on("connect", () => {
        client.subscribe(responseTopic, (err) => {
          if (err) {
            clearTimeout(timeout);
            client.end(); // Close the connection
            reject(`Failed to subscribe: ${err.message}`);
          }
        });
      });

      client.on("message", (topic, message) => {
        if (topic === responseTopic) {
          clearTimeout(timeout);
          client.end(); // Close the connection
          resolve({
            statusCode: 200,
            body: JSON.stringify({
              message: message.toString(),
            }),
          });
        }
      });

      client.on("error", (error) => {
        clearTimeout(timeout);
        client.end(); // Close the connection
        reject(`Error: ${error.message}`);
      });
    });

    return responsePromise;
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Internal server error: ${error}`,
      }),
    };
  }
};
