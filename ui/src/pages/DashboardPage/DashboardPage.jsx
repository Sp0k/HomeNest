import HomeComponent from "../../components/DashboardComponents/HomeComponent/HomeComponent"
import Navbar from "../../components/DashboardComponents/Navbar/Navbar"
import SubBar from "../../components/DashboardComponents/SubBar/SubBar"

const DashboardPage = () => {
  return (
    <>
      <Navbar />
      <SubBar />
      <HomeComponent />
    </>
  )
}

export default DashboardPage
