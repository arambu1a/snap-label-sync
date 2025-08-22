import { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { MetadataForm, MetadataFormData } from '@/components/MetadataForm';
import { ImageProcessor } from '@/components/ImageProcessor';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, FileImage } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<MetadataFormData>({
    pmNumber: '',
    name: '',
    datetime: '',
    location: ''
  });
  const [showProcessor, setShowProcessor] = useState(false);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setShowProcessor(false);
  };

  const handleImageClear = () => {
    setSelectedImage(null);
    setShowProcessor(false);
  };

  const handleMetadataChange = (data: MetadataFormData) => {
    setMetadata(data);
  };

  const handleProcessImage = () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }
    setShowProcessor(true);
    toast.success('Processing image with overlay...');
  };

  const handleDropboxSync = async (imageBlob: Blob) => {
    const accessToken = localStorage.getItem('dropbox_token');
    if (!accessToken) {
      toast.error('Please connect to Dropbox first');
      return;
    }

    try {
      toast.success('Syncing to Dropbox...');
      const filename = `${metadata.pmNumber}_${metadata.name}_${Date.now()}.jpg`;
      
      const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/octet-stream',
          'Dropbox-API-Arg': JSON.stringify({
            path: `/PhotoAnnotations/${filename}`,
            mode: 'add',
            autorename: true
          })
        },
        body: imageBlob
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Successfully synced: ${result.name}`);
      } else {
        const error = await response.json();
        toast.error(`Sync failed: ${error.error_summary || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error('Failed to sync to Dropbox. Please check your connection.');
      console.error('Dropbox upload error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-card border-b shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-primary rounded-xl shadow-elegant">
              <Camera className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Photo Annotator</h1>
              <p className="text-muted-foreground">Add metadata overlays and sync to Dropbox</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-primary rounded-lg shadow-elegant">
                    <FileImage className="h-5 w-5 text-primary-foreground" />
                  </div>
                  Select Image
                </CardTitle>
              </CardHeader>
              <div className="p-6 pt-0">
                <ImageUpload 
                  onImageSelect={handleImageSelect}
                  selectedImage={selectedImage}
                  onClear={handleImageClear}
                />
              </div>
            </Card>

            <MetadataForm 
              data={metadata}
              onDataChange={handleMetadataChange}
              onProcess={handleProcessImage}
            />

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {showProcessor && selectedImage ? (
              <ImageProcessor 
                imageFile={selectedImage}
                metadata={metadata}
                onSyncToDropbox={handleDropboxSync}
              />
            ) : (
              <Card className="shadow-soft">
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <div className="mb-4 p-4 bg-muted rounded-full">
                    <FileImage className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Ready to Process</h3>
                  <p className="text-muted-foreground">
                    Select an image and fill in the metadata to see the processed result
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
