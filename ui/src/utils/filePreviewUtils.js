import {
  ImageFormats,
  AudioFormats,
  VideoFormats,
  PdfFormats,
} from '../components/Types/mediaFileTypes';

export const PREVIEW_EXTENSIONS = {
  image: ImageFormats,
  video: VideoFormats,
  audio: AudioFormats,
  pdf:   PdfFormats,
};

export function getFileExt(filename) {
  const idx = filename.lastIndexOf('.');
  return filename.substring(idx+1).toLowerCase();
}

export function getPreviewType(ext) {
  for (const [type, formats] of Object.entries(PREVIEW_EXTENSIONS)) {
    const allowed = Array.isArray(formats)
      ? formats
      : Object.values(formats);

    if (allowed.includes(ext)) {
      return type;
    }
  }
  return null;
}
