import { useTranslation } from "react-i18next";
import { shallowEqual, useSelector } from "react-redux";
import ShowItems from "../ShowItems/ShowItems";
import ItemType from "../../Types/itemType";

const FolderComponent = () => {
  const { userFolders } = useSelector(state => ({ userFolders: state.fileFolders.userFolders }), shallowEqual);
  const { t } = useTranslation();

  return (
    <>
      {
        (userFolders?.length > 0) ? (
            <ShowItems title={t('folders')} type={ItemType.FOLDER} items={userFolders}/>
        ) : (
            <p className="text-center my-5">
              {t('folder.empty')}
            </p>
          )
      }
    </>
  );
}

export default FolderComponent
