import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const devices = pgTable("devices", {
  deviceId: varchar("device_id").primaryKey(),
  publicKey: text("public_key").notNull(),
  registeredAt: text("registered_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertDeviceSchema = createInsertSchema(devices).omit({ registeredAt: true });
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Device = typeof devices.$inferSelect;

export const blocks = pgTable("blocks", {
  index: integer("index").primaryKey(),
  chunkHash: text("chunk_hash").notNull(),
  sensorFingerprint: text("sensor_fingerprint").notNull(),
  prevHash: text("prev_hash").notNull(),
  timestamp: text("timestamp").notNull(),
  signature: text("signature").notNull(),
  deviceId: varchar("device_id").notNull(),
});

export const insertBlockSchema = createInsertSchema(blocks);
export type InsertBlock = z.infer<typeof insertBlockSchema>;
export type Block = typeof blocks.$inferSelect;

export const verificationResultSchema = z.object({
  frameHashMatch: z.boolean(),
  frameHashDetails: z.string().optional(),
  chainContinuity: z.boolean(),
  chainContinuityDetails: z.string().optional(),
  signatureValidity: z.boolean(),
  signatureValidityDetails: z.string().optional(),
  sensorFingerprintValidity: z.boolean(),
  sensorFingerprintDetails: z.string().optional(),
  overallValid: z.boolean(),
});

export type VerificationResult = z.infer<typeof verificationResultSchema>;
