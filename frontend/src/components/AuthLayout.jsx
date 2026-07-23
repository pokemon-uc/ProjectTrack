import illustration from "../assets/projecttrack-full-illustration.png";

export default function AuthLayout({ children }) {
  return (
    <main className="flex min-h-screen bg-[#fafbff]">
      {/* Left illustration */}
      <section className="hidden w-1/2 items-center justify-center border-r border-gray-100 bg-white lg:flex">
        <div className="flex w-full flex-col items-center px-8">
          <img
            src={illustration}
            alt="Students submitting and reviewing a digital project"
            className="w-full max-w-[590px] select-none object-contain"
            draggable={false}
          />

          <h2 className="mt-5 text-[21px] font-medium tracking-[-0.02em] text-gray-800">
            Digital submission, simplified.
          </h2>
        </div>
      </section>

      {/* Right authentication form */}
      <section className="flex w-full flex-1 items-center justify-center bg-gradient-to-b from-white to-[#f5f7fc] px-5 py-10 lg:w-1/2">
        <div className="w-full max-w-[390px]">
          {children}
        </div>
      </section>
    </main>
  );
}