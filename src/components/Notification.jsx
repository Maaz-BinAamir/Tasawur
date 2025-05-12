import { useState, useEffect } from "react";
import { supabase } from "./Utility/SupaBaseClient";
import "../style/Notification.css";

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const currentUserId = Number(localStorage.getItem("userID"));

  useEffect(() => {
    // Initial fetch of notifications
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("api_notification")
        .select(
          `
          *,
          actor:actor_id (*),
          post:post_id (*)
        `
        )
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        return;
      }

      setNotifications(data);
      setHasNewNotification(data.some((notification) => !notification.is_read));
    };

    fetchNotifications();

    // Set up real-time subscription for notifications
    const subscription = supabase
      .channel("realtime:notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "api_notification",
          filter: `user_id=eq.${currentUserId}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            // Fetch the complete notification data including actor and post
            const { data: newNotification, error } = await supabase
              .from("api_notification")
              .select(
                `
                *,
                actor:actor_id (*),
                post:post_id (*)
              `
              )
              .eq("id", payload.new.id)
              .single();

            if (!error && newNotification) {
              setNotifications((prevNotifications) => [
                newNotification,
                ...prevNotifications,
              ]);
              setHasNewNotification(true);
            }
          } else if (payload.eventType === "UPDATE") {
            setNotifications((prevNotifications) =>
              prevNotifications.map((notification) =>
                notification.id === payload.new.id ? payload.new : notification
              )
            );
            const hasNew = notifications.some(
              (n) => !n.is_read && n.id !== payload.new.id
            );
            setHasNewNotification(hasNew);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentUserId, notifications]);

  const markAsRead = async (notificationId) => {
    const { error } = await supabase
      .from("api_notification")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking notification as read:", error);
      return;
    }

    // Update local state
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, is_read: true }
          : notification
      )
    );

    // Check if there are any remaining unread notifications
    const hasNew = notifications.some(
      (n) => !n.is_read && n.id !== notificationId
    );
    setHasNewNotification(hasNew);
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.post) {
      window.location.href = `/post/${notification.post.id}`;
    }
    setShowNotifications(false);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="notification-container">
      <button
        className="notification-bell"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <i className="fas fa-bell"></i>
        {hasNewNotification && <span className="notification-dot"></span>}
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {showNotifications && (
        <div className="notification-dropdown">
          {notifications.length === 0 ? (
            <div className="notification-item">No notifications</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${
                  !notification.is_read ? "unread" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <img
                  src={
                    notification.actor.profile_picture || "default-avatar.png"
                  }
                  alt={notification.actor.username}
                  className="notification-avatar"
                />
                <div className="notification-content">
                  <p>{notification.message}</p>
                  <small>
                    {new Date(notification.created_at).toLocaleString()}
                  </small>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Notification;
