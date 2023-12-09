"use client";

import { useState } from "react";

import { useEdgeStore } from "@/lib/edgestore";
import { SingleImageDropzone } from "@/components/single-image-dropzone";

interface ImageUploadProps {
  onChange: (url?: string) => void;
  value?: string;
}

export const ImageUpload = ({ onChange, value }: ImageUploadProps) => {
  const { edgestore } = useEdgeStore();

  const [file, setFile] = useState<File>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onUpload = async (file?: File) => {
    if (file) {
      setIsSubmitting(true);
      setFile(file);

      const res = await edgestore.publicFiles.upload({
        file,
        options: {
          replaceTargetUrl: value,
        },
      });

      setIsSubmitting(false);
      onChange(res.url);
    }
  };

  return (
    <div>
      <SingleImageDropzone
        width={270}
        height={200}
        value={file}
        disabled={isSubmitting}
        onChange={onUpload}
        dropzoneOptions={{
          maxFiles: 1,
          maxSize: 4 * 1024 * 1024,
        }}
      />
    </div>
  );
};
