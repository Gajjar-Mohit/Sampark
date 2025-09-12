import { kafka } from "..";

export async function forwardToBank(iinNo: string, key: string, value: string) {
  {
    const producer = kafka.producer();
    console.log("forwarding to bank " + iinNo);
    console.log(iinNo + " " + key);
    console.log(value);
    await producer.connect();
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
