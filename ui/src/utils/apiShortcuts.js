import apiClient from "./apiClient";

export function fetchItems(path) {
  apiClient.getFolders(path);
  apiClient.getFiles(path);
}
