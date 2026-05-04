export default function OrderSuccess() {
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center">
      <div className="text-5xl mb-4">✅</div>
      <h1 className="text-2xl font-bold mb-2">
        Order Placed Successfully
      </h1>
      <p className="text-gray-500">
        Redirecting you shortly…
      </p>
    </div>
  );
}
