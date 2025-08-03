import { useTranslation } from "react-i18next";
import { shallowEqual, useSelector } from "react-redux";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import ShowItems from "../ShowItems/ShowItems";
import ItemType from "../../Types/itemType";

const FolderComponent = ({ 
  onPreview, 
  onNoPreview, 
  setIsRenameItemModalOpen, 
  setIsDeleteItemModalOpen,
  setTargetItem 
}) => {
  const { userFolders, userFiles, isLoading, currentFolder } = useSelector(
    state => ({ 
      userFolders: state.fileFolders.userFolders,
      userFiles: state.fileFolders.userFiles,
      isLoading: state.fileFolders.isLoading,
      currentFolder: state.fileFolders.currentFolder,
    }), shallowEqual);
  const { t } = useTranslation();

  const hasFolders = userFolders?.length > 0;
  const hasFiles = userFiles?.length > 0;

  if (isLoading) {
    return (
      <h1 className="display-1 my-5 text-center">
        {t('loading')}
      </h1>
    );
  }

  if (!hasFolders && !hasFiles) {
    return (
      <p className="text-center my-5">
        {t("folder.empty")}
      </p>
    );
  }

  return (
    <div className="col-md-12 w-100">
      {hasFolders && (
        <DndProvider backend={HTML5Backend}>
          <ShowItems
            title={t("folders")}
            type={ItemType.FOLDER}
            items={userFolders}
            currentFolder={currentFolder}
            onPreview={onPreview}
            onNoPreview={onNoPreview}
            setIsRenameItemModalOpen={setIsRenameItemModalOpen}
            setIsDeleteItemModalOpen={setIsDeleteItemModalOpen}
            setTargetItem={setTargetItem}
          />
        </DndProvider>
      )}
      {hasFiles && (
        <DndProvider backend={HTML5Backend}>
          <ShowItems
            title={t('files')}
            type={ItemType.FILE}
            items={userFiles}
            currentFolder={currentFolder}
            onPreview={onPreview}
            onNoPreview={onNoPreview}
            setIsRenameItemModalOpen={setIsRenameItemModalOpen}
            setIsDeleteItemModalOpen={setIsDeleteItemModalOpen}
            setTargetItem={setTargetItem}
          />
        </DndProvider>
      )}
    </div>
  )
}

export default FolderComponent
