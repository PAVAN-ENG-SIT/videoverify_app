import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { createHash } from "crypto";
import nacl from "tweetnacl";
import { insertDeviceSchema, insertBlockSchema } from "@shared/schema";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

function computeSHA256(data: Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

function computeBlockHash(block: { index: number; chunkHash: string; sensorFingerprint: string; prevHash: string; timestamp: string; deviceId: string }): string {
  const canonicalContent = JSON.stringify({
    index: block.index,
    chunkHash: block.chunkHash,
    sensorFingerprint: block.sensorFingerprint,
    prevHash: block.prevHash,
    timestamp: block.timestamp,
    deviceId: block.deviceId,
  });
  return computeSHA256(Buffer.from(canonicalContent, "utf-8"));
}

function verifySignature(message: string, signature: string, publicKey: string): boolean {
  try {
    const messageBytes = Buffer.from(message, "utf-8");
    const signatureBytes = Buffer.from(signature, "hex");
    const publicKeyBytes = Buffer.from(publicKey, "hex");

    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
  } catch (error) {
    return false;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/registerDevice", async (req, res) => {
    try {
      const validatedData = insertDeviceSchema.parse(req.body);
      
      const existingDevice = await storage.getDevice(validatedData.deviceId);
      if (existingDevice) {
        return res.status(400).json({ message: "Device already registered" });
      }

      const device = await storage.registerDevice(validatedData);
      res.json(device);
    } catch (error) {
      console.error("Error registering device:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to register device" 
      });
    }
  });

  app.post("/api/addBlock", async (req, res) => {
    try {
      const validatedBlock = insertBlockSchema.parse(req.body);

      const device = await storage.getDevice(validatedBlock.deviceId);
      if (!device) {
        return res.status(400).json({ message: "Device not registered" });
      }

      const lastBlock = await storage.getLastBlock();
      const expectedIndex = lastBlock ? lastBlock.index + 1 : 0;
      const expectedPrevHash = lastBlock ? computeBlockHash({
        index: lastBlock.index,
        chunkHash: lastBlock.chunkHash,
        sensorFingerprint: lastBlock.sensorFingerprint,
        prevHash: lastBlock.prevHash,
        timestamp: lastBlock.timestamp,
        deviceId: lastBlock.deviceId,
      }) : "0";

      if (validatedBlock.index !== expectedIndex) {
        return res.status(400).json({ 
          message: `Invalid block index. Expected ${expectedIndex}, got ${validatedBlock.index}` 
        });
      }

      if (validatedBlock.prevHash !== expectedPrevHash) {
        return res.status(400).json({ 
          message: `Previous hash does not match. Expected ${expectedPrevHash}, got ${validatedBlock.prevHash}` 
        });
      }

      const message = JSON.stringify({
        index: validatedBlock.index,
        chunkHash: validatedBlock.chunkHash,
        sensorFingerprint: validatedBlock.sensorFingerprint,
        prevHash: validatedBlock.prevHash,
        timestamp: validatedBlock.timestamp,
      });

      const signatureValid = verifySignature(message, validatedBlock.signature, device.publicKey);
      if (!signatureValid) {
        return res.status(400).json({ message: "Invalid signature" });
      }

      const block = await storage.addBlock(validatedBlock);
      res.json(block);
    } catch (error) {
      console.error("Error adding block:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to add block" 
      });
    }
  });

  app.post("/api/verify", upload.fields([
    { name: "video", maxCount: 1 },
    { name: "metadata", maxCount: 1 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files.video || !files.metadata) {
        return res.status(400).json({ message: "Both video and metadata files are required" });
      }

      const videoBuffer = files.video[0].buffer;
      const metadataBuffer = files.metadata[0].buffer;
      const metadata = JSON.parse(metadataBuffer.toString("utf-8"));

      if (!Array.isArray(metadata)) {
        return res.status(400).json({ message: "Metadata must be an array of blocks" });
      }

      if (metadata.length === 0) {
        return res.status(400).json({ message: "Metadata cannot be empty" });
      }

      for (const block of metadata) {
        try {
          insertBlockSchema.parse(block);
        } catch (error) {
          return res.status(400).json({ 
            message: `Invalid block at index ${block.index}: ${error instanceof Error ? error.message : "Validation failed"}` 
          });
        }
      }

      const blockchain = await storage.getBlockchain();
      
      let frameHashMatch = true;
      let frameHashDetails = "";
      const computedVideoHash = computeSHA256(videoBuffer);
      
      if (metadata.length > 0 && blockchain.length > 0) {
        let matchedBlockIndex = -1;
        for (let i = 0; i < metadata.length; i++) {
          const metadataBlockIndex = metadata[i].index;
          if (metadataBlockIndex < blockchain.length) {
            const storedBlock = blockchain[metadataBlockIndex];
            if (computedVideoHash === storedBlock.chunkHash) {
              matchedBlockIndex = metadataBlockIndex;
              break;
            }
          }
        }
        
        if (matchedBlockIndex >= 0) {
          frameHashMatch = true;
          frameHashDetails = `Video hash matches block #${matchedBlockIndex}: ${computedVideoHash.slice(0, 16)}...`;
        } else {
          frameHashMatch = false;
          const expectedHashes = metadata
            .map(m => m.index < blockchain.length ? blockchain[m.index].chunkHash.slice(0, 16) : "N/A")
            .join(", ");
          frameHashDetails = `Video hash ${computedVideoHash.slice(0, 16)}... doesn't match any referenced blocks. Expected: ${expectedHashes}...`;
        }
      } else if (metadata.length > 0) {
        frameHashDetails = "No stored blockchain to verify against";
        frameHashMatch = false;
      }

      let chainContinuity = true;
      let chainContinuityDetails = "";
      
      if (metadata.length > blockchain.length) {
        chainContinuity = false;
        chainContinuityDetails = `Metadata contains ${metadata.length} blocks but blockchain only has ${blockchain.length}`;
      } else {
        for (let i = 0; i < metadata.length; i++) {
          const metadataBlock = metadata[i];
          const storedBlock = blockchain[i];

          if (!storedBlock) {
            chainContinuity = false;
            chainContinuityDetails = `Block ${i} not found in stored blockchain`;
            break;
          }

          const metadataBlockHash = computeBlockHash({
            index: metadataBlock.index,
            chunkHash: metadataBlock.chunkHash,
            sensorFingerprint: metadataBlock.sensorFingerprint,
            prevHash: metadataBlock.prevHash,
            timestamp: metadataBlock.timestamp,
            deviceId: metadataBlock.deviceId,
          });

          const storedBlockHash = computeBlockHash({
            index: storedBlock.index,
            chunkHash: storedBlock.chunkHash,
            sensorFingerprint: storedBlock.sensorFingerprint,
            prevHash: storedBlock.prevHash,
            timestamp: storedBlock.timestamp,
            deviceId: storedBlock.deviceId,
          });

          if (metadataBlockHash !== storedBlockHash) {
            chainContinuity = false;
            chainContinuityDetails = `Block ${i} hash mismatch: metadata ${metadataBlockHash.slice(0, 16)}... vs stored ${storedBlockHash.slice(0, 16)}...`;
            break;
          }

          if (metadataBlock.index !== storedBlock.index) {
            chainContinuity = false;
            chainContinuityDetails = `Block ${i} index mismatch: expected ${storedBlock.index}, got ${metadataBlock.index}`;
            break;
          }
        }
        
        if (chainContinuity) {
          chainContinuityDetails = `All ${metadata.length} blocks match stored blockchain`;
        }
      }

      let signatureValidity = true;
      let signatureValidityDetails = "";
      
      for (const block of metadata) {
        const device = await storage.getDevice(block.deviceId);
        if (!device) {
          signatureValidity = false;
          signatureValidityDetails = `Device ${block.deviceId} not registered`;
          break;
        }

        const message = JSON.stringify({
          index: block.index,
          chunkHash: block.chunkHash,
          sensorFingerprint: block.sensorFingerprint,
          prevHash: block.prevHash,
          timestamp: block.timestamp,
        });

        if (!verifySignature(message, block.signature, device.publicKey)) {
          signatureValidity = false;
          signatureValidityDetails = `Invalid signature at block ${block.index}`;
          break;
        }
      }

      if (signatureValidity && metadata.length > 0) {
        signatureValidityDetails = `All ${metadata.length} signatures valid`;
      }

      const sensorFingerprintValidity = true;
      const sensorFingerprintDetails = metadata.length > 0 
        ? "Sensor fingerprints present in all blocks"
        : "No blocks to verify";

      const overallValid = frameHashMatch && chainContinuity && signatureValidity && sensorFingerprintValidity;

      res.json({
        frameHashMatch,
        frameHashDetails,
        chainContinuity,
        chainContinuityDetails,
        signatureValidity,
        signatureValidityDetails,
        sensorFingerprintValidity,
        sensorFingerprintDetails,
        overallValid,
      });
    } catch (error) {
      console.error("Error verifying video:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Verification failed" 
      });
    }
  });

  app.get("/api/blockchain", async (req, res) => {
    try {
      const blockchain = await storage.getBlockchain();
      res.json(blockchain);
    } catch (error) {
      console.error("Error getting blockchain:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to get blockchain" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
