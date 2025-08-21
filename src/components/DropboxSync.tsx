import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Cloud, Key, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DropboxSyncProps {
  onSync: (imageBlob: Blob) => void;
}

export const DropboxSync = ({ onSync }: DropboxSyncProps) => {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('dropbox_token') || '');
  const [isConnected, setIsConnected] = useState(!!localStorage.getItem('dropbox_token'));
  const [isUploading, setIsUploading] = useState(false);

  const handleConnect = () => {
    if (!accessToken.trim()) {
      toast.error('Please enter a valid Dropbox access token');
      return;
    }

    localStorage.setItem('dropbox_token', accessToken);
    setIsConnected(true);
    toast.success('Connected to Dropbox successfully!');
  };

  const handleDisconnect = () => {
    localStorage.removeItem('dropbox_token');
    setAccessToken('');
    setIsConnected(false);
    toast.success('Disconnected from Dropbox');
  };

  const uploadToDropbox = async (imageBlob: Blob) => {
    if (!isConnected || !accessToken) {
      toast.error('Please connect to Dropbox first');
      return;
    }

    setIsUploading(true);

    try {
      const filename = `processed_image_${Date.now()}.jpg`;
      
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
        toast.success(`Image synced to Dropbox: ${result.name}`);
      } else {
        const error = await response.json();
        toast.error(`Dropbox sync failed: ${error.error_summary || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error('Failed to sync to Dropbox. Please check your connection.');
      console.error('Dropbox upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-gradient-primary rounded-lg shadow-elegant">
            <Cloud className="h-5 w-5 text-primary-foreground" />
          </div>
          Dropbox Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <>
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                Enter your Dropbox access token to enable automatic syncing of processed images.
                <a 
                  href="https://www.dropbox.com/developers/apps" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline ml-1"
                >
                  Get your token here
                </a>
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="accessToken">Dropbox Access Token</Label>
              <Input
                id="accessToken"
                type="password"
                placeholder="Enter your Dropbox access token"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handleConnect}
              disabled={!accessToken.trim()}
              className="w-full bg-gradient-primary shadow-elegant hover:shadow-none transition-all duration-200"
            >
              <Cloud className="h-4 w-4 mr-2" />
              Connect to Dropbox
            </Button>
          </>
        ) : (
          <>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully connected to Dropbox. Images will be synced to the PhotoAnnotations folder.
              </AlertDescription>
            </Alert>
            
            <Button 
              variant="outline" 
              onClick={handleDisconnect}
              className="w-full"
            >
              Disconnect from Dropbox
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

