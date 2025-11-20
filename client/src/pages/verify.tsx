import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { VerificationResults } from "@/components/VerificationResults";
import { apiRequest } from "@/lib/queryClient";
import { Upload, FileVideo, FileCode } from "lucide-react";
import type { VerificationResult } from "@shared/schema";

export default function Verify() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [metadataFile, setMetadataFile] = useState<File | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const { toast } = useToast();

  const verifyMutation = useMutation({
    mutationFn: async () => {
      if (!videoFile || !metadataFile) {
        throw new Error("Both video and metadata files are required");
      }

      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("metadata", metadataFile);

      const response = await fetch("/api/verify", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Verification failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Verification Complete",
        description: data.overallValid
          ? "Video authenticity verified successfully"
          : "Verification failed - tampering detected",
        variant: data.overallValid ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleVerify = () => {
    if (!videoFile || !metadataFile) {
      toast({
        title: "Missing Files",
        description: "Please upload both video and metadata files",
        variant: "destructive",
      });
      return;
    }
    verifyMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-blockchain-black text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-heading font-black text-4xl sm:text-5xl mb-4 text-white" data-testid="text-verify-title">
            Verify Video Authenticity
          </h1>
          <p className="text-lg text-white/70">
            Upload your video and metadata to verify blockchain integrity
          </p>
        </div>

        <Card className="bg-white/5 border-white/10 p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <Label htmlFor="video-upload" className="text-white mb-2 block font-semibold">
                Video File (.mp4)
              </Label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  videoFile
                    ? "border-blockchain-green bg-blockchain-green/10"
                    : "border-white/20 hover:border-blockchain-blue/50 bg-white/5"
                }`}
              >
                <Input
                  id="video-upload"
                  type="file"
                  accept=".mp4"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="hidden"
                  data-testid="input-video-file"
                />
                <label
                  htmlFor="video-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <FileVideo className="w-12 h-12 mb-3 text-blockchain-blue" />
                  {videoFile ? (
                    <span className="text-blockchain-green font-mono text-sm">
                      {videoFile.name}
                    </span>
                  ) : (
                    <span className="text-white/60">Click to upload video</span>
                  )}
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="metadata-upload" className="text-white mb-2 block font-semibold">
                Metadata JSON
              </Label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  metadataFile
                    ? "border-blockchain-green bg-blockchain-green/10"
                    : "border-white/20 hover:border-blockchain-blue/50 bg-white/5"
                }`}
              >
                <Input
                  id="metadata-upload"
                  type="file"
                  accept=".json"
                  onChange={(e) => setMetadataFile(e.target.files?.[0] || null)}
                  className="hidden"
                  data-testid="input-metadata-file"
                />
                <label
                  htmlFor="metadata-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <FileCode className="w-12 h-12 mb-3 text-blockchain-blue" />
                  {metadataFile ? (
                    <span className="text-blockchain-green font-mono text-sm">
                      {metadataFile.name}
                    </span>
                  ) : (
                    <span className="text-white/60">Click to upload metadata</span>
                  )}
                </label>
              </div>
            </div>
          </div>

          <Button
            onClick={handleVerify}
            disabled={!videoFile || !metadataFile || verifyMutation.isPending}
            className="w-full bg-blockchain-blue hover:bg-blockchain-blue/90 text-white py-6 text-lg font-semibold"
            data-testid="button-verify-authenticity"
          >
            {verifyMutation.isPending ? (
              <>Verifying...</>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Verify Authenticity
              </>
            )}
          </Button>
        </Card>

        {result && <VerificationResults result={result} />}
      </div>
    </div>
  );
}
