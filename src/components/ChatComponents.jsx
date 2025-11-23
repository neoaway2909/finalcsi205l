import { useState, useRef, useEffect } from "react";
import {
  FaTimes,
  FaPaperPlane,
  FaRobot,
  FaUser,
  FaCircle,
  FaArrowLeft,
} from "react-icons/fa";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";

// ==================== AIChatModal ====================
export const AIChatModal = ({ isOpen, onClose, lang }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        lang === "th"
          ? "สวัสดีครับ! ผมคือ AI Assistant ที่พร้อมช่วยเหลือคุณเกี่ยวกับเรื่องสุขภาพ มีอะไรให้ช่วยไหมครับ?"
          : "Hello! I am an AI Assistant ready to help you with health-related questions. How can I help you?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Call Google Gemini API with conversation history
      const API_KEY = "AIzaSyAJ-1S_c-5dAmHFyjFPWcdIEyGBF1pG6v0";

      // Build conversation history for context
      const conversationHistory = messages
        .filter((msg) => msg.role !== "assistant" || msg.content) // Filter out empty messages
        .map((msg) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        }));

      // Add current user message
      conversationHistory.push({
        role: "user",
        parts: [{ text: userMessage }],
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: conversationHistory,
            systemInstruction: {
              parts: [
                {
                  text: `You are a helpful medical AI assistant for a healthcare appointment system. Answer in ${
                    lang === "th" ? "Thai" : "English"
                  }. Keep responses brief (2-3 sentences).`,
                },
              ],
            },
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 300,
            },
          }),
        }
      );

      const data = await response.json();

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: aiResponse },
        ]);
      } else if (data.error) {
        console.error("API Error:", data.error);
        throw new Error(data.error.message || "API Error");
      } else {
        throw new Error("Invalid response from AI");
      }
    } catch (error) {
      console.error("Error calling AI:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            lang === "th"
              ? "ขอโทษครับ เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI กรุณาลองใหม่อีกครั้ง หรือติดต่อทีมงานเพื่อขอความช่วยเหลือครับ"
              : "Sorry, there was an error connecting to the AI. Please try again or contact support for assistance.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div
        className="w-[90%] max-w-[600px] h-[80vh] max-h-[700px] bg-[var(--md-surface)] rounded-[var(--radius-xl)] flex flex-col shadow-[var(--elevation-5)] overflow-hidden md:w-full md:h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary))] text-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white">
              <FaRobot size={24} />
            </div>
            <div>
              <h3 className="m-0 text-lg font-semibold">
                {lang === "th" ? "AI Assistant" : "AI Assistant"}
              </h3>
              <span className="text-sm opacity-90">
                {lang === "th" ? "พร้อมให้บริการ" : "Ready to help"}
              </span>
            </div>
          </div>
          <button
            className="bg-white/20 border-0 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer text-white hover:bg-white/30 transition-colors"
            onClick={onClose}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-[var(--md-background-alt)] flex flex-col gap-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 animate-[fadeIn_0.3s_ease-in] ${
                msg.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              {msg.role === "assistant" && (
                <div className="w-9 h-9 bg-[hsl(var(--primary)/0.1)] rounded-full flex items-center justify-center text-[hsl(var(--primary))] shrink-0">
                  <FaRobot size={20} />
                </div>
              )}
              <div
                className={`max-w-[75%] px-[1.125rem] py-[0.875rem] rounded-2xl break-words ${
                  msg.role === "assistant"
                    ? "bg-white text-[hsl(var(--foreground))] border border-[hsl(var(--border))] rounded-bl-[6px]"
                    : "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-br-[6px]"
                }`}
              >
                <p className="m-0 text-[0.9375rem] leading-[1.6] whitespace-pre-wrap break-words">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 animate-[fadeIn_0.3s_ease-in]">
              <div className="w-9 h-9 bg-[hsl(var(--primary)/0.1)] rounded-full flex items-center justify-center text-[hsl(var(--primary))] shrink-0">
                <FaRobot size={20} />
              </div>
              <div className="max-w-[75%] px-[1.125rem] py-[0.875rem] rounded-2xl bg-white border border-[hsl(var(--border))] rounded-bl-[6px]">
                <div className="flex gap-[0.4rem] py-2">
                  <span className="w-2 h-2 bg-[hsl(var(--muted-foreground))] rounded-full animate-[typing_1.4s_infinite]"></span>
                  <span className="w-2 h-2 bg-[hsl(var(--muted-foreground))] rounded-full animate-[typing_1.4s_infinite_0.2s]"></span>
                  <span className="w-2 h-2 bg-[hsl(var(--muted-foreground))] rounded-full animate-[typing_1.4s_infinite_0.4s]"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-3 px-6 py-4 border-t border-[var(--md-outline-variant)] bg-[var(--md-surface)] shrink-0">
          <textarea
            className="flex-1 px-4 py-3 border border-[hsl(var(--input))] rounded-3xl text-[0.9375rem] font-inherit outline-none transition-colors bg-[hsl(var(--background))] text-[hsl(var(--foreground))] resize-none max-h-[120px] focus:border-[hsl(var(--ring))] placeholder:text-[hsl(var(--muted-foreground))] disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder={
              lang === "th" ? "พิมพ์ข้อความ..." : "Type a message..."
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
            disabled={isLoading}
          />
          <button
            className="w-11 h-11 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-0 rounded-full cursor-pointer flex items-center justify-center transition-opacity shrink-0 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
          >
            <FaPaperPlane size={18} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
        @media (max-width: 768px) {
          .ai-chat-modal-container {
            width: 100%;
            height: 100vh;
            max-height: 100vh;
            border-radius: 0;
          }
        }
      `}</style>
    </div>
  );
};

// ==================== ChatRoom ====================
export const ChatRoom = ({
  db,
  patientId,
  doctorId,
  currentUser,
  otherUser,
  onBack,
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!db || !patientId || !doctorId) return;

    const messagesCol = collection(db, "messages");
    const q = query(
      messagesCol,
      where("patientId", "==", patientId),
      where("doctorId", "==", doctorId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by timestamp manually (ascending - oldest first)
      msgs.sort((a, b) => {
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;

        // Handle both Firestore Timestamp and plain Date objects
        const aTime = a.timestamp.seconds || a.timestamp.getTime() / 1000;
        const bTime = b.timestamp.seconds || b.timestamp.getTime() / 1000;

        return aTime - bTime;
      });

      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [db, patientId, doctorId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage("");

    try {
      // Use Firestore Timestamp instead of serverTimestamp
      const now = new Date();

      await addDoc(collection(db, "messages"), {
        patientId,
        doctorId,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email,
        text: messageText,
        timestamp: now,
        read: false,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
      setNewMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[var(--md-surface)] min-w-0 min-h-0 overflow-hidden">
      <div className="flex items-center gap-4 px-6 py-4 border-b border-[var(--md-outline-variant)] bg-[var(--md-surface)] shrink-0">
        <button
          className="md:hidden bg-transparent border-0 cursor-pointer text-[hsl(var(--primary))] p-2 flex items-center justify-center rounded-full transition-colors hover:bg-[hsl(var(--muted))]"
          onClick={onBack}
        >
          <FaArrowLeft size={20} />
        </button>
        <div className="w-10 h-10 bg-[hsl(var(--primary)/0.1)] rounded-full flex items-center justify-center shrink-0">
          <FaUser size={24} color="#c0d1f0" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="m-0 text-base font-semibold text-[hsl(var(--foreground))]">
            {otherUser.name}
          </h3>
          <span className="text-sm text-[hsl(var(--muted-foreground))] capitalize">
            {otherUser.role}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 bg-[var(--md-background-alt)] flex flex-col gap-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-[hsl(var(--muted-foreground))] text-sm">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex w-full ${
                message.senderId === currentUser.uid
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[600px] px-[1.125rem] py-[0.875rem] rounded-2xl break-words shadow-[0_1px_2px_rgba(0,0,0,0.05)] ${
                  message.senderId === currentUser.uid
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-br-[6px]"
                    : "bg-white text-[hsl(var(--foreground))] border border-[hsl(var(--border))] rounded-bl-[6px]"
                }`}
              >
                <p className="m-0 mb-1 text-[0.9375rem] leading-[1.6] whitespace-pre-wrap break-words">
                  {message.text}
                </p>
                <span className="text-xs opacity-70 block mt-1">
                  {message.timestamp
                    ? (() => {
                        const time = message.timestamp.seconds
                          ? new Date(message.timestamp.seconds * 1000)
                          : message.timestamp;
                        return time.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      })()
                    : "Sending..."}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        className="flex gap-3 px-6 py-4 border-t border-[var(--md-outline-variant)] bg-[var(--md-surface)] shrink-0"
        onSubmit={handleSendMessage}
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
          className="flex-1 px-4 py-3 border border-[hsl(var(--input))] rounded-3xl text-[0.9375rem] outline-none transition-colors bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:border-[hsl(var(--ring))] placeholder:text-[hsl(var(--muted-foreground))]"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="w-11 h-11 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-0 rounded-full cursor-pointer flex items-center justify-center transition-opacity shrink-0 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaPaperPlane size={18} />
        </button>
      </form>
    </div>
  );
};

// ==================== ChatRoomList ====================
export const ChatRoomList = ({
  db,
  currentUser,
  onSelectRoom,
  selectedRoomId,
}) => {
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    if (!db) return;
    const getAdmin = async () => {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("role", "==", "admin"));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const adminData = querySnapshot.docs[0].data();
        adminData.uid = querySnapshot.docs[0].id;
        setAdminUser(adminData);
      }
    };
    getAdmin();
  }, [db]);

  useEffect(() => {
    if (!db || !currentUser) return;

    // Listen to messages where this user is involved
    const messagesCol = collection(db, "messages");
    const q =
      currentUser.role === "admin"
        ? query(messagesCol)
        : currentUser.role === "patient"
        ? query(messagesCol, where("patientId", "==", currentUser.uid))
        : query(messagesCol, where("doctorId", "==", currentUser.uid));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const messagesByUser = {};

      // Group messages by the other user
      snapshot.docs.forEach((doc) => {
        const msg = doc.data();
        const otherUserId =
          currentUser.role === "patient" ? msg.doctorId : msg.patientId;

        if (!messagesByUser[otherUserId]) {
          messagesByUser[otherUserId] = [];
        }
        messagesByUser[otherUserId].push(msg);
      });

      // Build rooms
      const rooms = [];
      for (const otherUserId in messagesByUser) {
        // Fetch other user's data
        const userDocRef = doc(db, "users", otherUserId);
        const userDocSnap = await getDoc(userDocRef);
        const otherUser = userDocSnap.exists() ? userDocSnap.data() : null;

        if (otherUser) {
          // Get last message
          const messages = messagesByUser[otherUserId];
          const sortedMessages = messages.sort((a, b) => {
            if (!a.timestamp) return 1;
            if (!b.timestamp) return -1;
            return b.timestamp.seconds - a.timestamp.seconds;
          });
          const lastMessage = sortedMessages[0];

          rooms.push({
            roomId: `${currentUser.uid}_${otherUserId}`,
            patientId:
              currentUser.role === "patient" ? currentUser.uid : otherUserId,
            doctorId:
              currentUser.role === "patient" ? otherUserId : currentUser.uid,
            otherUser: {
              uid: otherUserId,
              name: otherUser.displayName || otherUser.email,
              role: otherUser.role,
            },
            lastMessage: lastMessage?.text || "No messages yet",
            lastMessageTime: lastMessage?.timestamp,
          });
        }
      }

      // Add admin to chat list
      if (adminUser && currentUser.uid !== adminUser.uid) {
        const adminRoomExists = rooms.some(
          (room) => room.otherUser.uid === adminUser.uid
        );
        if (!adminRoomExists) {
          let patientIdForAdminChat;
          let doctorIdForAdminChat;

          if (currentUser.role === "patient") {
            patientIdForAdminChat = currentUser.uid;
            doctorIdForAdminChat = adminUser.uid;
          } else {
            // doctor
            patientIdForAdminChat = currentUser.uid; // Doctor is the "patient" in this chat
            doctorIdForAdminChat = adminUser.uid;
          }

          rooms.push({
            roomId: `${currentUser.uid}_${adminUser.uid}`,
            patientId: patientIdForAdminChat,
            doctorId: doctorIdForAdminChat,
            otherUser: {
              uid: adminUser.uid,
              name: adminUser.displayName || adminUser.email,
              role: "admin",
            },
            lastMessage: "Chat with support",
            lastMessageTime: null,
          });
        }
      }

      // Sort by last message time, but pin admin chat to top
      rooms.sort((a, b) => {
        if (a.otherUser.role === "admin") return -1;
        if (b.otherUser.role === "admin") return 1;
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return b.lastMessageTime.seconds - a.lastMessageTime.seconds;
      });

      setChatRooms(rooms);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, currentUser, adminUser]);

  if (loading) {
    return (
      <div className="p-12 text-center text-[var(--md-on-surface-variant)] flex-1 flex flex-col items-center justify-center">
        Loading conversations...
      </div>
    );
  }

  if (chatRooms.length === 0) {
    return (
      <div className="p-12 text-center text-[var(--md-on-surface-variant)] flex-1 flex flex-col items-center justify-center">
        <p className="my-2 text-sm font-medium text-[var(--md-on-surface)] text-[0.9375rem]">
          No conversations yet.
        </p>
        <p className="my-2 text-sm">
          Book an appointment to start chatting with a{" "}
          {currentUser.role === "patient" ? "doctor" : "patient"}.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--md-surface)] flex flex-col">
      {chatRooms.map((room) => (
        <div
          key={room.roomId}
          className={`flex items-center px-4 py-3 gap-[0.875rem] cursor-pointer border-b border-[var(--md-outline-variant)] transition-colors hover:bg-[var(--md-surface-container-high)] ${
            selectedRoomId === room.roomId
              ? "bg-[var(--md-surface-container-highest)]"
              : ""
          }`}
          onClick={() => onSelectRoom(room)}
        >
          <div className="relative w-11 h-11 bg-[var(--md-primary-container)] rounded-full flex items-center justify-center shrink-0">
            <FaUser size={24} color="#c0d1f0" />
            <FaCircle
              className="absolute bottom-[2px] right-[2px] text-[var(--md-success)] bg-[var(--md-surface)] rounded-full"
              size={10}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1 gap-2">
              <h4 className="m-0 text-[0.9375rem] font-semibold text-[var(--md-on-surface)] whitespace-nowrap overflow-hidden text-ellipsis">
                {room.otherUser.name}
              </h4>
              <span className="text-xs text-[var(--md-on-surface-variant)] shrink-0">
                {room.lastMessageTime
                  ? new Date(
                      room.lastMessageTime.seconds * 1000
                    ).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </span>
            </div>
            <p className="m-0 mb-1 text-sm text-[var(--md-on-surface-variant)] whitespace-nowrap overflow-hidden text-ellipsis">
              {room.lastMessage}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
