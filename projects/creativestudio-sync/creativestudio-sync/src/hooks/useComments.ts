// Custom hook for real-time comment management
import { useState, useEffect, useCallback, useRef } from "react";
import CollaborationEventEmitter from "../services/collaboration-events";

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

interface UseCommentsReturn {
  comments: Comment[];
  addComment: (parentId: string | null, content: string) => void;
  updateComment: (commentId: string, content: string) => void;
  deleteComment: (commentId: string) => void;
  addReply: (parentId: string, content: string) => void;
  isReplyingTo: string | null;
  replyTarget: Comment | null;
  connect: () => void;
  disconnect: () => void;
}

export const useComments = (): UseCommentsReturn => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isReplyingTo, setIsReplyingTo] = useState<string | null>(null);
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null);
  const emitterRef = useRef<CollaborationEventEmitter | null>(null);

  useEffect(() => {
    if (!emitterRef.current) {
      emitterRef.current = new CollaborationEventEmitter();
    }

    emitterRef.current.on("comment", handleCommentEvent);
    emitterRef.current.on("reply", handleReplyEvent);
    emitterRef.current.on("update", handleUpdateEvent);
    emitterRef.current.on("delete", handleDeleteEvent);

    return () => {
      emitterRef.current?.removeAllListeners();
    };
  }, []);

  const handleCommentEvent = useCallback((data: { comment: Comment }) => {
    setComments((prev) => {
      const newComments = [...prev];
      const index = newComments.findIndex((c) => c.id === data.comment.id);
      if (index !== -1) {
        newComments[index] = data.comment;
      } else {
        newComments.push(data.comment);
      }
      return newComments;
    });
  }, []);

  const handleReplyEvent = useCallback((data: { parentId: string; reply: Comment }) => {
    setComments((prev) => {
      const updateReplies = (comments: Comment[]): Comment[] => {
        return comments.map((comment) => {
          if (comment.id === data.parentId) {
            return { ...comment, replies: [...comment.replies, data.reply] };
          }
          if (comment.replies.length > 0) {
            return { ...comment, replies: updateReplies(comment.replies) };
          }
          return comment;
        });
      };
      return updateReplies(prev);
    });
  }, []);

  const handleUpdateEvent = useCallback((data: { commentId: string; content: string }) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === data.commentId ? { ...c, content: data.content, updatedAt: Date.now(), isEdited: true } : c
      )
    );
  }, []);

  const handleDeleteEvent = useCallback((data: { commentId: string }) => {
    setComments((prev) => {
      const deleteComment = (comments: Comment[]): Comment[] => {
        return comments
          .filter((c) => c.id !== data.commentId)
          .map((comment) => ({
            ...comment,
            replies: deleteComment(comment.replies),
          }));
      };
      return deleteComment(prev);
    });
  }, []);

  const addComment = useCallback(
    (parentId: string | null, content: string) => {
      const newComment: Comment = {
        id: crypto.randomUUID(),
        authorId: "current-user-id",
        authorName: "Current User",
        content,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        parentId,
        replies: [],
        isEdited: false,
      };

      setComments((prev) => {
        const newComments = [...prev];
        if (parentId === null) {
          newComments.push(newComment);
        } else {
          const updateReplies = (comments: Comment[]): Comment[] => {
            return comments.map((comment) => {
              if (comment.id === parentId) {
                return { ...comment, replies: [...comment.replies, newComment] };
              }
              if (comment.replies.length > 0) {
                return { ...comment, replies: updateReplies(comment.replies) };
              }
              return comment;
            });
          };
          newComments = updateReplies(newComments);
        }
        return newComments;
      });

      emitterRef.current?.emit("comment", { comment: newComment });
    },
    []
  );

  const updateComment = useCallback(
    (commentId: string, content: string) => {
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, content, updatedAt: Date.now(), isEdited: true } : c
        )
      );
      emitterRef.current?.emit("update", { commentId, content });
    },
    []
  );

  const deleteComment = useCallback(
    (commentId: string) => {
      setComments((prev) => {
        const deleteComment = (comments: Comment[]): Comment[] => {
          return comments
            .filter((c) => c.id !== commentId)
            .map((comment) => ({
              ...comment,
              replies: deleteComment(comment.replies),
            }));
        };
        return deleteComment(prev);
      });
      emitterRef.current?.emit("delete", { commentId });
    },
    []
  );

  const addReply = useCallback(
    (parentId: string, content: string) => {
      setIsReplyingTo(null);
      setReplyTarget(null);
      addComment(parentId, content);
    },
    [addComment]
  );

  return {
    comments,
    addComment,
    updateComment,
    deleteComment,
    addReply,
    isReplyingTo,
    replyTarget,
    connect: () => emitterRef.current?.connect("current-user-id"),
    disconnect: () => emitterRef.current?.disconnect("current-user-id"),
  };
};