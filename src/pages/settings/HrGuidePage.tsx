import React from 'react';
import { Info } from 'lucide-react';

import { Header } from '@/components/Header';
import { paths } from '@/config/paths';
import { HR_GUIDE_SECTIONS } from '@/constants/hr-guide';

export const HrGuidePage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col h-full min-h-0">
      <Header title="Hướng dẫn chấm công & lương" Icon={Info} backUrl={paths.settings.index} />

      <div className="flex-1 overflow-auto pb-6">
        <p className="px-4 pt-4 text-sm text-(--color-text-secondary) leading-relaxed">
          Tài liệu ngắn gọn giúp chủ cửa hàng vận hành chấm công và tính lương trên Orderly.
        </p>

        {HR_GUIDE_SECTIONS.map((section) => (
          <section key={section.id}>
            <h3 className="sticky top-0 z-10 font-semibold text-(--color-text-secondary) px-4 py-3 bg-(--color-bg-main) border-y border-(--color-border-subtle)">
              {section.title}
            </h3>
            <div className="bg-(--color-bg-surface) border-b border-(--color-border-main) px-4 py-3 space-y-2">
              {section.paragraphs.map((text) => (
                <p key={text} className="text-sm text-(--color-text-main) leading-relaxed">
                  {text}
                </p>
              ))}
              {section.bullets && section.bullets.length > 0 && (
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-(--color-text-secondary)">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
