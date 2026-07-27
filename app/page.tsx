import LoginForm from "@/components/forms/LoginForm";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#4338CA]">
       <div className="flex flex-col items-center">
        <div className="mb-6 flex items-center gap-2">
          <Image
            src="/assets/icons/logo.png"
            width={32}
            height={32}
            alt="CodeLens Logo"
          />

          <h1 className="text-4xl font-semibold text-white">
            CodeLens
          </h1>
        </div>

        <div className="w-112.5 rounded-xl bg-white p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome To CodeLens
          </h2>

          <p className="mt-1 text-gray-500">
            Please sign in to your workspace
          </p>

          <LoginForm />
        </div>

       </div>
    </div>
  );
}
