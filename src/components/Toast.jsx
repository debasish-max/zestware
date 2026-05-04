export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 bg-black text-white px-5 py-3 rounded-full">
      {message}
    </div>
  );
}
