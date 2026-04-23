const Notification = ({ message, type }) => {
  if (!message) return null;
  return (
    <div
      className={`fixed top-20 right-4 px-4 py-2 rounded shadow text-white ${
        type === "error" ? "bg-red-500" : "bg-green-600"
      }`}
    >
      {message}
    </div>
  );
};

export default Notification;
