export function getBreadcrumbSegment(currentFolder) {
  return currentFolder === "/"
    ? []
    : currentFolder.split("/").filter(Boolean);
}
