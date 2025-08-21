import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, MapPin, Hash, User } from 'lucide-react';

export interface MetadataFormData {
  pmNumber: string;
  name: string;
  datetime: string;
  location: string;
}

interface MetadataFormProps {
  onDataChange: (data: MetadataFormData) => void;
  onProcess: () => void;
  data: MetadataFormData;
}

export const MetadataForm = ({ onDataChange, onProcess, data }: MetadataFormProps) => {
  const handleInputChange = (field: keyof MetadataFormData, value: string) => {
    onDataChange({
      ...data,
      [field]: value
    });
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  const isFormValid = data.pmNumber && data.name && data.datetime && data.location;

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-gradient-primary rounded-lg shadow-elegant">
            <Hash className="h-5 w-5 text-primary-foreground" />
          </div>
          Project Metadata
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pmNumber" className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            PM Number
          </Label>
          <Input
            id="pmNumber"
            placeholder="Enter PM number"
            value={data.pmNumber}
            onChange={(e) => handleInputChange('pmNumber', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Name
          </Label>
          <Input
            id="name"
            placeholder="Enter your name"
            value={data.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="datetime" className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Date & Time
          </Label>
          <div className="flex gap-2">
            <Input
              id="datetime"
              type="datetime-local"
              value={data.datetime}
              onChange={(e) => handleInputChange('datetime', e.target.value)}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleInputChange('datetime', getCurrentDateTime())}
            >
              Now
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Location
          </Label>
          <Input
            id="location"
            placeholder="Enter location"
            value={data.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
          />
        </div>

        <Button 
          onClick={onProcess}
          disabled={!isFormValid}
          className="w-full bg-gradient-primary shadow-elegant hover:shadow-none transition-all duration-200"
        >
          Process Image
        </Button>
      </CardContent>
    </Card>
  );
};