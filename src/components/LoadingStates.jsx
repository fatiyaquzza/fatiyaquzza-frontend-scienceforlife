const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
);

export const PageLoader = ({ label = "Memuat data..." }) => (
  <div className="flex min-h-screen items-center justify-center bg-light">
    <div className="w-full max-w-sm px-6 text-center">
      <div className="mx-auto mb-5 h-14 w-14 animate-pulse rounded-2xl bg-green-100" />
      <Skeleton className="mx-auto mb-3 h-4 w-44" />
      <Skeleton className="mx-auto h-3 w-28" />
      <p className="sr-only">{label}</p>
    </div>
  </div>
);

export const ModuleGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={`module-skeleton-${index}`}
        className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg"
      >
        <Skeleton className="h-48 w-full rounded-none" />
        <div className="p-6">
          <Skeleton className="mb-3 h-6 w-3/4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <Skeleton className="h-8 w-28 rounded-lg" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const ModuleDetailSkeleton = () => (
  <div className="min-h-screen bg-light py-6 pt-20 sm:py-8 sm:pt-24">
    <div className="container mx-auto max-w-7xl px-4">
      <Skeleton className="mb-8 h-5 w-48" />
      <div className="mb-4 rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
        <Skeleton className="mb-4 h-10 w-2/3" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-44 rounded-2xl" />
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const MaterialPageSkeleton = () => (
  <div className="min-h-screen bg-light py-4 pt-20 pb-10 sm:py-8 sm:pt-24">
    <div className="container mx-auto max-w-7xl px-3 sm:px-4">
      <Skeleton className="mb-8 h-5 w-56" />
      <div className="mb-4 rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
        <Skeleton className="mb-3 h-10 w-2/3" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
          <Skeleton className="mb-5 h-8 w-56" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    </div>
  </div>
);

export const QuestionPageSkeleton = ({ title = "Soal" }) => (
  <div className="min-h-screen bg-light py-6 pt-20 pb-12 sm:py-8 sm:pt-24">
    <div className="container mx-auto max-w-4xl px-4">
      <Skeleton className="mb-8 h-9 w-36" />
      <p className="sr-only">Memuat {title}</p>
      <div className="space-y-8">
        {[1, 2, 3].map((item) => (
          <div key={item} className="rounded-lg bg-white p-6 shadow">
            <Skeleton className="mb-4 h-6 w-24" />
            <Skeleton className="mb-3 h-4 w-full" />
            <Skeleton className="mb-5 h-4 w-5/6" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((option) => (
                <Skeleton key={option} className="h-12 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const ResultPageSkeleton = () => (
  <div className="min-h-screen bg-light py-6 pt-20 pb-12 sm:py-8 sm:pt-24">
    <div className="container mx-auto max-w-4xl px-4">
      <Skeleton className="mb-8 h-9 w-48" />
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <Skeleton className="mx-auto mb-4 h-4 w-24" />
        <Skeleton className="mx-auto mb-4 h-10 w-64" />
        <Skeleton className="mx-auto mb-8 h-5 w-80" />
        <div className="grid gap-4 rounded-lg bg-light p-6 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="text-center">
              <Skeleton className="mx-auto mb-2 h-8 w-16" />
              <Skeleton className="mx-auto h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const AdminTableSkeleton = ({ columns = [], rowCount = 5 }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      {columns.length > 0 && (
        <thead className="bg-primary text-white">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-6 py-3 text-left">
                {column}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {Array.from({ length: rowCount }).map((_, rowIndex) => (
          <tr key={`admin-table-skeleton-${rowIndex}`} className="border-t">
            {columns.map((column, columnIndex) => (
              <td key={`${column}-${columnIndex}`} className="px-6 py-4">
                <Skeleton
                  className={`h-4 ${
                    columnIndex === columns.length - 1 ? "w-28" : "w-36"
                  }`}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const ProgressPanelSkeleton = () => (
  <div className="space-y-6 p-5 sm:p-6">
    <div className="grid gap-3 sm:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <Skeleton key={item} className="h-24 rounded-xl" />
      ))}
    </div>
    <div className="space-y-4">
      {[1, 2].map((item) => (
        <Skeleton key={item} className="h-48 rounded-2xl" />
      ))}
    </div>
  </div>
);
