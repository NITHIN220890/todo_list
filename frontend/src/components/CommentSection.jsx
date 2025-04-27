// Fixed CommentSection.jsx
import React, { useState, useEffect } from 'react';
import {
  List,
  Button,
  Form,
  Input,
  Typography,
  Avatar,
  Space,
  Tooltip,
  Popconfirm,
  message
} from 'antd';
import {
  SendOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  CommentOutlined
} from '@ant-design/icons';
import {
  getTaskComments,
  createComment,
  updateComment,
  deleteComment,
  getCurrentUser,
  isAdmin
} from '../services/api';
import moment from 'moment';

const { TextArea } = Input;
const { Text, Paragraph } = Typography;

// Custom Comment component to replace antd's Comment
const CommentItem = ({
  author,
  avatar,
  content,
  datetime,
  actions = []
}) => {
  return (
    <div className="custom-comment">
      <div className="custom-comment-header">
        <div className="custom-comment-avatar">
          {avatar}
        </div>
        <div className="custom-comment-author-info">
          <div className="custom-comment-author-name">{author}</div>
          <div className="custom-comment-datetime">{datetime}</div>
        </div>
      </div>
      <div className="custom-comment-content">
        {content}
      </div>
      {actions.length > 0 && (
        <div className="custom-comment-actions">
          {actions.map((action, index) => (
            <span key={index} className="custom-comment-action">{action}</span>
          ))}
        </div>
      )}
    </div>
  );
};

const CommentSection = ({ taskId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [value, setValue] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editValue, setEditValue] = useState('');
  const currentUser = getCurrentUser();
  const userIsAdmin = isAdmin();

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const commentsData = await getTaskComments(taskId);
      setComments(commentsData);
    } catch (error) {
      message.error('Failed to load comments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!value.trim()) return;

    try {
      setSubmitting(true);
      const newComment = await createComment(taskId, value);
      setComments([newComment, ...comments]);
      setValue('');
      message.success('Comment added');
    } catch (error) {
      message.error('Failed to add comment');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (comment) => {
    setEditingComment(comment.id);
    setEditValue(comment.content);
  };

  const handleSaveEdit = async (commentId) => {
    if (!editValue.trim()) return;

    try {
      setSubmitting(true);
      const updatedComment = await updateComment(commentId, editValue);
      setComments(comments.map(c => c.id === commentId ? updatedComment : c));
      setEditingComment(null);
      setEditValue('');
      message.success('Comment updated');
    } catch (error) {
      message.error('Failed to update comment');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditValue('');
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
      message.success('Comment deleted');
    } catch (error) {
      message.error('Failed to delete comment');
      console.error(error);
    }
  };

  // Get user initials for the avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const renderCommentActions = (comment) => {
    const actions = [];

    // Users can only edit or delete their own comments
    if (comment.user_id === currentUser.id) {
      if (editingComment === comment.id) {
        actions.push(
          <Button
            key="save"
            type="link"
            icon={<SaveOutlined />}
            onClick={() => handleSaveEdit(comment.id)}
            loading={submitting}
          >
            Save
          </Button>,
          <Button
            key="cancel"
            type="link"
            icon={<CloseOutlined />}
            onClick={handleCancelEdit}
          >
            Cancel
          </Button>
        );
      } else {
        actions.push(
          <Button
            key="edit"
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(comment)}
          >
            Edit
          </Button>,
          <Popconfirm
            key="delete"
            title="Are you sure you want to delete this comment?"
            onConfirm={() => handleDelete(comment.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        );
      }
    } else if (userIsAdmin) {
      // Admins can delete any comment
      actions.push(
        <Popconfirm
          key="delete"
          title="Are you sure you want to delete this comment?"
          onConfirm={() => handleDelete(comment.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
          >
            Delete
          </Button>
        </Popconfirm>
      );
    }

    return actions;
  };

  return (
    <div className="comment-section">
      <div style={{ marginBottom: '24px' }}>
        <Form.Item>
          <TextArea
            rows={4}
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Add a comment..."
            className="comment-textarea"
          />
        </Form.Item>
        <Button
          htmlType="submit"
          type="primary"
          onClick={handleSubmit}
          loading={submitting}
          icon={<SendOutlined />}
          disabled={!value.trim()}
          className="comment-submit-button"
        >
          Add Comment
        </Button>
      </div>

      <List
        className="comment-list"
        header={`${comments.length} ${comments.length > 1 ? 'comments' : 'comment'}`}
        itemLayout="horizontal"
        dataSource={comments}
        renderItem={item => (
          <li>
            <CommentItem
              actions={renderCommentActions(item)}
              author={<Text strong>{item.user.name} {item.user.is_admin && <Text type="secondary">(Admin)</Text>}</Text>}
              avatar={
                <Avatar
                  style={{
                    backgroundColor: item.user.is_admin ? '#9333EA' : '#3B82F6',
                    color: 'white',
                  }}
                >
                  {getInitials(item.user.name)}
                </Avatar>
              }
              content={
                editingComment === item.id ? (
                  <TextArea
                    rows={3}
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    className="comment-textarea"
                  />
                ) : (
                  <p>{item.content}</p>
                )
              }
              datetime={
                <Tooltip title={moment(item.created_at).format('YYYY-MM-DD HH:mm:ss')}>
                  <span className="comment-time-ago">{moment(item.created_at).fromNow()}</span>
                  {item.updated_at && item.updated_at !== item.created_at && (
                    <Text type="secondary" className="comment-edited-tag">
                      (edited)
                    </Text>
                  )}
                </Tooltip>
              }
            />
          </li>
        )}
        loading={loading}
        locale={{
          emptyText: (
            <div className="comments-empty-state">
              <Space direction="vertical" align="center">
                <CommentOutlined className="comments-empty-icon" />
                <Text type="secondary">No comments yet</Text>
                <Text type="secondary">Be the first to add a comment</Text>
              </Space>
            </div>
          )
        }}
      />
    </div>
  );
};

export default CommentSection;