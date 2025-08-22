import { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { MetadataForm, MetadataFormData } from '@/components/MetadataForm';
import { ImageProcessor } from '@/components/ImageProcessor';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, FileImage } from 'lucide-react';
import { toast } from 'sonner';

// Replace 'YOUR_DROPBOX_API_KEY_HERE' with your actual Dropbox API key
const DROPBOX_API_KEY = 'sl.u.AF5j7-P9GEJdQXrrLR26KYRf5nCytgwqqdLSjXOYQ0qiOfPeXolEI-pra_SQcgMCrE7KKyX_E1RVkPx0_E-ZEMIN--cA9iVVGbb0YumhE2RRmqRT4PmYavPriymD_PFpo6YeGlBrMMiKzTwFl1vOmquDYgAN2gUE_nIoYZRGeAA-auHhAun8EDYREcAKPYG6k2hTL6mLqsiSDEA6z8F1qIBTFzuI7lq8PcROVUJx7a2Ahqj-_qVRfe8LIfwsjQ2HDkUTONu6vpczAgv7h7Ef3IoaOZBmL4o-CKWyypze91zB_Ta-gXSpjo4m-vOpjIE8ykW9dedijcKhT9Pqw9Xb92GvYUH1yFYV7h1WhF7pvAzIqnB0OQj9mH--9Fs8fJREBEQkHZnlOZKX206fVG1o6SA6MTjzLi2zWZQ_H9jq3jgiaR6i-jh024yeajgdfsQZ_W51uimQo4smZz5gal9EqK7fUT8Mt2Rm8sqrxfHC1eOpIQG6C6bcb1aa1QoJNEpgP03PcBoWzDpuduID7j3uoDnTOVvxCW_1yYncfVM790ru9a8mKr6zreu0jso2lXKtRXJi_nKDGIbf0vgk_AnODNnYku9Y36fcAORdYs3jgk0fQb2S6iUME--V2mSVbGvKpcKHMTwyvJ7QJ0Bg4jEwcHr31HfOkeahv4Fn_QDsF2IIM1CTXh8e3rkBUQiFvXiCo0sSNOSntV7EFIwR_DboP4eBIeG2BdSCSBhcovqTXX4sv-GQ4wImq8JcEIplBAMenucnUwfiW3m2E1p1UBWdvUVuQd3jb4x3JqbJ7mpPfXyGqYF2KdF4QiDqgryfbPrZSgZAannzB3KF3z1nbc0eqcoH1dKb4L9vvENnTdzbC8YYroRGpShKHkf0aeay-CQ2GlbvTFHaeD0F6G0bFGvgYe5zhLXU7EEhXC8UQa3ke__wHMWEQcWk5bgZqR30yGtUjloJH5yVYZvfmXDDAR8ai3AGSYuZtB2bFIMM4Xk-eJVKKuExRNrX0DZtEKioypZi2lvBJVh4ne5oxCBFjyG-oQ4GxG2fVTAddCEiNpIbnlEaFeAO3i68WAVINO-et7GSogNWHv0RDQ5XKngOVJaHb5d1BX1W2wkkw9jMFkOt-_lDJPei7zRns9FX-pEq5HvCBEQo8U2fvWdqtEFfnnwvrGR0-lImzEJJbgRI6qMXKeEDHEbCCbQUqouEDvMAaDe20jvMoxX9vgjqRdKCkZbn-iyp300COK-_7e5P9zmkoMyKyvvLAcmaTNzMYOxUQB-ttUs';

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
    const accessToken = DROPBOX_API_KEY;
    if (!accessToken || accessToken === 'YOUR_DROPBOX_API_KEY_HERE') {
      toast.error('Please replace YOUR_DROPBOX_API_KEY_HERE with your actual Dropbox API key in the code');
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
