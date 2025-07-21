import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import HomeComponent from "../../components/DashboardComponents/HomeComponent/HomeComponent";
import Navbar        from "../../components/DashboardComponents/Navbar/Navbar";
import SubBar        from "../../components/DashboardComponents/SubBar/SubBar";
import CreateFolder  from "../../components/DashboardComponents/CreateFolder/CreateFolder";
import CreateFile    from "../../components/DashboardComponents/CreateFile/CreateFile";
import FolderComponent from "../../components/DashboardComponents/FolderComponent/FolderComponent";

import { getFolders, getFiles } from "../../redux/actionCreators/fileFoldersActionCreator";

const DashboardPage = () => {
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isCreateFileModalOpen,   setIsCreateFileModalOpen]   = useState(false);

  const { isLoading, currentFolder } = useSelector(
    state => ({ isLoading: state.fileFolders.isLoading, currentFolder: state.fileFolders.currentFolder }),
    shallowEqual
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (isLoading) {
      dispatch(getFolders(currentFolder));
      dispatch(getFiles(currentFolder));
    }
  }, [isLoading, dispatch]);

  return (
    <>
      {isCreateFolderModalOpen && (
        <CreateFolder setIsCreateFolderModalOpen={setIsCreateFolderModalOpen} />
      )}
      {isCreateFileModalOpen && (
        <CreateFile setIsCreateFileModalOpen={setIsCreateFileModalOpen} />
      )}
      <Navbar />
      <SubBar
        setIsCreateFolderModalOpen={setIsCreateFolderModalOpen}
        setIsCreateFileModalOpen={setIsCreateFileModalOpen}
      />

      <Routes>
        <Route index element={<FolderComponent />} />
        <Route
          path="folder/:folderId"
          element={<FolderComponent />}
        />
      </Routes>
    </>
  );
};

export default DashboardPage;
