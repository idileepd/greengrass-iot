// // import { APIGatewayProxyHandler } from "aws-lambda";

// // export const handler: APIGatewayProxyHandler = async (event) => {
// //   return {
// //     statusCode: 200,
// //     body: JSON.stringify(
// //       {
// //         message: "Hello from Serverless TypeScript!",
// //         input: event,
// //       },
// //       null,
// //       2
// //     ),
// //   };
// // };

// import { APIGatewayProxyHandler } from "aws-lambda";
// import { v4 as uuidv4 } from "uuid";
// import { publish, subscribe } from "../utils/mqttUtils";

// export const handler: APIGatewayProxyHandler = async (event) => {
//   try {
//     console.log("params", event.queryStringParameters);
//     console.log("eeee", event);
//     const deviceId = event.queryStringParameters?.deviceId;

//     if (!deviceId) {
//       return {
//         statusCode: 400,
//         body: JSON.stringify({ error: "Device ID is required" }),
//       };
//     }

//     const eventId = uuidv4();

//     const sendTopic = `greengrass/${deviceId}/send/${eventId}`;
//     const recieveTopic = `greengrass/${deviceId}/recieve/${eventId}`;

//     await publish(sendTopic, {
//       command: "test",
//       eventId: eventId,
//       deviceId: deviceId,
//       time: new Date().toISOString(),
//     });

//     const res = await subscribe(recieveTopic);

//     return {
//       statusCode: 200,
//       body: JSON.stringify(
//         {
//           message: "Success !!",
//           eventId,
//           result: res,
//         },
//         null,
//         2
//       ),
//     };
//   } catch (error) {
//     return {
//       statusCode: 200,
//       body: JSON.stringify(
//         {
//           message: "Something went wrong",
//           error: error,
//         },
//         null,
//         2
//       ),
//     };
//   }
// };

// // export const pingDevice: APIGatewayProxyHandler = async (event) => {
// //   const deviceId = event.pathParameters?.deviceId;

// //   if (!deviceId) {
// //     return {
// //       statusCode: 400,
// //       body: JSON.stringify({ error: "Device ID is required" }),
// //     };
// //   }

// //   const requestTopic = `ping/request/${deviceId}`;
// //   const responseTopic = `ping/response/${deviceId}`;

// //   try {
// //     // Publish the ping request
// //     await iotData
// //       .publish({
// //         topic: requestTopic,
// //         payload: JSON.stringify({
// //           action: "ping",
// //           timestamp: new Date().toISOString(),
// //         }),
// //       })
// //       .promise();

// //     // Wait for the response
// //     const response = await waitForResponse(responseTopic);

// //     return {
// //       statusCode: 200,
// //       body: JSON.stringify(response),
// //     };
// //   } catch (error) {
// //     console.error("Error:", error);
// //     return {
// //       statusCode: 500,
// //       body: JSON.stringify({
// //         error: "Failed to ping device or timeout occurred",
// //       }),
// //     };
// //   }
// // };

// // async function waitForResponse(topic: string): Promise<any> {
// //   return new Promise((resolve, reject) => {
// //     const timeoutId = setTimeout(() => {
// //       reject(new Error("Timeout waiting for response"));
// //     }, TIMEOUT);

// //     const params = {
// //       topic: topic,
// //       qos: 0,
// //     };

// //     // Use iotData.getThingShadow as a way to check if the connection is established
// //     iotData.getThingShadow({ thingName: "dummyThing" }, (err) => {
// //       if (err) {
// //         clearTimeout(timeoutId);
// //         reject(err);
// //       } else {
// //         // Listen for messages
// //         iotData.on("message", (messageTopic, payload) => {
// //           if (messageTopic === topic) {
// //             clearTimeout(timeoutId);
// //             resolve(JSON.parse(payload.toString()));
// //           }
// //         });
// //       }
// //     });
// //   });
// // }
