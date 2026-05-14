import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Store as StoreIcon } from 'lucide-react';
import { Header } from '@/components/Header';
import { paths } from '@/config/paths';

interface IStoresFormPageProps {
  type: "create" | "edit";
}

export const StoresFormPage: React.FC<IStoresFormPageProps> = ({ type }) => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title={type === "create" ? "Thêm Cửa Hàng" : "Sửa Cửa Hàng"}
        Icon={StoreIcon}
        backUrl={paths.stores.index}
      >
        <button
          onClick={() => navigate(paths.stores.index)}
          className="text-(--color-primary)"
        >
          <CheckCircle size={24} />
        </button>
      </Header>

      <form className="flex-1 flex flex-col">
        <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
          <div className="flex px-4 py-3 items-center gap-2">
            <span className="font-medium">Tên quán</span>
            <input
              autoFocus
              placeholder='Orderly Cafe...'
              className="flex-1 text-right"
            />
          </div>
          <div className="flex px-4 py-3 items-center gap-2">
            <span className="font-medium">Địa chỉ</span>
            <input
              placeholder="Cầu giấy..."
              className="flex-1 text-right"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
