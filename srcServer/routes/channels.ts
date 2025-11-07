
import express from "express";
import { db } from "../data/db.js";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { verifyToken } from "../auth/authMiddleware.js"; 



const router = express.Router();

// GET /api/channels
router.get("/", verifyToken, async (req, res) => {
  try {
  

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


    
    res.json({
      isLoggedIn: !!(req as any).user,
      channels,
    });
  } catch (error) {
    console.error("❌ Error fetching channels:", error);
    res.status(500).json({ error: "Failed to fetch channels." });
  }
});

export default router;
