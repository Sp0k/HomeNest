import { shallowEqual, useSelector } from "react-redux";
import ShowItems from "../ShowItems/ShowItems";
import ItemType from "../../Types/itemType";
import { useTranslation } from "react-i18next";

const HomeComponent = () => {
  const folders = ["New Folder", "New Folder 2"];
  const files = [{ name: "New File" }, { name: "New File 2" }];

  const { isLoading, userFolders } = useSelector(
    (state) => ({
      isLoading: state.fileFolders.isLoading,
      userFolders: state.fileFolders.userFolders,
    }), shallowEqual);

  const { t } = useTranslation();
  return (
    <div className="col-md-12 w-100">
      {
        isLoading ? (
          <h1 className="display-1 my-5 text-center">{t('loading')}</h1>
        ) : (
            <>
              <ShowItems title={t('created.folders')} type={ItemType.FOLDER} items={userFolders} />
              <ShowItems title={t('created.files')} type={ItemType.FILE} items={files} />
            </>
          )
      }
    </div>
  )
}

export default HomeComponent
