import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BlockchainAnimation } from "@/components/BlockchainAnimation";
import { Lock, Link2, CheckCircle, Upload } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Lock,
      title: "Hash Integrity",
      description: "Every video chunk is hashed using SHA-256, creating an immutable fingerprint that detects any tampering.",
    },
    {
      icon: Link2,
      title: "Chain Continuity",
      description: "Blocks are linked together cryptographically, ensuring the entire recording history is preserved and verified.",
    },
    {
      icon: CheckCircle,
      title: "Cryptographic Signatures",
      description: "Device signatures prove authenticity and origin, making it impossible to forge recordings.",
    },
  ];

  return (
    <div className="min-h-screen bg-blockchain-black text-white">
      <div className="relative flex flex-col items-center justify-center min-h-[80vh] px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blockchain-blue/10 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto mb-12">
          <h1 className="font-heading font-black text-5xl sm:text-6xl lg:text-7xl mb-6 bg-gradient-to-r from-white via-blockchain-green to-blockchain-blue bg-clip-text text-transparent" data-testid="text-hero-title">
            Tamper-Proof Video Verification
          </h1>
          <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
            Verify video authenticity using blockchain technology. Hash verification, cryptographic signatures, and immutable chain validation.
          </p>
          <Link href="/verify">
            <Button
              size="lg"
              className="bg-blockchain-blue hover:bg-blockchain-blue/90 text-white px-8 py-6 text-lg font-semibold"
              data-testid="button-upload-verify"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload & Verify
            </Button>
          </Link>
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto" data-testid="animation-blockchain">
          <BlockchainAnimation />
        </div>
      </div>

      <div className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-blockchain-blue/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-center mb-16 text-white" data-testid="text-features-title">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="bg-white/5 border-white/10 hover:border-blockchain-blue/50 transition-all p-8 hover-elevate"
                  data-testid={`card-feature-${index}`}
                >
                  <Icon className="w-12 h-12 text-blockchain-green mb-4" />
                  <h3 className="font-heading font-bold text-xl mb-3 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
