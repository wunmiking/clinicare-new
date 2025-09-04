export default function ProgressCardPayment({ paymentSummary }) {
  const total = paymentSummary?.total || 0;
  const counts = paymentSummary?.counts || {
    pending: 0,
    confirmed: 0,
    cancelled: 0,
  };
  const percentages = paymentSummary?.percentages || {
    pending: 0,
    confirmed: 0,
    cancelled: 0,
  };

  const items = [
    {
      key: "pending",
      label: "Pending",
      color: "bg-blue-500",
      ring: "border-blue-500",
    },
    {
      key: "confirmed",
      label: "Confirmed",
      color: "bg-green-500",
      ring: "border-green-500",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      color: "bg-red-500",
      ring: "border-red-500",
    },
  ];
  return (
    <>
      <h1 className="font-bold mb-2">Payment summary</h1>
      <div className="w-full grid grid-cols-12 gap-4">
        {items.map(({ key, label, color, ring }) => {
          const pct = percentages[key] || 0;
          const cnt = counts[key] || 0;
          return (
            <div key={key} className="col-span-12 md:col-span-4 bg-white rounded-lg p-4">
              <p className="font-semibold mb-3">{label}</p>
              <div className="flex items-center gap-4">
                <div
                  className={`radial-progress text-white ${color} ${ring} border-4`}
                  style={{ "--value": pct }}
                  aria-valuenow={pct}
                  role="progressbar"
                >
                  {pct}%
                </div>
                <div>
                  <p className="text-sm text-gray-600">Count</p>
                  <p className="text-xl font-semibold">
                    {cnt}{" "}
                    <span className="text-gray-500 text-sm">/ {total}</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
