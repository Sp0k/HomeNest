import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { createFile } from '../../../redux/actionCreators/fileFoldersActionCreator';
import Select from 'react-select';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

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
        } else {
          alert(t('error.file.already.exists'));
        }
      } else {
        alert(t('error.file.name.short'));
      }
    } else {
      alert(t('error.file.name.empty'));
    }
  }

  return (
    <div 
      className="col-md-12 position-fixed top-0 left-0 w-100 h-100"
      style={{ background: "rgba(0, 0, 0, 0.4)", zIndex: 9999 }}
    >
      <div className='row align-items-center justify-content-center'>
        <div className="col-md-4 mt-5 bg-white rounded p-4">
          <div className="d-flex justify-content-between">
            <h4>{t('create.file')}</h4>
            <button className="btn" onClick={() => setIsCreateFileModalOpen(false)}>
              <FontAwesomeIcon
                icon={faTimes}
                className="text-black"
                size="sm"
              />
            </button>
          </div>
          <hr />
            <Select
              className="basic-single"
              classNamePrefix="select"
              isClearable={false}
              isSearchable={false}
              options={fileTypeOptions}
              defaultValue={fileTypeOptions[0]}
              onChange={(e) => setFileType(e.value)}
            />
          <div className='d-flex flex-column align-items-center'>
            <form className='mt-3 w-100' onSubmit={handleSubmit}>
              <div className='form-group'>
                <input
                  type="text"
                  className="form-control"
                  id="fileName"
                  placeholder={t('file.name')}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>
              <button
                type="submit" 
                className="btn btn-primary mt-5 form-control"
              >
                {t('create.file')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateFile
