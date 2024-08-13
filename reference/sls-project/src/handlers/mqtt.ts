import {
  IoTDataPlaneClient,
  PublishCommand,
} from "@aws-sdk/client-iot-data-plane";
import { Handler } from "aws-lambda";

const iotClient = new IoTDataPlaneClient({ region: process.env.AWS_REGION });

export const handler: Handler = async (event) => {
  const topic = "your/topic"; // Replace with your topic
  const payload = JSON.stringify({ message: "Hello from Lambda!" });

  try {
    await iotClient.send(
      new PublishCommand({
        topic,
        payload: Buffer.from(payload),
        retain: true,
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Message published successfully" }),
    };
  } catch (error) {
    console.error("Failed to publish message", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to publish message",
        error: error,
      }),
    };
  }
};
