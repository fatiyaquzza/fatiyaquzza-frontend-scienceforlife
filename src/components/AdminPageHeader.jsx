import { ChevronRight } from "lucide-react";

const AdminPageHeader = ({ title, description, section = "Panel Admin", action }) => (
  <header className="mb-6 sm:mb-8">
    <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
      <span>{section}</span>
      <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="text-primary">{title}</span>
    </div>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="break-words text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  </header>
);

export default AdminPageHeader;
