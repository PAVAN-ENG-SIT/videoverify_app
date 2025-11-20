import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Block } from "@shared/schema";

interface BlockCardProps {
  block: Block;
  index: number;
  isLatest: boolean;
}

export function BlockCard({ block, index, isLatest }: BlockCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formatHash = (hash: string) => {
    if (hash.length <= 16) return hash;
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="relative md:ml-16" data-testid={`card-block-${index}`}>
      <div className="absolute -left-16 top-8 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-blockchain-blue border-4 border-blockchain-black z-10">
        <span className="font-mono font-bold text-white">{block.index}</span>
      </div>

      <Card
        className={`bg-white/5 border-l-4 transition-all hover-elevate ${
          isLatest
            ? "border-l-blockchain-green shadow-lg shadow-blockchain-green/20"
            : "border-l-blockchain-blue"
        } hover:shadow-lg hover:shadow-blockchain-blue/30`}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-heading font-bold text-2xl text-blockchain-green">
                  Block #{block.index}
                </h3>
                {isLatest && (
                  <Badge className="bg-blockchain-green text-blockchain-black font-semibold">
                    Latest
                  </Badge>
                )}
              </div>
              <p className="text-white/50 text-sm font-mono">
                {formatTimestamp(block.timestamp)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="text-white/70 hover:text-white"
              data-testid={`button-expand-${index}`}
            >
              {expanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-white/50 text-sm mb-1">Device ID</p>
              <p className="text-white font-mono text-sm break-all">
                {formatHash(block.deviceId)}
              </p>
            </div>
            <div>
              <p className="text-white/50 text-sm mb-1">Chunk Hash</p>
              <p className="text-white font-mono text-sm break-all">
                {formatHash(block.chunkHash)}
              </p>
            </div>
            <div>
              <p className="text-white/50 text-sm mb-1">Previous Hash</p>
              <p className="text-white font-mono text-sm break-all">
                {block.prevHash === "0" ? "Genesis Block" : formatHash(block.prevHash)}
              </p>
            </div>
            <div>
              <p className="text-white/50 text-sm mb-1">Sensor Fingerprint</p>
              <p className="text-white font-mono text-sm break-all">
                {formatHash(block.sensorFingerprint)}
              </p>
            </div>
          </div>

          {expanded && (
            <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
              <div>
                <p className="text-white/50 text-sm mb-1">Full Chunk Hash</p>
                <p className="text-white font-mono text-xs break-all bg-white/5 p-3 rounded">
                  {block.chunkHash}
                </p>
              </div>
              <div>
                <p className="text-white/50 text-sm mb-1">Full Previous Hash</p>
                <p className="text-white font-mono text-xs break-all bg-white/5 p-3 rounded">
                  {block.prevHash}
                </p>
              </div>
              <div>
                <p className="text-white/50 text-sm mb-1">Signature</p>
                <p className="text-white font-mono text-xs break-all bg-white/5 p-3 rounded">
                  {block.signature}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
