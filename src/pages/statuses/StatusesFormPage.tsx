import { useNavigate } from 'react-router-dom';
import { Activity, CheckCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { paths } from '@/config/paths';

type Props = {
  type: 'create' | 'edit'
}

export const StatusesFormPage: React.FC<Props> = ({ type }) => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title={type === 'create' ? 'Thêm Trạng Thái' : 'Sửa Trạng Thái'}
        Icon={Activity}
        backUrl={paths.statuses.index}
      >
        <button
          onClick={() => navigate(-1)}
          className="text-(--color-primary)"
        >
          <CheckCircle size={24} />
        </button>
      </Header>

      <form className="flex-1 flex flex-col">
        <div className="mt-4 bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
          <div className="flex px-4 py-3 items-center gap-2">
            <span className="font-medium">Tên trạng thái</span>
            <input
              autoFocus
              placeholder="Pha chế..."
              className="flex-1 text-right"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
