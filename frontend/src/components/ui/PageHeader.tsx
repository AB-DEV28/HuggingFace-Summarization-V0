import Link from 'next/link';

type PageHeaderProps = {
  title: string;
  actionLink?: {
    href: string;
    label: string;
  };
};

export function PageHeader({ title, actionLink }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {title}
      </h1>
      {actionLink && (
        <Link
          href={actionLink.href}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          {actionLink.label}
        </Link>
      )}
    </div>
  );
}
