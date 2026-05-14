import { useNavigate } from 'react-router-dom';
import { Grid, CheckCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { paths } from '@/config/paths';

type Props = {
  type: 'create' | 'edit'
}

export const TablesFormPage: React.FC<Props> = ({ type }) => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title={type === 'create' ? 'Thêm Bàn' : 'Sửa Tên Bàn'}
        Icon={Grid}
        backUrl={paths.areas.index}
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
            <span className="font-medium">Tên bàn</span>
            <input
              autoFocus
              placeholder="Bàn 1..."
              className="flex-1 text-right"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
