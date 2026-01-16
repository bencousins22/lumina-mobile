
import React from 'react';
import { Button } from '../ui/button';
import { Paperclip } from 'lucide-react';

interface FileAttachmentButtonProps {
  onFileSelect: (file: File) => void;
}

export const FileAttachmentButton: React.FC<FileAttachmentButtonProps> = ({ onFileSelect }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Button variant="ghost" size="icon" onClick={handleClick}>
        <Paperclip className="w-5 h-5" />
      </Button>
    </>
  );
};
