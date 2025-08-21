import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Camera, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage?: File | null;
  onClear?: () => void;
}

export const ImageUpload = ({ onImageSelect, selectedImage, onClear }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onImageSelect(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  });

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onImageSelect(file);
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleClear = () => {
    setPreview(null);
    onClear?.();
  };

  if (preview || selectedImage) {
    return (
      <Card className="relative overflow-hidden shadow-soft">
        <img 
          src={preview || (selectedImage ? URL.createObjectURL(selectedImage) : '')} 
          alt="Selected" 
          className="w-full h-64 object-cover"
        />
        <Button
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      </Card>
    );
  }

  return (
    <Card 
      {...getRootProps()} 
      className={cn(
        "border-2 border-dashed transition-all duration-200 cursor-pointer hover:shadow-soft",
        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="mb-4 p-4 bg-gradient-primary rounded-full shadow-elegant">
          <Upload className="h-8 w-8 text-primary-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Upload Image</h3>
        <p className="text-muted-foreground mb-4">
          Drag & drop an image here, or click to select
        </p>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            Choose File
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleCameraCapture();
            }}
          >
            <Camera className="h-4 w-4 mr-2" />
            Camera
          </Button>
        </div>
      </div>
    </Card>
  );
};