import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Pencil,
  Activity,
  CirclePlus,
  ArrowUpDown,
} from 'lucide-react';

import { Header } from '@/components/Header';
import { paths } from '@/config/paths';

export const StatusesPage: React.FC = () => {
  const navigate = useNavigate();

  const statuses = [
    { id: 1, name: 'Chờ xử lý', type: 'start' },
    { id: 2, name: 'Đang chuẩn bị', type: 'mid' },
    { id: 3, name: 'Đang nướng', type: 'mid' },
    { id: 4, name: 'Đang trang trí', type: 'mid' },
    { id: 5, name: 'Kiểm tra chất lượng', type: 'mid' },
    { id: 6, name: 'Hoàn thành', type: 'end' },
  ];

  const midCount = statuses.filter((s) => s.type === 'mid').length;
  const canAddMore = midCount < 18;

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Quy trình phục vụ" Icon={Activity} backUrl={paths.settings.index}>
        <div className="flex items-center gap-4">
          {midCount > 1 && (
            <Link
              to={paths.statuses.reorder}
              className="text-(--color-primary)"
            >
              <ArrowUpDown size={20} />
            </Link>
          )}

          {canAddMore && (
            <Link
              to={paths.statuses.create}
              className="text-(--color-primary)"
            >
              <CirclePlus size={24} />
            </Link>
          )}
        </div>
      </Header>

      <div className="flex-1 relative mt-4">
        <div className="absolute inset-0 flex">
          <div className="flex-1 overflow-auto pb-4">
            <div className="bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)">
              {statuses.map((st) => (
                <div
                  key={st.id}
                  className="px-4 py-3 flex justify-between items-center gap-2"
                >
                  <div className="flex-1">
                    <p className="text-(--color-text-main) truncate">
                      {st.name}
                    </p>

                    <p className="text-(--color-text-secondary) mt-0.5">
                      {st.type === 'start'
                        ? 'Bắt đầu'
                        : st.type === 'end'
                          ? 'Kết thúc'
                          : 'Trung gian'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Link
                      to={paths.statuses.edit(st.id)}
                      state={{
                        status: st,
                      }}
                      className="text-(--color-warning)"
                    >
                      <Pencil size={20} />
                    </Link>

                    {st.type === 'mid' && (
                      <button
                        className="text-(--color-danger)"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
