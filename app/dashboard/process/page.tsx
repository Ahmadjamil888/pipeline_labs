"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { 
  Upload, 
  FileSpreadsheet, 
  FileJson, 
  FileText, 
  X, 
  Send, 
  Loader2, 
  Check, 
  AlertCircle,
  Download,
  Eye,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@clerk/nextjs";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  rowCount?: number;
  columnCount?: number;
}

interface ProcessingResult {
  datasetId: string;
  status: string;
  downloadUrl?: string;
  summary?: {
    originalRows: number;
    processedRows: number;
    originalColumns: number;
    processedColumns: number;
    operationsApplied: string[];
    llmInstructions: string;
    processingDurationMs: number;
  };
}

const EXAMPLE_PROMPTS = [
  "Normalize all numeric features and one-hot encode categorical variables",
  "Remove outliers using z-score, fill missing values with median",
  "Prepare this for logistic regression: scale features, encode labels, split 80/20",
  "Clean the data: drop duplicates, fix data types, remove null rows",
  "Feature engineering: create polynomial features, standardize, encode categories",
];

export default function DataProcessingPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (const file of acceptedFiles) {
        // Validate file type
        const validTypes = ['.csv', '.xlsx', '.xls', '.json'];
        const fileExt = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
        if (!validTypes.includes(fileExt)) {
          setError(`Invalid file type: ${file.name}. Only CSV, Excel, and JSON files are supported.`);
          continue;
        }

        // Validate file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
          setError(`File too large: ${file.name}. Maximum file size is 50MB.`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", file.name.replace(/\.[^/.]+$/, ''));

        const token = await getToken();
        
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || `Failed to upload ${file.name}`);
        }

        const data = await response.json();
        
        setFiles(prev => [...prev, {
          id: data.id,
          name: data.name,
          size: data.size,
          type: data.type,
          rowCount: data.rowCount,
          columnCount: data.columnCount,
        }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [getToken]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/json': ['.json'],
    },
    disabled: isUploading || isProcessing,
  });

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (files.length === 1) {
      setResult(null);
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      setError("Please upload a dataset first");
      return;
    }
    if (!prompt.trim()) {
      setError("Please enter preprocessing instructions");
      return;
    }

    setError(null);
    setIsProcessing(true);
    setResult(null);

    try {
      const token = await getToken();
      
      const response = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          datasetId: files[0].id,
          prompt: prompt.trim(),
          options: {
            outputFormat: "csv",
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Processing failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "csv":
        return <FileText className="h-5 w-5 text-green-500" />;
      case "xlsx":
      case "xls":
        return <FileSpreadsheet className="h-5 w-5 text-blue-500" />;
      case "json":
        return <FileJson className="h-5 w-5 text-yellow-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            AI Data Preprocessing
          </h1>
          <p className="text-muted-foreground">
            Upload your dataset, describe what you need, and let AI do the work
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Dataset
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors duration-200
                ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
                ${isUploading || isProcessing ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50"}
              `}
            >
              <input {...getInputProps()} />
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm font-medium">
                  {isDragActive ? "Drop files here..." : "Drag & drop files here, or click to select"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports CSV, Excel (XLSX/XLS), JSON up to 50MB
                </p>
              </div>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                          {file.rowCount && ` • ${file.rowCount.toLocaleString()} rows`}
                          {file.columnCount && ` • ${file.columnCount} columns`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(file.id)}
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prompt Section */}
        {files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Preprocessing Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={`Describe what you want to do with your data. For example:

"Normalize all numeric features and one-hot encode categorical variables"
"Remove outliers using z-score, fill missing values with median"
"Prepare for logistic regression with standard scaling and train/test split"`}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                disabled={isProcessing}
                className="resize-none"
              />

              {/* Example Prompts */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Try an example:</p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_PROMPTS.map((example, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => setPrompt(example)}
                    >
                      {example.length > 40 ? example.slice(0, 40) + "..." : example}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleProcess}
                disabled={!prompt.trim() || isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing with AI...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Run Preprocessing
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {result && (
          <Card className="border-green-500/20 bg-green-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Check className="h-5 w-5" />
                Processing Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.summary && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-background">
                    <p className="text-xs text-muted-foreground">Original Rows</p>
                    <p className="text-lg font-semibold">{result.summary.originalRows.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background">
                    <p className="text-xs text-muted-foreground">Processed Rows</p>
                    <p className="text-lg font-semibold">{result.summary.processedRows.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background">
                    <p className="text-xs text-muted-foreground">Original Columns</p>
                    <p className="text-lg font-semibold">{result.summary.originalColumns}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-background">
                    <p className="text-xs text-muted-foreground">Processed Columns</p>
                    <p className="text-lg font-semibold">{result.summary.processedColumns}</p>
                  </div>
                </div>
              )}

              {result.summary?.operationsApplied && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Operations Applied:</p>
                  <div className="flex flex-wrap gap-2">
                    {result.summary.operationsApplied.map((op, idx) => (
                      <Badge key={idx} variant="outline">{op}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex gap-2">
                {result.downloadUrl && (
                  <Button asChild className="flex-1">
                    <a href={result.downloadUrl} download>
                      <Download className="mr-2 h-4 w-4" />
                      Download CSV
                    </a>
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push(`/dashboard/datasets/${result.datasetId}`)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
