import { ControlledMenu, MenuItem } from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import { useTranslation } from 'react-i18next';
import ItemType from '../../Types/itemType';

export default function ContextMenu({
  open,
  anchorPoint,
  type,
  onClose,
  onOpenClick,
  onDeleteClick,
  onRenameClick,
  onDownloadClick
}) {
  const { t } = useTranslation();
  return (
    <ControlledMenu
      anchorPoint={anchorPoint}
      state={open ? 'open' : 'closed'}
      onClose={onClose}
    >
      <MenuItem onClick={onOpenClick}>{t('open')}</MenuItem>
      <MenuItem onClick={onRenameClick}>{t('rename')}</MenuItem>
      {type === ItemType.FILE && (
        <MenuItem onClick={onDownloadClick}>{t('download')}</MenuItem>
      )}
      <MenuItem onClick={onDeleteClick}>{t('delete')}</MenuItem>
    </ControlledMenu>
  );
}
