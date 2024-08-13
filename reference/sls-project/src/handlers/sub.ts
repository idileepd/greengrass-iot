import { APIGatewayProxyHandler, Handler } from "aws-lambda";
import * as mqtt from "mqtt";
// import { SecretsManager } from "aws-sdk";

// Fetch AWS IoT endpoint and credentials from secrets manager or environment variables
const AWS_IOT_ENDPOINT = process.env.IOT_ENDPOINT || "your-iot-endpoint";
// const AWS_IOT_TOPIC = process.env.AWS_IOT_TOPIC || "your/topic";
const TIMEOUT_MS = parseInt(process.env.SUBSCRIPTION_TIMEOUT_MS || "10000"); // 10 seconds timeout

// const secretsManager = new SecretsManager();

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const client = mqtt.connect(`wss://${AWS_IOT_ENDPOINT}/mqtt`);
    const AWS_IOT_TOPIC = `gg/${event.queryStringParameters?.devideId}/sub`;
    console.log("Subbing topic ....", AWS_IOT_TOPIC);

    const messagePromise = await new Promise<string>((resolve, reject) => {
      console.log("In promise");
      const timeout = setTimeout(() => {
        client.end(); // Close the connection if the timeout occurs
        reject("Request timed out");
      }, TIMEOUT_MS);

      client.on("connect", () => {
        console.log("Connecte !!!");
        client.subscribe(AWS_IOT_TOPIC, (err) => {
          if (err) {
            clearTimeout(timeout);
            client.end(); // Close the connection
            reject(`Failed to subscribe: ${err.message}`);
          }
        });
      });

      client.on("message", (topic, message) => {
        console.log("GT MSGGG", message);
        if (topic === AWS_IOT_TOPIC) {
          clearTimeout(timeout);
          client.end(); // Close the connection
          resolve(message.toString());
        }
      });

      client.on("error", (error) => {
        clearTimeout(timeout);
        client.end(); // Close the connection
        reject(`Error: ${error.message}`);
      });
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: messagePromise,
      }),
    };
  } catch (error) {
    console.log("ERRRRRR", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Internal server error: ${error}`,
        error: error,
      }),
    };
  }
};
