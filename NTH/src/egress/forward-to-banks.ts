import { kafka } from "..";

export async function forwardToBanks(
  iinNo: string,
  key: string,
  value: string
) {
  {
    const producer = kafka.producer();
    console.log("Connecting Producer");
    await producer.connect();
    console.log("Producer Connected Successfully");
    return await producer.send({
      topic: iinNo,
      messages: [
        {
          value: value,
          key: key,
        },
      ],
    });
  }
}
