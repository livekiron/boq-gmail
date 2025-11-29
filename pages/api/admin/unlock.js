// pages/api/admin/unlock.js
import fs from "fs";
import path from "path";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ") || auth.split(" ")[1] !== ADMIN_TOKEN) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ success: false, message: "Email required" });
  }

  const dbPath = path.join(process.cwd(), "database.json");
  let db = { devices: {} };
  try {
    db = JSON.parse(fs.readFileSync(dbPath, "utf8") || "{}");
    if (!db.devices) db.devices = {};
  } catch (e) {
    db = { devices: {} };
  }

  if (!db.devices[email]) {
    return res.status(404).json({ success: false, message: "Not found" });
  }

  delete db.devices[email];
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error("Write DB error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }

  return res.status(200).json({ success: true, message: "Device unlocked for " + email });
}
