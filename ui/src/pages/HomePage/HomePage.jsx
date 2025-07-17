import React from 'react'
import { NavigationComponent } from '../../components/HomePageComponents/index'
import { useTranslation } from 'react-i18next';

const HomePage = () => {
  const { t } = useTranslation()
  return (
    <div>
      <NavigationComponent />
      <div className="my-5">
        <h1 className='display-1 mt-5 text-center'>{t('welcome.message')}</h1>
        <h2 className='display-10 my-1 text-center'>{t('welcome.submessage')}</h2>
      </div>
    </div>
  )
};

export default HomePage;
