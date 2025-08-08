import ModalOverlay from '../ModalOverlay/ModalOverlay';
import { useTranslation } from 'react-i18next';

const FormModal = ({
  title,
  confirmText,
  onConfirm,
  onCancel,
  confirmColor = "primary",
  cancelColor = "danger",
  children,
}) => {
  const { t } = useTranslation();

  return (
    <ModalOverlay title={title} onClose={onCancel}>
      <form
        onSubmit={e => {
          onConfirm(e);
        }}
        className="w-100"
      >
        {children}
        <div className="d-flex justify-content-end mt-4">
          <button
            type="button"
            className={`btn btn-${cancelColor} me-2`}
            onClick={onCancel}
          >
            {t('cancel')}
          </button>
          <button type="submit" className={`btn btn-${confirmColor}`}>
            {confirmText}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

export default FormModal;
