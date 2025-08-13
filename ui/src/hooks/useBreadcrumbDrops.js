import { useCallback } from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { changeFolder, moveItem } from "../redux/actionCreators/fileFoldersActionCreator";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import apiClient from "../utils/apiClient";

function useBreadcrumbDrop(currentFolder, fetchItems) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return useCallback(async (sourcePath, destFolder, type) => {
    const name = sourcePath.split('/').pop();
    const data = {
      fromPath: sourcePath,
      toPath: destFolder,
      name,
      type,
    }

    dispatch(moveItem(data));
  }, [currentFolder, dispatch, navigate, fetchItems, t]);
}

export default useBreadcrumbDrop;
