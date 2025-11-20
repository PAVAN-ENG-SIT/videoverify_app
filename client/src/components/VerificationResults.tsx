import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Lock, Link2, Key, Fingerprint } from "lucide-react";
import type { VerificationResult } from "@shared/schema";

interface VerificationResultsProps {
  result: VerificationResult;
}

export function VerificationResults({ result }: VerificationResultsProps) {
  const checks = [
    {
      title: "Frame Hash Match",
      icon: Lock,
      valid: result.frameHashMatch,
      details: result.frameHashDetails,
    },
    {
      title: "Chain Continuity",
      icon: Link2,
      valid: result.chainContinuity,
      details: result.chainContinuityDetails,
    },
    {
      title: "Signature Validity",
      icon: Key,
      valid: result.signatureValidity,
      details: result.signatureValidityDetails,
    },
    {
      title: "Sensor Fingerprint",
      icon: Fingerprint,
      valid: result.sensorFingerprintValidity,
      details: result.sensorFingerprintDetails,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-heading font-bold text-2xl text-white text-center mb-8" data-testid="text-results-title">
        Verification Results
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {checks.map((check, index) => {
          const Icon = check.icon;
          const StatusIcon = check.valid ? CheckCircle : XCircle;
          const delay = index * 100;

          return (
            <Card
              key={index}
              className={`bg-white/5 border-2 p-6 transition-all ${
                check.valid
                  ? "border-blockchain-green animate-pulse-glow"
                  : "border-blockchain-red animate-pulse-glow-red"
              }`}
              style={{
                animation: `fade-in 0.5s ease-out ${delay}ms forwards`,
                opacity: 0,
              }}
              data-testid={`card-result-${index}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-lg ${
                    check.valid ? "bg-blockchain-green/20" : "bg-blockchain-red/20"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      check.valid ? "text-blockchain-green" : "text-blockchain-red"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading font-bold text-lg text-white">
                      {check.title}
                    </h3>
                    <StatusIcon
                      className={`w-6 h-6 ${
                        check.valid ? "text-blockchain-green" : "text-blockchain-red"
                      }`}
                    />
                  </div>
                  {check.details && (
                    <p className="text-sm text-white/70 font-mono break-all">
                      {check.details}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card
        className={`p-6 border-2 ${
          result.overallValid
            ? "bg-blockchain-green/10 border-blockchain-green"
            : "bg-blockchain-red/10 border-blockchain-red"
        }`}
        data-testid="card-overall-result"
      >
        <div className="text-center">
          <p className="text-2xl font-heading font-bold text-white mb-2">
            {result.overallValid ? "✓ Verification Passed" : "✗ Verification Failed"}
          </p>
          <p className="text-white/70">
            {result.overallValid
              ? "The video is authentic and untampered"
              : "Tampering or inconsistencies detected"}
          </p>
        </div>
      </Card>
    </div>
  );
}
