
import express from "express";
import { db } from "../data/db.js";
import { QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { messageSchema } from "../validering/messageValidate.js";

const router = express.Router();


router.get("/:channel", async (req, res) => {
  try {
    const { channel } = req.params;
    console.log(`💬 Fetching messages for channel: ${channel}`);

    const command = new QueryCommand({
      TableName: "chappy",
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :msgPrefix)",
      ExpressionAttributeValues: {
        ":pk": `CHANNEL#${channel}`,
        ":msgPrefix": "MESSAGE#",
      },
    });

    const result = await db.send(command);
    res.json(result.Items || []);
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages." });
  }
});


router.post("/:channel", async (req, res) => {
  try {
    const { channel } = req.params;
    const parsed = messageSchema.safeParse(req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.issues.map((e) => e.message) });
    }

    const { sender, content } = parsed.data;
    const timestamp = new Date().toISOString();

    const newMessage = {
      pk: `CHANNEL#${channel}`,
      sk: `MESSAGE#${timestamp}`,
      sender,
      content,
      createdAt: timestamp,
    };

    await db.send(
      new PutCommand({
        TableName: "chappy",
        Item: newMessage,
      })
    );

    console.log(` Message added to channel ${channel}`);

    res.status(201).json({
      message: "Message sent successfully.",
      item: newMessage,
    });
  } catch (error) {
    console.error("❌ Error sending message:", error);
    res.status(500).json({ error: "Failed to send message." });
  }
});


router.get("/dm/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const command = new QueryCommand({
      TableName: "chappy",
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :dmPrefix)",
      ExpressionAttributeValues: {
        ":pk": `USER#${username}`,
        ":dmPrefix": "DM#",
      },
    });

    const result = await db.send(command);
    res.json(result.Items || []);
  } catch (error) {
    console.error("❌ Error fetching DMs:", error);
    res.status(500).json({ error: "Failed to fetch DMs." });
  }
});

export default router;