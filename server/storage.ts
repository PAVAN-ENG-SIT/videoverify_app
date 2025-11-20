import { type Device, type InsertDevice, type Block, type InsertBlock } from "@shared/schema";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DEVICES_FILE = path.join(DATA_DIR, "devices.json");
const BLOCKCHAIN_FILE = path.join(DATA_DIR, "blockchain.json");

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

export interface IStorage {
  registerDevice(device: InsertDevice): Promise<Device>;
  getDevice(deviceId: string): Promise<Device | undefined>;
  addBlock(block: InsertBlock): Promise<Block>;
  getBlockchain(): Promise<Block[]>;
  getLastBlock(): Promise<Block | undefined>;
}

export class MemStorage implements IStorage {
  private devices: Map<string, Device>;
  private blockchain: Block[];
  private initialized: Promise<void>;

  constructor() {
    this.devices = new Map();
    this.blockchain = [];
    this.initialized = this.loadFromDisk();
  }

  private async loadFromDisk() {
    await ensureDataDir();

    try {
      const devicesData = await fs.readFile(DEVICES_FILE, "utf-8");
      const devices = JSON.parse(devicesData) as Device[];
      devices.forEach((device) => this.devices.set(device.deviceId, device));
    } catch (error) {
      // File doesn't exist yet, start fresh
    }

    try {
      const blockchainData = await fs.readFile(BLOCKCHAIN_FILE, "utf-8");
      this.blockchain = JSON.parse(blockchainData) as Block[];
    } catch (error) {
      // File doesn't exist yet, start fresh
    }
  }

  private async ensureInitialized() {
    await this.initialized;
  }

  private async saveDevicesToDisk() {
    await ensureDataDir();
    const devices = Array.from(this.devices.values());
    await fs.writeFile(DEVICES_FILE, JSON.stringify(devices, null, 2));
  }

  private async saveBlockchainToDisk() {
    await ensureDataDir();
    await fs.writeFile(BLOCKCHAIN_FILE, JSON.stringify(this.blockchain, null, 2));
  }

  async registerDevice(insertDevice: InsertDevice): Promise<Device> {
    await this.ensureInitialized();
    const device: Device = {
      ...insertDevice,
      registeredAt: new Date().toISOString(),
    };
    this.devices.set(device.deviceId, device);
    await this.saveDevicesToDisk();
    return device;
  }

  async getDevice(deviceId: string): Promise<Device | undefined> {
    await this.ensureInitialized();
    return this.devices.get(deviceId);
  }

  async addBlock(block: InsertBlock): Promise<Block> {
    await this.ensureInitialized();
    this.blockchain.push(block);
    await this.saveBlockchainToDisk();
    return block;
  }

  async getBlockchain(): Promise<Block[]> {
    await this.ensureInitialized();
    return this.blockchain;
  }

  async getLastBlock(): Promise<Block | undefined> {
    await this.ensureInitialized();
    if (this.blockchain.length === 0) return undefined;
    return this.blockchain[this.blockchain.length - 1];
  }
}

export const storage = new MemStorage();
