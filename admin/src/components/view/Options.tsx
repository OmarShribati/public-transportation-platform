import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { AlertTriangle, Info, Loader, Map, Pen, Trash } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '../modal/Modal';

interface Props {
  id: string | number;
  type: string[];
  searchParams?: any;
  searchParamsForMaps?: any;
  query?: (id: string | number) => Promise<any>;
  queryKey?: any | string[];
  editRoute?: string;
  addRoute?: string;
  map?: string;
  detailsRoute?: string;
  editModalContent?: React.ReactNode | (() => React.ReactNode);
  detailsModalContent?: React.ReactNode | (() => React.ReactNode);
  customActions?: Record<string, JSX.Element>;
  showMap?: any;
}

export const Options: React.FC<Props> = ({
  id,
  type,
  searchParams,
  query,
  queryKey,
  editRoute,
  addRoute,
  detailsRoute,
  map,
  showMap,
  editModalContent,
  detailsModalContent,
  searchParamsForMaps,
  customActions = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () => (query ? query(id) : Promise.reject('No query function')),
    onSuccess: (res) => {
      toast.success(res?.data?.message || 'تم الحذف بنجاح');
      if (queryKey) queryClient.invalidateQueries(queryKey);
      setIsOpen(false);
    },
    onError: () => toast.error('حدث خطأ أثناء الحذف!'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const handleOpenModal = (type: string) => {
    setModalType(type);
    setIsOpen(true);
  };

  const ICON_SIZE = 20;

  const defaultActions: Record<string, JSX.Element | null> = {
    addRoute: addRoute ? (
      <button
        key="addRoute"
        title="إضافة"
        onClick={() => navigate({ to: addRoute, params: { id: String(id) }, search: searchParams })}
        className="w-10 h-10 bg-addButton rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow"
      >
        <Pen size={ICON_SIZE} />
      </button>
    ) : null,

    editModal: editModalContent ? (
      <button
        key="editModal"
        title="تعديل"
        onClick={() => handleOpenModal('edit')}
        className="w-10 h-10 bg-editButton rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow"
      >
        <Pen size={ICON_SIZE} />
      </button>
    ) : null,

    edit: editRoute ? (
      <button
        key="edit"
        title="تعديل (رابط)"
        onClick={() => navigate({ to: editRoute, params: { id: String(id) }, search: searchParams })}
        className="w-10 h-10 bg-editButton rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow"
      >
        <Pen size={ICON_SIZE} />
      </button>
    ) : null,

    delete: query ? (
      <button
        key="delete"
        title="حذف"
        onClick={() => handleOpenModal('delete')}
        className="w-10 h-10 bg-deleteButton rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow"
      >
        <Trash size={ICON_SIZE} />
      </button>
    ) : null,

    detailsModal: detailsModalContent ? (
      <button
        key="detailsModal"
        title="تفاصيل"
        onClick={() => handleOpenModal('details')}
        className="w-10 h-10 bg-detailsButton rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow"
      >
        <Info size={ICON_SIZE} />
      </button>
    ) : null,

    details: detailsRoute ? (
      <button
        key="details"
        title="تفاصيل"
        onClick={() => navigate({ to: detailsRoute, params: { id: String(id) }, search: searchParams })}
        className="w-10 h-10 bg-detailsButton rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow"
      >
        <Info size={ICON_SIZE} />
      </button>
    ) : null,

    map: map ? (
      <button
        key="map"
        title="الخريطة"
        onClick={() => navigate({ to: map.replace('$id', String(id)), search: searchParamsForMaps })}
        className={`w-10 h-10 bg-mainBg rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow ${!showMap ? 'hidden' : ''}`}
      >
        <Map size={ICON_SIZE} />
      </button>
    ) : null,
  };

  const actions = { ...defaultActions, ...customActions };

  let modalContent: React.ReactNode = null;
  let modalTitle = '';

  switch (modalType) {
    case 'edit':
      if (editModalContent) {
        modalContent = typeof editModalContent === 'function' ? editModalContent() : editModalContent;
        modalTitle = 'تعديل';
      }
      break;
    case 'details':
      if (detailsModalContent) {
        modalContent = typeof detailsModalContent === 'function' ? detailsModalContent() : detailsModalContent;
        modalTitle = 'تفاصيل';
      }
      break;
    case 'delete':
      modalTitle = 'تأكيد الحذف';
      modalContent = (
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 p-4 text-center">
          <div className="flex items-center justify-center w-16 h-16 text-red-500 bg-red-100 rounded-full">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">هل أنت متأكد أنك تريد حذف هذا العنصر؟</h3>
          <p className="text-sm text-gray-500">لا يمكن التراجع عن هذا الإجراء بعد الحذف.</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
            >
              {mutation.isPending && <Loader className="w-4 h-4 animate-spin" />}
              حذف نهائي
            </button>
          </div>
        </form>
      );
      break;
  }

  return (
    <div className="flex items-center gap-3">
      {type?.map((action) => {
        const button = actions[action];
        if (!button) return null;

        return (
          <div key={action} className="relative group">
            {button}
            <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              {button.props.title}
            </span>
          </div>
        );
      })}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={modalTitle}>
        {modalContent}
      </Modal>
    </div>
  );
};
