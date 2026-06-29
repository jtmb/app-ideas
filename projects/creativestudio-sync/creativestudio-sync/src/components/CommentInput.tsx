// Comment input component for creating new comments
import React, { useState, useRef } from "react";

interface CommentInputProps {
  onAddComment: (parentId: string | null, content: string) => void;
  currentUser: string;
  currentUserDisplayName: string;
  placeholder?: string;
}

export const CommentInput: React.FC<CommentInputProps> = ({
  onAddComment,
  currentUser,
  currentUserDisplayName,
  placeholder = "Write a comment...",
}) => {
  const [content, setContent] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (content.trim() && content.length > 0) {
      onAddComment(null, content.trim());
      setContent("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  };

  const className = isFocused ? "comment-input focused" : "comment-input";

  return (
    <div className={className}>
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          handleResize();
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        rows={isFocused ? 3 : 1}
        className="comment-textarea"
      />
      <div className="comment-input-actions">
        <button
          onClick={handleSubmit}
          disabled={!content.trim()}
          className={`submit-btn ${!content.trim() ? "disabled" : ""}`}
        >
          Post Comment
        </button>
      </div>
    </div>
  );
};