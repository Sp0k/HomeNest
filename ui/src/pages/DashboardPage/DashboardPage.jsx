import { useState } from "react"
import HomeComponent from "../../components/DashboardComponents/HomeComponent/HomeComponent"
import Navbar from "../../components/DashboardComponents/Navbar/Navbar"
import SubBar from "../../components/DashboardComponents/SubBar/SubBar"
import CreateFolder from "../../components/DashboardComponents/CreateFolder/CreateFolder"
import CreateFile from "../../components/DashboardComponents/CreateFile/CreateFile"

const DashboardPage = () => {
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isCreateFileModalOpen, setIsCreateFileModalOpen] = useState(false);

  return (
    <>
      {
        isCreateFolderModalOpen && (
          <CreateFolder
            setIsCreateFolderModalOpen={setIsCreateFolderModalOpen}
          />
        )
      }
      {
        isCreateFileModalOpen && (
          <CreateFile
            setIsCreateFileModalOpen={setIsCreateFileModalOpen}
          />
        )
      }
      <Navbar />
      <SubBar 
        setIsCreateFolderModalOpen={setIsCreateFolderModalOpen} 
        setIsCreateFileModalOpen={setIsCreateFileModalOpen}
      />
      <HomeComponent />
    </>
  )
}

export default DashboardPage
