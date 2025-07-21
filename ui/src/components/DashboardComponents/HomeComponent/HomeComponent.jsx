import { shallowEqual, useSelector } from "react-redux";
import ShowItems from "../ShowItems/ShowItems";
import ItemType from "../../Types/itemType";
import { useTranslation } from "react-i18next";

const HomeComponent = () => {
  const files = [{ name: "New File" }, { name: "New File 2" }];

  const { isLoading, userFolders } = useSelector(
    (state) => ({
      isLoading: state.fileFolders.isLoading,
      userFolders: state.fileFolders.userFolders,
    }), shallowEqual);

  const { t } = useTranslation();

  const hasFolders = userFolders?.length > 0;
  // const hasFiles = userFiles?.length > 0;
  const hasFiles = true;

  if (isLoading) {
    return (
      <h1 className="display-1 my-5 text-center">
        {t("loading")}
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
          title={t("created.folders")}
          type={ItemType.FOLDER}
          items={userFolders}
        />
      )}
      {hasFiles && (
        <ShowItems
          title={t("created.files")}
          type={ItemType.FILE}
          items={files}
        />
      )}
    </div>
  );
}

export default HomeComponent
