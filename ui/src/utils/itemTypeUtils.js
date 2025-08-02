import ItemType from "../components/Types/itemType";

export function getItemType(itemName, userFolders) {
  return (userFolders.find(f => f.name === itemName)) 
    ? ItemType.FOLDER 
    : ItemType.FILE;
}
