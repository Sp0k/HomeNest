import { 
  faFileAlt,
  faFileWord,
  faFileExcel,
  faFilePowerpoint,
  faFileImage,
  faFileAudio,
  faFileVideo,
  faFilePdf,
  faFileCode,
  faFileCircleCheck,
  faArchive,
} from "@fortawesome/free-solid-svg-icons";

import { 
  DocumentEditingFormats,
  SpreadsheetEditingFormats,
  PresentationEditingFormats,
  FormEditingFormats,
} from '../../Types/onlyOfficeFileTypes';
import {
  ImageFormats,
  AudioFormats,
  VideoFormats,
  PdfFormats,
  ArchiveFormats,
} from '../../Types/mediaFileTypes';
import { CodeFileTypes } from '../../Types/codeFileTypes';

const extensionIconMap = new Map();

function normalizeFormats(formats) {
  if (Array.isArray(formats)) return formats;
  return Object.values(formats);
}

function register(formats, icon) {
  normalizeFormats(formats).forEach(ext =>
    extensionIconMap.set(ext.toLowerCase(), icon)
  );
}

// Only Office Files
register(DocumentEditingFormats,    faFileWord);
register(SpreadsheetEditingFormats, faFileExcel);
register(PresentationEditingFormats,faFilePowerpoint);
register(FormEditingFormats,        faFileCircleCheck);

// Media / Archive / Code
register(ImageFormats,   faFileImage);
register(AudioFormats,   faFileAudio);
register(VideoFormats,   faFileVideo);
register(PdfFormats,     faFilePdf);
register(ArchiveFormats, faArchive);
register(CodeFileTypes,  faFileCode);

export const selectFileIcon = (fileName) => {
  const idx = fileName.lastIndexOf('.');
  if (idx === -1) return faFileAlt;

  const ext = fileName.slice(idx + 1).toLowerCase();
  return extensionIconMap.get(ext) || faFileAlt;
};

