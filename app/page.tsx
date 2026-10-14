import Clock from "./components/Clock";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Clock />
      <h1 className="mt-8 text-4xl font-bold">
        XRPLendTrust
      </h1>
      <p className="mt-4 text-lg text-gray-500">
        Trust, on the ledger.
      </p>
    </main>
  );
}

