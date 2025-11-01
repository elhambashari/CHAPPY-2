
import express from "express";
import { db } from "../data/db.js";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

const router = express.Router();


router.get("/", async (req, res) => {
  try {
    console.log("🔍 GET /api/channels called");

    
    const command = new ScanCommand({
      TableName: "chappy",
      FilterExpression:
        "begins_with(pk, :channelPrefix) AND begins_with(sk, :metaPrefix)",
      ExpressionAttributeValues: {
        ":channelPrefix": "CHANNEL#",
        ":metaPrefix": "META#",
      },
    });

    const result = await db.send(command);

    
    const channels =
      result.Items?.filter((item) => item.sk.startsWith("META#")) || [];

    console.log(`✅ Channels fetched: ${channels.length}`);

    res.json(channels);
  } catch (error) {
    console.error("❌ Error fetching channels:", error);
    res.status(500).json({ error: "Failed to fetch channels." });
  }
});

export default router;
