export function isDescendant(srcPath, destPath) {
  const src = srcPath.replace(/\/$/, '') + '/';
  const dest = destPath.replace(/\/$/, '') + '/';
  return dest.startsWith(src);
}
