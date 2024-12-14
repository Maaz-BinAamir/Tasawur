import { useState, useEffect, useRef } from "react";
import { supabase } from "./Utility/SupaBaseClient";
import "../style/ChatApp.css";

const ChatApp = () => {
  const currentUserId = Number(localStorage.getItem("userID"));
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("api_customuser")
        .select("*")
        .neq("id", currentUserId);

      if (error) console.error("Error fetching users:", error);
      else setUsers(data);
    };
    console.log(currentUserId);
    fetchUsers();
  }, [currentUserId]);

  useEffect(() => {
    if (selectedUser) {
      const fetchMessages = async () => {
        const { data, error } = await supabase
          .from("api_message")
          .select("*")
          .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
          .or(
            `sender_id.eq.${selectedUser.id},receiver_id.eq.${selectedUser.id}`
          )
          .order("timestamp", { ascending: true });

        if (error) console.error("Error fetching messages:", error);
        else setMessages(data);
      };

      fetchMessages();

      const previousChannel = supabase
        .getChannels()
        .find((ch) => ch.topic === "realtime:messages");
      if (previousChannel) {
        supabase.removeChannel(previousChannel);
      }

      const subscription = supabase
        .channel("realtime:messages")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "api_message" },
          (payload) => {
            const newMessage = payload.new;
            if (
              (newMessage.sender_id === currentUserId &&
                newMessage.receiver_id === selectedUser.id) ||
              (newMessage.sender_id === selectedUser.id &&
                newMessage.receiver_id === currentUserId)
            ) {
              setMessages((prevMessages) => [...prevMessages, newMessage]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [selectedUser, currentUserId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const { error } = await supabase.from("api_message").insert({
      sender_id: currentUserId,
      receiver_id: selectedUser.id,
      content: newMessage.trim(),
    });

    if (error) console.error("Error sending message:", error);
    else {
      setNewMessage("");
    }
  };

  return (
    <div className="chat-app">
      <div className="sidebar">
        <h3>Users</h3>
        <ul>
          {users.map((user) => (
            <li
              key={user.id}
              className={selectedUser?.id === user.id ? "selected" : ""}
              onClick={() => {
                setSelectedUser(user);
                setMessages([]);
              }}
            >
              <img
                src={
                  user.profile_pic || `https://i.pravatar.cc/48?u=${user.id}`
                }
                alt={user.username}
                className="user-avatar"
              />
              <span>{user.username}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="chat-area">
        {selectedUser ? (
          <>
            <h3>Chat with {selectedUser.username}</h3>
            <div
              className="messages"
              style={{
                overflowY: "auto",
                maxHeight: "300px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.sender_id === currentUserId ? "sent" : "received"
                  }
                >
                  {message.content}
                </div>
              ))}
              {/* Invisible div to enable scrolling to bottom */}
              <div ref={messagesEndRef} />
            </div>
            <div className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message"
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <p>Select a user to chat with</p>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
