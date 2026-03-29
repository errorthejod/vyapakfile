import { Router } from "express";
import { db, usersTable, adminConfigTable, pool } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

async function ensureAdminConfig() {
  const existing = await db.select().from(adminConfigTable).where(eq(adminConfigTable.id, 1));
  if (existing.length === 0) {
    await db.insert(adminConfigTable).values({ id: 1, adminPassword: "delhi5932", nextUserNum: 2 });
  }
  return existing[0] ?? { id: 1, adminPassword: "delhi5932", nextUserNum: 2 };
}

async function ensureDefaultUser() {
  const existing = await db.select().from(usersTable).where(eq(usersTable.id, "BB001"));
  if (existing.length === 0) {
    await db.insert(usersTable).values({
      id: "BB001",
      name: "Demo User",
      businessName: "Shuvidha Telecom Mobile and Electronics",
      pin: "1234",
      isActive: true,
    });
  }
}

export async function warmupDb() {
  try {
    const client = await pool.connect();
    client.release();
    logger.info("Database connection pool warmed up");
  } catch (err) {
    logger.error({ err }, "Failed to warm up database connection pool");
  }
}

router.get("/users", async (_req, res) => {
  try {
    await ensureDefaultUser();
    const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
    res.json({ users });
  } catch (err) {
    logger.error({ err }, "Failed to fetch users");
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.post("/users/login", async (req, res) => {
  try {
    await ensureDefaultUser();
    const { name, pin } = req.body as { name: string; pin: string };
    if (!name || !pin) return res.status(400).json({ error: "Name and pin required" });
    const users = await db.select().from(usersTable);
    const user = users.find(
      u => u.name.trim().toLowerCase() === name.trim().toLowerCase() && u.pin === pin.trim() && u.isActive
    );
    if (!user) return res.status(401).json({ error: "Invalid name or password" });
    res.json({ user });
  } catch (err) {
    logger.error({ err }, "Login failed");
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/users", async (req, res) => {
  try {
    const { name, businessName, pin } = req.body as { name: string; businessName: string; pin: string };
    if (!name || !businessName || !pin) return res.status(400).json({ error: "Missing fields" });
    const config = await ensureAdminConfig();
    const num = config.nextUserNum;
    const id = `BB${String(num).padStart(3, "0")}`;
    const [user] = await db.insert(usersTable).values({ id, name, businessName, pin, isActive: true }).returning();
    await db.update(adminConfigTable).set({ nextUserNum: num + 1 }).where(eq(adminConfigTable.id, 1));
    res.json({ user });
  } catch (err) {
    logger.error({ err }, "Failed to create user");
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body as Partial<{ pin: string; isActive: boolean; name: string; businessName: string }>;
    const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    logger.error({ err }, "Failed to update user");
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(usersTable).where(eq(usersTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "Failed to delete user");
    res.status(500).json({ error: "Failed to delete user" });
  }
});

router.get("/admin/config", async (_req, res) => {
  try {
    const config = await ensureAdminConfig();
    res.json({ adminPassword: config.adminPassword });
  } catch (err) {
    logger.error({ err }, "Failed to fetch config");
    res.status(500).json({ error: "Failed to fetch config" });
  }
});

router.put("/admin/config", async (req, res) => {
  try {
    const { adminPassword } = req.body as { adminPassword: string };
    if (!adminPassword) return res.status(400).json({ error: "Admin password required" });
    await ensureAdminConfig();
    await db.update(adminConfigTable).set({ adminPassword }).where(eq(adminConfigTable.id, 1));
    res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "Failed to update config");
    res.status(500).json({ error: "Failed to update config" });
  }
});

export default router;
