import React, { createContext, useContext, useState } from "react";
import "./NotifyContext.css"
const NotifyContext = createContext();

export const NotifyProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const notify = (message, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => setNotification(null), 5000); // Auto-hide after 5s
  };

  return (
    <NotifyContext.Provider value={notify}>
      {children}
      {notification && (
        <div className="main-error">
          <div className={`notify ${notification.isError ? "error" : "success"}`}>
          <div className="notification_icon">
          <i class="fa-solid fa-bell"></i>
          </div>
          {notification.message}
        </div>
        </div>
      )}
    </NotifyContext.Provider>
  );
};

export const useNotify = () => useContext(NotifyContext);
