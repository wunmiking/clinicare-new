import { getAllStats, getPatientStats } from "@/api/dashboard";
import ErrorAlert from "@/components/ErrorAlert";
import { LazyLoader } from "@/components/LazyLoader";
import PageWrapper from "@/components/PageWrapper";
import ProgressCardAppointment from "@/features/dashboard/ProgressCardAppointment";
import ProgressCardPayment from "@/features/dashboard/ProgressCardPayments";
import RecentAppointments from "@/features/dashboard/RecentAppointments";
import RecentPayments from "@/features/dashboard/RecentPayments";
import StatsCard from "@/features/dashboard/StatsCard";
import { useAuth } from "@/store";
import { formatCurrency } from "@/utils/constants";
import { RiCalendarScheduleLine, RiLineChartLine } from "@remixicon/react";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { accessToken, user } = useAuth();
  const { isPending, isError, data, error } = useQuery({
    queryKey: ["getDashboardStats", accessToken],
    queryFn: () => {
      if (user?.role === "patient") {
        return getPatientStats(accessToken);
      } else {
        return getAllStats(accessToken);
      }
    },
  });

  const stats = data?.data?.data;

  if (isPending) {
    return <LazyLoader />;
  }

  return (
    <PageWrapper>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-2xl">Dashboard</h1>
          <p className="text-gray-500">See recent activity</p>
        </div>
      </div>
      <div className="mt-8 space-y-8">
        {isError && <ErrorAlert error={error?.response?.data?.message} />}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            stats={stats}
            title="Appointments"
            figure={stats?.appointmentCount || 0}
            icon={<RiCalendarScheduleLine />}
            desc={`${
              stats?.recentAppointmentCount || 0
            } booked within the past 7days`}
          />
          <StatsCard
            stats={stats}
            title="Payments"
            figure={stats?.paymentCount || 0}
            icon={<RiLineChartLine />}
            desc="Confirmed payments"
          />
          <StatsCard
            stats={stats}
            title="Total Payments"
            figure={formatCurrency(stats?.totalPayments || 0)}
            icon={<RiLineChartLine />}
            desc={
              stats?.pendingPayments?.length > 0
                ? `${stats?.pendingPayments} pending payments`
                : "0 pending payments"
            }
          />
        </div>
        <div className="mt-14 space-y-8">
          {user?.role !== "patient" && (
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6 bg-white p-4 rounded-lg ">
                <h1 className="font-bold mb-4">
                  Recent registered patients (past 7 days)
                </h1>
                {stats?.recentUsers?.map((user) => (
                  <div className="flex gap-2 mb-2 items-center" key={user._id}>
                    <div className="avatar avatar-placeholder">
                      <div className="w-14 rounded-full bg-gray-300 text-gray-600 border-2 border-gray-300">
                        {user?.avatar ? (
                          <img
                            src={user?.avatar}
                            alt={user?.fullname}
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            priority="high"
                          />
                        ) : (
                          <span className="text-sm">
                            {user?.fullname
                              ?.split(" ")
                              .map((name) => name[0])
                              .join("")
                              .toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <h1>{user?.fullname}</h1>
                  </div>
                ))}
              </div>
              <div className="col-span-12 md:col-span-6 bg-white p-4 rounded-lg">
                <h1 className="font-bold mb-4">Recent inPatients</h1>
                {stats?.inPatients?.map((user) => (
                  <div className="flex gap-2 mb-2 items-center" key={user._id}>
                    <div className="avatar avatar-placeholder">
                      <div className="w-14 rounded-full bg-gray-300 text-gray-600 border-2 border-gray-300">
                        {user?.patientId?.avatar ? (
                          <img
                            src={user?.patientId?.avatar}
                            alt={user?.patientId?.fullname}
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            priority="high"
                          />
                        ) : (
                          <span className="text-sm">
                            {user?.patientId?.fullname
                              ?.split(" ")
                              .map((name) => name[0])
                              .join("")
                              .toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <h1>{user?.patientId?.fullname}</h1>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-4">
            <ProgressCardAppointment
              appointmentSummary={stats?.appointmentSummary}
              user={user}
            />
            <ProgressCardPayment
              paymentSummary={stats?.paymentSummary}
              user={user}
            />
          </div>
          <div className="space-y-4">
            <RecentAppointments
              appointments={stats?.recentAppointments}
              user={user}
            />
            <RecentPayments payments={stats?.recentPayments} user={user} />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
