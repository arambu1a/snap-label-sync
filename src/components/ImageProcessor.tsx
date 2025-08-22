import { useRef, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Cloud } from 'lucide-react';
import { MetadataFormData } from './MetadataForm';

interface ImageProcessorProps {
  imageFile: File;
  metadata: MetadataFormData;
  onSyncToDropbox: (processedImageBlob: Blob) => void;
}

export const ImageProcessor = ({ imageFile, metadata, onSyncToDropbox }: ImageProcessorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processedImageBlob, setProcessedImageBlob] = useState<Blob | null>(null);

  useEffect(() => {
    processImage();
  }, [imageFile, metadata]);

  const processImage = async () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Add overlay background
      const overlayHeight = 120;
      const gradient = ctx.createLinearGradient(0, canvas.height - overlayHeight, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, canvas.height - overlayHeight, canvas.width, overlayHeight);

      // Add text overlay
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Inter, sans-serif';
      
      const padding = 20;
      let yPos = canvas.height - overlayHeight + 30;

      // PM Number
      ctx.fillText(`PM#: ${metadata.pmNumber}`, padding, yPos);
      
      // Name (on the right side)
      const nameWidth = ctx.measureText(`Name: ${metadata.name}`).width;
      ctx.fillText(`Name: ${metadata.name}`, canvas.width - nameWidth - padding, yPos);

      yPos += 30;

      // Date/Time
      const formattedDate = new Date(metadata.datetime).toLocaleString();
      ctx.fillText(`Date: ${formattedDate}`, padding, yPos);

      yPos += 30;

      // Location
      ctx.fillText(`Location: ${metadata.location}`, padding, yPos);

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          setProcessedImageBlob(blob);
        }
      }, 'image/jpeg', 0.9);
    };

    img.src = URL.createObjectURL(imageFile);
  };

  const downloadImage = () => {
    if (!processedImageBlob) return;

    const url = URL.createObjectURL(processedImageBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metadata.pmNumber}_${metadata.name}_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSyncToDropbox = async () => {
    if (!processedImageBlob) return;
    
    // Get API key from the main component
    onSyncToDropbox(processedImageBlob);
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-gradient-primary rounded-lg shadow-elegant">
            <Cloud className="h-5 w-5 text-primary-foreground" />
          </div>
          Processed Image
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <canvas 
            ref={canvasRef} 
            className="w-full h-auto rounded-lg shadow-soft border"
            style={{ maxHeight: '400px', objectFit: 'contain' }}
          />
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={downloadImage}
            disabled={!processedImageBlob}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button 
            onClick={handleSyncToDropbox}
            disabled={!processedImageBlob}
            className="flex-1 bg-gradient-primary shadow-elegant hover:shadow-none transition-all duration-200"
          >
            <Cloud className="h-4 w-4 mr-2" />
            Sync to Dropbox
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};