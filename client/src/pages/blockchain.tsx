import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BlockCard } from "@/components/BlockCard";
import type { Block } from "@shared/schema";
import { AlertCircle } from "lucide-react";

export default function Blockchain() {
  const { data: blocks, isLoading, error } = useQuery<Block[]>({
    queryKey: ["/api/blockchain"],
  });

  return (
    <div className="min-h-screen bg-blockchain-black text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-heading font-black text-4xl sm:text-5xl mb-4 text-white" data-testid="text-blockchain-title">
            Blockchain Explorer
          </h1>
          <p className="text-lg text-white/70">
            View all blocks in the verification chain
          </p>
        </div>

        {isLoading && (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white/5 border-white/10 p-6">
                <Skeleton className="h-24 w-full bg-white/10" />
              </Card>
            ))}
          </div>
        )}

        {error && (
          <Card className="bg-blockchain-red/10 border-blockchain-red/50 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-blockchain-red mx-auto mb-4" />
            <p className="text-white font-semibold">Failed to load blockchain data</p>
            <p className="text-white/70 text-sm mt-2">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </Card>
        )}

        {blocks && blocks.length === 0 && (
          <Card className="bg-white/5 border-white/10 p-12 text-center">
            <p className="text-white/70 text-lg">
              No blocks in the chain yet. Add your first block!
            </p>
          </Card>
        )}

        {blocks && blocks.length > 0 && (
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blockchain-blue/30 hidden md:block" />
            
            <div className="space-y-8">
              {blocks.map((block, index) => (
                <div key={index} className="relative">
                  <BlockCard block={block} index={index} isLatest={index === blocks.length - 1} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
