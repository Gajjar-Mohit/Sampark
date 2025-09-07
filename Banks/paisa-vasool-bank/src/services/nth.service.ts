import { kafka } from "..";

// Add a Map to store pending requests
const pendingRequests = new Map();

export async function listernForNTH() {
  const consumer = kafka.consumer({ groupId: "NTH-to-321987-group" });
  await consumer.connect();

  await consumer.subscribe({ topics: ["NTH-to-321987"] });

  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
      const key = message.key?.toString() ?? "";
      const value = message.value?.toString() ?? "";
      if (!key || !value) {
        console.warn("Invalid message received");
        return;
      }
      await sendResponseToNTH(value, key);
    },
  });
}

export async function sendResponseToNTH(value: string, key: string) {
  console.log("Received message", key, value);
  if (key.includes("account-details")) {
    console.log("-------------");
    const parsedResponse = JSON.parse(value);

    // Check if this is a response to a pending request
    // The request key should match: ifscCode_contactNo
    const responseIfsc = parsedResponse.accountDetails?.ifscCode;
    const responseContact =
      parsedResponse.accountDetails?.accountHolderContactNo;
    const requestKey = `${responseIfsc}_${responseContact}`;

    console.log("Looking for requestKey:", requestKey);
    console.log("Pending requests:", Array.from(pendingRequests.keys()));

    if (pendingRequests.has(requestKey)) {
      const { resolve } = pendingRequests.get(requestKey);
      pendingRequests.delete(requestKey);
      resolve(parsedResponse);
    }

    return parsedResponse;
  } else {
    // This is an initial request, create a promise and store it
    // key = ifscCode, value = contactNo
    const requestKey = `${key}_${value}`;

    console.log("Creating request with key:", requestKey);

    const promise = new Promise((resolve, reject) => {
      pendingRequests.set(requestKey, { resolve, reject });

      // Set a timeout to reject after 30 seconds
      setTimeout(() => {
        if (pendingRequests.has(requestKey)) {
          pendingRequests.delete(requestKey);
          reject(new Error("Request timeout"));
        }
      }, 30000);
    });

    await send(value, key);
    return promise; // Return the promise that will resolve when response comes
  }
}

async function send(value: string, key: string) {
  const producer = kafka.producer();
  console.log("Connecting 321987-to-NTH");
  await producer.connect();
  console.log("321987-to-NTH Connected Successfully");
  await producer.send({
    topic: "321987-to-NTH",
    messages: [
      {
        key: "verify-details",
        value: JSON.stringify({
          ifscCode: key,
          contactNo: value,
        }),
      },
    ],
  });
}
