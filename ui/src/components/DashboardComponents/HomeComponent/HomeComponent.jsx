import ShowItems from "../ShowItems/ShowItems";
import { useTranslation } from "react-i18next";

const HomeComponent = () => {
  const folders = ["New Folder", "New Folder 2"];
  const files = ["New File", "New File 2"];
  const { t } = useTranslation();
  return (
    <div className="col-md-12 w-100">
      <ShowItems title={t('created.folders')} items={folders} />
      <ShowItems title={t('created.files')} items={files} />
    </div>
  )
}

export default HomeComponent
