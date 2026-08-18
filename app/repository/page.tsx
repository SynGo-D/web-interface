import RepositoryForm from "@/components/forms/RepositoryForm";

export default function RepositoryPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#4338CA]">
      <div className="mx-auto max-w-5xl ">

        {/* Header */}
        <div className="mb-8 ">
          <h1 className="text-3xl font-bold text-gray-200">
            Repository Dashboard
          </h1>

          <p className="mt-2 text-gray-400">
            Connect and manage your software repositories for automated code
            analysis.
          </p>
        </div>


        {/* Add Repository */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Add Repository
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Connect your GitHub repository to start automated code reviews and
            technical debt analysis.
          </p>

          <RepositoryForm />
        </div>


        {/* Connected Repositories */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Connected Repositories
          </h2>

          <div className="mt-4 rounded-lg bg-gray-50 p-5 text-center text-gray-500">
            No repositories connected yet.
          </div>
        </div>

      </div>
    </main>
  );
}