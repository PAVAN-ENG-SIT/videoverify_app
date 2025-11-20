import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Shield, Plus } from "lucide-react";
import type { Device, Block } from "@shared/schema";

export default function Admin() {
  const { toast } = useToast();
  
  const [deviceId, setDeviceId] = useState("");
  const [publicKey, setPublicKey] = useState("");
  
  const [blockData, setBlockData] = useState({
    index: 0,
    sensorFingerprint: "",
    prevHash: "0",
    timestamp: new Date().toISOString(),
    signature: "",
    deviceId: "",
  });
  
  const [videoChunk, setVideoChunk] = useState<File | null>(null);

  const registerDeviceMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest<Device>("POST", "/api/registerDevice", {
        deviceId,
        publicKey,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Device Registered",
        description: `Device ${data.deviceId} registered successfully`,
      });
      setDeviceId("");
      setPublicKey("");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addBlockMutation = useMutation({
    mutationFn: async () => {
      if (!videoChunk) {
        throw new Error("Video chunk file is required");
      }
      
      const formData = new FormData();
      formData.append("videoChunk", videoChunk);
      formData.append("index", blockData.index.toString());
      formData.append("sensorFingerprint", blockData.sensorFingerprint);
      formData.append("prevHash", blockData.prevHash);
      formData.append("timestamp", blockData.timestamp);
      formData.append("signature", blockData.signature);
      formData.append("deviceId", blockData.deviceId);
      
      const response = await fetch("/api/addBlock", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add block");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Block Added",
        description: `Block #${data.index} added to blockchain with hash ${data.chunkHash.slice(0, 16)}...`,
      });
      setBlockData({
        index: data.index + 1,
        sensorFingerprint: "",
        prevHash: "",
        timestamp: new Date().toISOString(),
        signature: "",
        deviceId: data.deviceId,
      });
      setVideoChunk(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Add Block",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-blockchain-black text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-heading font-black text-4xl sm:text-5xl mb-4 text-white" data-testid="text-admin-title">
            Admin Dashboard
          </h1>
          <p className="text-lg text-white/70">
            Register devices and add blocks to the blockchain
          </p>
        </div>

        <Tabs defaultValue="device" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="device" data-testid="tab-device">
              Register Device
            </TabsTrigger>
            <TabsTrigger value="block" data-testid="tab-block">
              Add Block
            </TabsTrigger>
          </TabsList>

          <TabsContent value="device">
            <Card className="bg-white/5 border-white/10 p-8">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="deviceId" className="text-white mb-2 block">
                    Device ID
                  </Label>
                  <Input
                    id="deviceId"
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                    placeholder="Enter unique device identifier"
                    className="bg-white/10 border-white/20 text-white"
                    data-testid="input-device-id"
                  />
                </div>

                <div>
                  <Label htmlFor="publicKey" className="text-white mb-2 block">
                    Public Key (Hex)
                  </Label>
                  <Textarea
                    id="publicKey"
                    value={publicKey}
                    onChange={(e) => setPublicKey(e.target.value)}
                    placeholder="Enter device public key in hexadecimal format"
                    className="bg-white/10 border-white/20 text-white font-mono min-h-[100px]"
                    data-testid="input-public-key"
                  />
                </div>

                <Button
                  onClick={() => registerDeviceMutation.mutate()}
                  disabled={!deviceId || !publicKey || registerDeviceMutation.isPending}
                  className="w-full bg-blockchain-blue hover:bg-blockchain-blue/90"
                  data-testid="button-register-device"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {registerDeviceMutation.isPending ? "Registering..." : "Register Device"}
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="block">
            <Card className="bg-white/5 border-white/10 p-8">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="index" className="text-white mb-2 block">
                      Block Index
                    </Label>
                    <Input
                      id="index"
                      type="number"
                      value={blockData.index}
                      onChange={(e) => setBlockData({ ...blockData, index: parseInt(e.target.value) })}
                      className="bg-white/10 border-white/20 text-white"
                      data-testid="input-block-index"
                    />
                  </div>

                  <div>
                    <Label htmlFor="blockDeviceId" className="text-white mb-2 block">
                      Device ID
                    </Label>
                    <Input
                      id="blockDeviceId"
                      value={blockData.deviceId}
                      onChange={(e) => setBlockData({ ...blockData, deviceId: e.target.value })}
                      placeholder="Device ID"
                      className="bg-white/10 border-white/20 text-white"
                      data-testid="input-block-device-id"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="videoChunk" className="text-white mb-2 block">
                    Video Chunk File
                  </Label>
                  <Input
                    id="videoChunk"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoChunk(e.target.files?.[0] || null)}
                    className="bg-white/10 border-white/20 text-white"
                    data-testid="input-video-chunk"
                  />
                  <p className="text-xs text-white/50 mt-1">
                    {videoChunk ? `Selected: ${videoChunk.name}` : "Hash will be computed server-side"}
                  </p>
                </div>

                <div>
                  <Label htmlFor="sensorFingerprint" className="text-white mb-2 block">
                    Sensor Fingerprint
                  </Label>
                  <Input
                    id="sensorFingerprint"
                    value={blockData.sensorFingerprint}
                    onChange={(e) => setBlockData({ ...blockData, sensorFingerprint: e.target.value })}
                    placeholder="Device sensor fingerprint"
                    className="bg-white/10 border-white/20 text-white font-mono"
                    data-testid="input-sensor-fingerprint"
                  />
                </div>

                <div>
                  <Label htmlFor="prevHash" className="text-white mb-2 block">
                    Previous Hash
                  </Label>
                  <Input
                    id="prevHash"
                    value={blockData.prevHash}
                    onChange={(e) => setBlockData({ ...blockData, prevHash: e.target.value })}
                    placeholder="Hash of previous block"
                    className="bg-white/10 border-white/20 text-white font-mono"
                    data-testid="input-prev-hash"
                  />
                </div>

                <div>
                  <Label htmlFor="signature" className="text-white mb-2 block">
                    Signature (Hex)
                  </Label>
                  <Textarea
                    id="signature"
                    value={blockData.signature}
                    onChange={(e) => setBlockData({ ...blockData, signature: e.target.value })}
                    placeholder="Device signature in hexadecimal format"
                    className="bg-white/10 border-white/20 text-white font-mono min-h-[80px]"
                    data-testid="input-signature"
                  />
                </div>

                <Button
                  onClick={() => addBlockMutation.mutate()}
                  disabled={!videoChunk || addBlockMutation.isPending}
                  className="w-full bg-blockchain-green hover:bg-blockchain-green/90 text-blockchain-black"
                  data-testid="button-add-block"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {addBlockMutation.isPending ? "Adding Block..." : "Add Block to Chain"}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
