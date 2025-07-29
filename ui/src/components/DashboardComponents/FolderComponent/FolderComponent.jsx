import { useTranslation } from "react-i18next";
import { shallowEqual, useSelector } from "react-redux";
import ShowItems from "../ShowItems/ShowItems";
import ItemType from "../../Types/itemType";

const FolderComponent = ({ 
  onPreview, 
  onNoPreview, 
  setIsRenameItemModalOpen, 
  setIsDeleteItemModalOpen,
  setTargetItem 
}) => {
  const { userFolders, userFiles, isLoading } = useSelector(
    state => ({ 
      userFolders: state.fileFolders.userFolders,
      userFiles: state.fileFolders.userFiles,
      isLoading: state.fileFolders.isLoading,
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
        <ShowItems
          title={t("folders")}
          type={ItemType.FOLDER}
          items={userFolders}
          onPreview={onPreview}
          onNoPreview={onNoPreview}
          setIsRenameItemModalOpen={setIsRenameItemModalOpen}
          setIsDeleteItemModalOpen={setIsDeleteItemModalOpen}
          setTargetItem={setTargetItem}
        />
      )}
      {hasFiles && (
        <ShowItems
          title={t('files')}
          type={ItemType.FILE}
          items={userFiles}
          onPreview={onPreview}
          onNoPreview={onNoPreview}
          setIsRenameItemModalOpen={setIsRenameItemModalOpen}
          setIsDeleteItemModalOpen={setIsDeleteItemModalOpen}
          setTargetItem={setTargetItem}
        />
      )}
    </div>
  )
}

export default FolderComponent
