// Comment list component for displaying all comments
import React from 'react';
import { CommentThread } from './CommentThread';
import { CommentInput } from './CommentInput';
import { useComments } from '../hooks/useComments';

interface CommentListProps {
  currentUser: string;
  currentUserDisplayName: string;
}

export const CommentList: React.FC<CommentListProps> = ({
  currentUser,
  currentUserDisplayName,
}) => {
  const { comments, addComment } = useComments();

  return (
    <div className='comment-list'>
      <div className='comment-header'>
        <h2>Comments ({comments.length})</h2>
      </div>
      
      <div className='comments-container'>
        {comments.map((comment) => (
          <CommentThread
            key={comment.id}
            comment={comment}
            onReply={(parentId, content) => addReply(parentId, content)}
            onUpdate={(commentId, content) => updateComment(commentId, content)}
            onDelete={(commentId) => deleteComment(commentId)}
            currentUser={currentUser}
          />
        ))}
      </div>

      <CommentInput
        onAddComment={addComment}
        currentUser={currentUser}
        currentUserDisplayName={currentUserDisplayName}
      />
    </div>
  );
};

const addReply = (parentId: string, content: string) => {
  // Implementation would use the hook's addReply method
};

const updateComment = (commentId: string, content: string) => {
  // Implementation would use the hook's updateComment method
};

const deleteComment = (commentId: string) => {
  // Implementation would use the hook's deleteComment method
};