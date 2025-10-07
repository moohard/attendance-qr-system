import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const UpdateNotification = () => {
  const { needRefresh, updateServiceWorker } = useRegisterSW();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (needRefresh) {
      setShowNotification(true);
    }
  }, [needRefresh]);

  const handleUpdate = () => {
    updateServiceWorker();
    setShowNotification(false);
  };

  if (!showNotification) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-blue-500 text-white p-4 rounded-md shadow-md">
      <span>A new version is available!</span>
      <button onClick={handleUpdate} className="ml-4 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded">
        Update
      </button>
    </div>
  );
};

export default UpdateNotification;
