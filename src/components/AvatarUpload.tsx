import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Avatar, IconButton, Typography, CircularProgress, Slider, Tooltip,
} from '@mui/material';
import Cropper from 'react-easy-crop';
import DeleteIcon from '@mui/icons-material/Delete';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB — matches backend MAX_FILE_SIZE_MB

interface AvatarUploadProps {
  /** Pre-existing image URL (e.g. from server). Re-syncs when the prop changes. */
  initialImage?: string | null;
  /** Called with the cropped File when the user selects & crops, or null when deleted locally. */
  onImageSelected?: (file: File | null) => void;
  /** Called when the user clicks the delete button and a server image exists. Should hit DELETE /members/:id/photo. */
  onDeleteRequested?: () => Promise<void>;
  disabled?: boolean;
  /** Size of the avatar circle in px. Default 100. */
  size?: number;
}

export default function AvatarUpload({
  initialImage,
  onImageSelected,
  onDeleteRequested,
  disabled,
  size = 100,
}: AvatarUploadProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(initialImage || null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Re-sync displayed image when the prop changes (e.g. after a server upload completes)
  useEffect(() => {
    setImageSrc(initialImage || null);
  }, [initialImage]);

  const processFile = (file: File | null | undefined) => {
    if (!file) return;
    setSizeError('');
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setSizeError(`File too large (max 5 MB). Selected file is ${(file.size / 1024 / 1024).toFixed(1)} MB.`);
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setTempImageSrc(reader.result?.toString() || null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCropDialogOpen(true);
    });
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const onCropComplete = useCallback((_: any, pixels: any) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const createCroppedImage = async () => {
    if (!tempImageSrc || !croppedAreaPixels) return;
    setIsProcessing(true);

    try {
      const image = new Image();
      image.src = tempImageSrc;
      await new Promise<void>(resolve => { image.onload = () => resolve(); });

      // Output at 400×400 regardless of crop size — keeps file sizes small
      const OUTPUT_SIZE = 400;
      const canvas = document.createElement('canvas');
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No 2d context');

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE,
      );

      canvas.toBlob((blob) => {
        if (!blob) { setIsProcessing(false); return; }
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
        const objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);
        onImageSelected?.(file);
        setIsProcessing(false);
        setCropDialogOpen(false);
      }, 'image/jpeg', 0.88);
    } catch (e) {
      console.error('Error cropping image:', e);
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (onDeleteRequested && initialImage) {
      setDeleteLoading(true);
      try {
        await onDeleteRequested();
      } catch {
        setDeleteLoading(false);
        return; // Don't clear UI if server delete failed
      }
      setDeleteLoading(false);
    }
    setImageSrc(null);
    onImageSelected?.(null);
  };

  const iconBtnBase = {
    position: 'absolute' as const,
    width: 28,
    height: 28,
    boxShadow: '0 2px 8px rgba(0,0,0,0.45)',
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{ position: 'relative', display: 'inline-block' }}
        onDragOver={e => { e.preventDefault(); if (!disabled) setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        {/* Avatar */}
        <Avatar
          src={imageSrc || undefined}
          sx={{
            width: size,
            height: size,
            fontSize: size * 0.35,
            fontWeight: 800,
            border: isDragOver
              ? '2px dashed #6366f1'
              : '2px solid',
            borderColor: isDragOver ? '#6366f1' : 'divider',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: isDragOver ? '0 0 0 4px rgba(99,102,241,0.18)' : undefined,
            cursor: disabled ? 'default' : 'pointer',
          }}
          onClick={() => !disabled && fileInputRef.current?.click()}
        />

        {/* Camera / upload button */}
        <Tooltip title="Upload photo" placement="bottom">
          <IconButton
            size="small"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            sx={{
              ...iconBtnBase,
              bottom: -4,
              right: -4,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            <CameraAltRoundedIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>

        {/* Delete button */}
        {imageSrc && (
          <Tooltip title="Remove photo" placement="top">
            <IconButton
              size="small"
              onClick={handleDelete}
              disabled={disabled || deleteLoading}
              sx={{
                ...iconBtnBase,
                top: -4,
                right: -4,
                bgcolor: 'error.main',
                color: 'error.contrastText',
                '&:hover': { bgcolor: 'error.dark' },
              }}
            >
              {deleteLoading
                ? <CircularProgress size={12} color="inherit" />
                : <DeleteIcon sx={{ fontSize: 14 }} />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Hint text */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: sizeError ? 'error.main' : 'text.secondary', display: 'block' }}>
          {sizeError || 'JPG, PNG or WebP · max 5 MB'}
        </Typography>
        {!sizeError && (
          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem', display: 'block' }}>
            Click or drag &amp; drop to upload
          </Typography>
        )}
      </Box>

      <input
        type="file"
        accept="image/png, image/jpeg, image/webp"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Crop Dialog */}
      <Dialog
        open={cropDialogOpen}
        onClose={() => !isProcessing && setCropDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Crop Profile Photo</DialogTitle>
        <DialogContent
          sx={{
            position: 'relative',
            height: 360,
            bgcolor: '#111',
            p: '0 !important',
            overflow: 'hidden',
          }}
        >
          {tempImageSrc && (
            <Cropper
              image={tempImageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          )}
        </DialogContent>

        {/* Zoom slider */}
        <Box sx={{ px: 3, pt: 2, pb: 0 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            Zoom
          </Typography>
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.05}
            onChange={(_: Event, v: number | number[]) => setZoom((Array.isArray(v) ? (v[0] ?? 1) : v) as number)}
            disabled={isProcessing}
            size="small"
          />
        </Box>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setCropDialogOpen(false)} disabled={isProcessing} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            onClick={createCroppedImage}
            variant="contained"
            disabled={isProcessing}
            sx={{ fontWeight: 700, minWidth: 110 }}
          >
            {isProcessing ? <CircularProgress size={20} color="inherit" /> : 'Use Photo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
