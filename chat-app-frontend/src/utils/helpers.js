export const formatTime = (date) => {
  const now = new Date();
  const messageDate = new Date(date);
  const isToday = now.toDateString() === messageDate.toDateString();
  const isYesterday =
    new Date(now - 86400000).toDateString() === messageDate.toDateString();
  if (isToday) {
    return messageDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (isYesterday) {
    return "Yesterday";
  } else {
    return messageDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
};
export const getConversationId = (userId1, userId2) => {
  return [userId1, userId2].sort().join("-");
};
export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};
export const validatePhoneNumber = (phone) => {
  const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return re.test(phone);
};
