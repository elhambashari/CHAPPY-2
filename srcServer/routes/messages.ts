
import express from "express";
import type { Request, Response } from "express";

import { db } from "../data/db.js";
import { QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { messageSchema } from "../validering/messageValidate.js";
import { verifyToken, requireAuth } from "../auth/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/messages/:channel
 */
router.get("/:channel", verifyToken, async (req: Request, res: Response) => {
  try {
    const { channel } = req.params;
    if (!channel) {
      return res.status(400).json({ error: "Channel name is required." });
    }

   

    const command = new QueryCommand({
      TableName: "chappy",
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :msgPrefix)",
      ExpressionAttributeValues: {
        ":pk": `CHANNEL#${channel}`,
        ":msgPrefix": "MESSAGE#",
      },
    });

    const result = await db.send(command);



	const sorted =
  result.Items?.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  ) || [];

res.json(sorted);



    res.json(result.Items || []);
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages." });
  }
});

router.post("/:channel", verifyToken, async (req: Request, res: Response) => {
  try {
    const { channel } = req.params;
    if (!channel) {
      return res.status(400).json({ error: "Channel name is required." });
    }

    
    const user = (req as any).user; 
    const isGuest = !user; 

    
    if (isGuest && channel !== "code" && channel !== "random") {
      return res.status(403).json({ error: "Guests can only post in #code and #random." });
    }

    
    const parsed = messageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues.map((e) => e.message) });
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

    await db.send(new PutCommand({ TableName: "chappy", Item: newMessage }));

    console.log(`✅ Message added to channel ${channel}`);
    res.status(201).json({ message: "Message sent successfully.", item: newMessage });
  } catch (error) {
    console.error("❌ Error sending message:", error);
    res.status(500).json({ error: "Failed to send message." });
  }
});


/**
 * GET /api/messages/dm/:username
 */
router.get("/dm/:username", verifyToken, async (req: Request, res: Response) => {
  try {
    const username = req.params.username as string;
    const user = String(req.query.user || "");

    if (!username || !user) {
      return res.status(400).json({ error: "Missing username or user parameter." });
    }

    const dmKey =
      user.toLowerCase() < username.toLowerCase()
        ? `DM#${user}#${username}`
        : `DM#${username}#${user}`;

  

    const command = new QueryCommand({
      TableName: "chappy",
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :msgPrefix)",
      ExpressionAttributeValues: {
        ":pk": dmKey,
        ":msgPrefix": "MESSAGE#",
      },
    });

    const result = await db.send(command);

    const sorted =
      result.Items?.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ) || [];

    res.json(sorted);
  } catch (error) {
    console.error("❌ Error fetching DMs:", error);
    res.status(500).json({ error: "Failed to fetch DMs." });
  }
});

/**
 * POST /api/messages/dm/:username
 */
router.post("/dm/:username", requireAuth, async (req: Request, res: Response) => {
  try {
    const username = req.params.username as string;
    const { sender, content } = req.body;

    if (!username || !sender || !content) {
      return res.status(400).json({ error: "Sender, username, and content are required." });
    }

    const timestamp = new Date().toISOString();

    const dmKey =
      sender.toLowerCase() < username.toLowerCase()
        ? `DM#${sender}#${username}`
        : `DM#${username}#${sender}`;

    const newMessage = {
      pk: dmKey,
      sk: `MESSAGE#${timestamp}`,
      sender,
      content,
      createdAt: timestamp,
    };

    await db.send(new PutCommand({ TableName: "chappy", Item: newMessage }));

    console.log(`✅ DM sent from ${sender} to ${username}`);
    res.status(201).json({ message: "DM sent successfully.", item: newMessage });
  } catch (error) {
    console.error("❌ Error sending DM:", error);
    res.status(500).json({ error: "Failed to send DM." });
  }
});

export default router;
