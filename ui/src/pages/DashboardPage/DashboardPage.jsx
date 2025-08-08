import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import Navbar        from "../../components/DashboardComponents/Navbar/Navbar";
import SubBar        from "../../components/DashboardComponents/SubBar/SubBar";
import CreateFolder  from "../../components/DashboardComponents/CreateFolder/CreateFolder";
import CreateFile    from "../../components/DashboardComponents/CreateFile/CreateFile";
import FolderComponent from "../../components/DashboardComponents/FolderComponent/FolderComponent";

import { getFolders, getFiles } from "../../redux/actionCreators/fileFoldersActionCreator";
import UploadFile from "../../components/DashboardComponents/UploadFile/UploadFile";
import PreviewModal from "../../components/DashboardComponents/Preview/PreviewModal";
import NoPreviewModal from "../../components/DashboardComponents/Preview/NoPreviewModal";
import RenameItem from "../../components/DashboardComponents/RenameFile/RenameFile";
import DeleteItem from "../../components/DashboardComponents/DeleteFile/DeleteFile";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const DashboardPage = () => {
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isCreateFileModalOpen,   setIsCreateFileModalOpen]   = useState(false);
  const [isUploadFileModalOpen,   setIsUploadFileModalOpen]   = useState(false);
  const [isRenameItemModalOpen,   setIsRenameItemModalOpen]   = useState(false);
  const [isDeleteItemModalOpen,   setIsDeleteItemModalOpen]   = useState(false);
  const [targetItem, setTargetItem] = useState(null);
  const [preview, setPreview] = useState(null);
  const [noPreview, setNoPreview] = useState(null);

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
      {isUploadFileModalOpen && (
        <UploadFile setIsUploadFileModalOpen={setIsUploadFileModalOpen} />
      )}
      {isRenameItemModalOpen && (
        <RenameItem setIsRenameItemModalOpen={setIsRenameItemModalOpen} item={targetItem} setRenameItem={setTargetItem} />
      )}
      {isDeleteItemModalOpen && (
        <DeleteItem setIsDeleteItemModalOpen={setIsDeleteItemModalOpen} item={targetItem} setTargetItem={setTargetItem} />
      )}
      {preview && (
        <PreviewModal
          file={preview.file}
          type={preview.type}
          onClose={() => setPreview(null)}
        />
      )}
      {noPreview && (
        <NoPreviewModal
          file={noPreview}
          onClose={() => setNoPreview(null)}
        />
      )}
      <Navbar />
      <DndProvider backend={HTML5Backend}>
        <SubBar
          setIsCreateFolderModalOpen={setIsCreateFolderModalOpen}
          setIsCreateFileModalOpen={setIsCreateFileModalOpen}
          setIsUploadFileModalOpen={setIsUploadFileModalOpen}
        />

        <Routes>
          <Route index element={<FolderComponent 
            onPreview={(f, type) => setPreview({file: f, type})} 
            onNoPreview={f => setNoPreview(f)}
            setIsRenameItemModalOpen={setIsRenameItemModalOpen}
            setIsDeleteItemModalOpen={setIsDeleteItemModalOpen}
            setTargetItem={setTargetItem}
          />} />
          <Route
            path="folder/:folderId"
            element={<FolderComponent 
              onPreview={(f, type) => setPreview({file: f, type})} 
              onNoPreview={f => setNoPreview(f)}
              setIsRenameItemModalOpen={setIsRenameItemModalOpen}
              setIsDeleteItemModalOpen={setIsDeleteItemModalOpen}
              setTargetItem={setTargetItem}
            />}
          />
        </Routes>
      </DndProvider>
    </>
  );
};

export default DashboardPage;
