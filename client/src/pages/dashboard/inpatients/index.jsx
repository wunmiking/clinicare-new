import { getAllInpatients } from "@/api/inpatients";
import PageWrapper from "@/components/PageWrapper";
import Search from "@/components/Search";
import AddInpatient from "@/features/inpatients/AddInpatient";
import Filter from "@/features/inpatients/Filter";
import usePaginate from "@/hooks/usePaginate";
import { useAuth } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import ErrorAlert from "@/components/ErrorAlert";
import { lazy, Suspense } from "react";
import { SkeletonTable } from "@/components/LazyLoader";
import Paginate from "@/components/paginate";
import useMetaArgs from "@/hooks/useMeta";
const Table = lazy(() => import("@/features/inpatients/Table"));

export default function Inpatients() {
  useMetaArgs({
    title: "Manage Inpatients",
    description: "Inpatients",
    keywords: "Health, Patients",
  });
  const { accessToken } = useAuth();
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const query = searchParams.get("query") || "";
  const status = searchParams.get("status") || "";
  const admissionDate = searchParams.get("startDate") || "";
  const dischargeDate = searchParams.get("endDate") || "";
  const { isPending, isError, data, error } = useQuery({
    queryKey: [
      "getAllInpatients",
      page,
      limit,
      query,
      status,
      admissionDate,
      dischargeDate,
    ],
    queryFn: () => getAllInpatients(searchParams, accessToken),
  });
  const { handlePageChange, totalPages, hasMore, currentPage } = usePaginate({
    totalPages: data?.data?.data?.meta?.totalPages || 1,
    hasMore: data?.data?.data?.meta?.hasMore || false,
    currentPage: data?.data?.data?.meta?.currentPage || 1,
  });
  const inpatients = data?.data?.data?.inpatients || [];

  return (
    <PageWrapper>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-2xl">Inpatients</h1>
          <p className="text-gray-500">Manage admitted patients</p>
        </div>
        <AddInpatient />
      </div>
      <div className="mt-8 space-y-6">
        <div className="flex justify-end items-center">
          <Search id="search-inpatients">
            <Filter />
          </Search>
        </div>
        {isPending ? (
          <SkeletonTable />
        ) : (
          <>
            {isError ? (
              <ErrorAlert error={error?.response?.data?.message} />
            ) : (
              <>
                <Suspense fallback={<SkeletonTable />}>
                  <Table inpatients={inpatients} />
                </Suspense>
                <Paginate
                  totalPages={totalPages}
                  hasMore={hasMore}
                  handlePageChange={handlePageChange}
                  currentPage={currentPage}
                />
              </>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  );
}
