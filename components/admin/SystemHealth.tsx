const services = [
  {
    name: "GitHub Webhook Service",
    status: "Operational",
  },
  {
    name: "RabbitMQ",
    status: "Operational",
  },
  {
    name: "Static Analysis Service",
    status: "Operational",
  },
  {
    name: "AI Suggestion Service",
    status: "Operational",
  },
  {
    name: "Database",
    status: "Operational",
  },
];

export default function SystemHealth() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">

      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-800">
          System Health
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Current status of platform services
        </p>
      </div>

      <div className="space-y-4">

        {services.map((service) => (
          <div
            key={service.name}
            className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
          >

            <div className="flex items-center gap-3">

              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

              <span className="text-sm font-medium text-gray-700">
                {service.name}
              </span>

            </div>

            <span className="text-xs font-semibold text-green-600">
              {service.status}
            </span>

          </div>
        ))}

      </div>

    </div>
  );
}