import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { paths } from '@/config/paths';

type Props = {
  type: 'create' | 'edit'
}

export const MenuItemsFormPage: React.FC<Props> = ({ type }) => {
  const navigate = useNavigate();

  const categories = [
    { id: 1, name: 'Cà phê' },
    { id: 2, name: 'Trà hoa quả' },
    { id: 3, name: 'Bánh ngọt' },
  ];


  return (
    <div className="flex-1 flex flex-col">
      <Header
        title={`${type === 'edit' ? 'Sửa' : 'Thêm'} Món Ăn`}
        Icon={BookOpen}
        backUrl={paths.menu.index}
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
            <span className="font-medium">Tên món</span>
            <input
              autoFocus
              placeholder="Cà phê đen..."
              className="flex-1 text-right"
            />
          </div>
          <div className="flex px-4 py-3 items-center gap-2">
            <span className="font-medium">Giá bán</span>
            <input
              type="number"
              placeholder="0"
              className="flex-1 text-right tabular-nums"
            />
          </div>
          <div className="flex px-4 py-3 items-center gap-2">
            <span className="font-medium">Danh mục</span>
            <select
              className="flex-1 text-right"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </div>
  );
};
