
import express from "express";
import { db } from "../data/db.js";
import { ScanCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { verifyToken } from "../auth/authMiddleware.js"; 



const router = express.Router();

//  GET /api/users
router.get("/", verifyToken, async (req, res) => {
  try {
    console.log(" Fetching all users from DynamoDB...");

    const command = new ScanCommand({
      TableName: "chappy",
      FilterExpression: "begins_with(#pk, :pk) AND begins_with(#sk, :sk)",
      ExpressionAttributeNames: { "#pk": "pk", "#sk": "sk" },
      ExpressionAttributeValues: { ":pk": "USER#", ":sk": "PROFILE#" },
    });

    const result = await db.send(command);
    const users = (result.Items || []).map((item) => ({
      username: item.username,
    }));

    console.log(`✅ Found ${users.length} users.`);
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

//  GET /api/users/:username
router.get("/:username", verifyToken, async (req, res) => {
  const { username } = req.params;
  try {
    const command = new GetCommand({
      TableName: "chappy",
      Key: { pk: `USER#${username}`, sk: `PROFILE#${username}` },
    });

    const result = await db.send(command);
    if (!result.Item)
      return res.status(404).json({ error: "User not found." });

    res.json({
      username: result.Item.username,
    });
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user." });
  }
});

// GET /api/users/:username/dms
router.get("/:username/dms", verifyToken, async (req, res) => {
  try {
    const { username } = req.params;
    console.log(` Fetching DMs for user: ${username}`);

    const command = new ScanCommand({
      TableName: "chappy",
      FilterExpression: "begins_with(pk, :dmPrefix)",
      ExpressionAttributeValues: { ":dmPrefix": "DM#" },
    });

    const result = await db.send(command);
    const items = result.Items || [];
    const dmUsers = new Set<string>();

    for (const item of items) {
      const pk = item.pk || "";
      if (!pk.startsWith("DM#")) continue;

      const parts = pk.split("#"); // DM#userA#userB
      if (parts.length < 3) continue;

      const [, userA, userB] = parts;

      if (userA === username && userB !== username) dmUsers.add(userB);
      if (userB === username && userA !== username) dmUsers.add(userA);
    }

    const dmList = Array.from(dmUsers).map((u) => ({ username: u }));

    console.log(`✅ Found ${dmList.length} DM contacts for ${username}:`, dmList);
    res.json(dmList);
  } catch (error) {
    console.error("❌ Error fetching DMs:", error);
    res.status(500).json({ error: "Failed to fetch DMs." });
  }
});

export default router;
