import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { createFile } from '../../../redux/actionCreators/fileFoldersActionCreator';
import { toast } from 'react-toastify';

import Select from 'react-select';
import FormModal from '../../Common/FormModal/FormModal';

const CreateFile = ({ setIsCreateFileModalOpen }) => {
  const { t } = useTranslation();

  const fileTypeOptions = [
    { value: "docx", label: t('document') },
    { value: "xlsx", label: t('sheet') },
    { value: "pptx", label: t('presentation') },
    { value: "docxf", label: t('form') },
    { value: "", label: t('custom') },
  ];

  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState(fileTypeOptions[0].value);

  const { userFiles, currentFolder} = useSelector(
    state => ({
      userFiles: state.fileFolders.userFiles,
      currentFolder: state.fileFolders.currentFolder,
    }), shallowEqual
  );

  const dispatch = useDispatch();

  const checkFileAlreadyExists = (name) => {
    if (userFiles === null) return false;

    const filePresent = userFiles.find(file => file.name === name);
    if (filePresent)
      return true;
      else
      return false;
  }

  const getFileFullName = () => {
    if (fileType == fileTypeOptions[4].value) return fileName;
    return fileName + "." + fileType;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fileName) {
      if (fileName.length >= 3) {
        if (!checkFileAlreadyExists(getFileFullName())) {
          const data = {
            name: fileName,
            parent: currentFolder,
            type: fileType,
          };
          dispatch(createFile(data));
          setIsCreateFileModalOpen(false);
        } else {
          toast.error(t('error.file.already.exists'));
        }
      } else {
        toast.error(t('error.file.short'));
      }
    } else {
      toast.error(t('error.file.name.empty'));
    }
  }

  return (
    <FormModal
      title={t('create.file')}
      confirmText={t('create.file')}
      onConfirm={handleSubmit}
      onCancel={() => setIsCreateFileModalOpen(false)}
    >
      <div className='form-group'>
        <Select
          className="basic-single w-100 mb-2"
          classNamePrefix="select"
          isClearable={false}
          isSearchable={false}
          options={fileTypeOptions}
          defaultValue={fileTypeOptions[0]}
          onChange={(e) => setFileType(e.value)}
        />
        <input
          type="text"
          className="form-control"
          id="fileName"
          placeholder={t('file.name')}
          onChange={(e) => setFileName(e.target.value)}
        />
      </div>
    </FormModal>
  );
}

export default CreateFile
