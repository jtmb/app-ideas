// Comment component for displaying threaded discussions
import React, { useState, useEffect } from "react";
import { useComments } from "../hooks/useComments";
import { formatTimeAgo } from "../utils/timeFormatter";

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  parentId?: string;
  replies: Comment[];
  isEdited: boolean;
}

interface CommentProps {
  comment: Comment;
  onReply: (parentId: string, content: string) => void;
  onUpdate: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  currentUser: string;
}

export const CommentItem: React.FC<CommentProps> = ({
  comment,
  onReply,
  onUpdate,
  onDelete,
  currentUser,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const { isReplyingTo, replyTarget } = useComments();

  const handleSaveEdit = () => {
    onUpdate(comment.id, editContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const className = isReplyingTo === comment.id ? "comment-item replying-to" : "comment-item";

  return (
    <div className={className}>
      <div className="comment-header">
        <span className="author-name">{comment.authorName}</span>
        <span className="timestamp">{formatTimeAgo(comment.createdAt)}</span>
        {comment.isEdited && <span className="edited-badge">Edited</span>}
      </div>
      
      {isEditing ? (
        <div className="edit-form">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            placeholder="Edit your comment..."
          />
          <div className="edit-actions">
            <button onClick={handleSaveEdit}>Save</button>
            <button onClick={handleCancelEdit} className="cancel">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="comment-content" onDoubleClick={() => setIsEditing(true)}>
          {comment.content}
        </div>
      )}

      <div className="comment-actions">
        <button onClick={() => setIsEditing(true)} className="edit-btn">Edit</button>
        {currentUser === comment.authorId && (
          <button onClick={() => onDelete(comment.id)} className="delete-btn">Delete</button>
        )}
        <button onClick={() => onReply(comment.id, "")} className="reply-btn">
          Reply
        </button>
      </div>

      {comment.replies.length > 0 && (
        <div className="replies-container">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onUpdate={onUpdate}
              onDelete={onDelete}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CommentThread: React.FC<CommentProps> = ({
  comment,
  onReply,
  onUpdate,
  onDelete,
  currentUser,
}) => {
  return (
    <div className="comment-thread">
      <CommentItem
        comment={comment}
        onReply={onReply}
        onUpdate={onUpdate}
        onDelete={onDelete}
        currentUser={currentUser}
      />
    </div>
  );
};