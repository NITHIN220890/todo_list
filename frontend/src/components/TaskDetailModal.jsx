// TaskDetailModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Typography,
  Space,
  Divider,
  Tag,
  Avatar,
  Tabs,
  Button,
  message,
  Spin
} from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  TagOutlined,
  CommentOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { getTaskById, updateTaskStatus, isAdmin } from '../services/api';
import CommentSection from './CommentSection';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const TaskDetailModal = ({ taskId, visible, onClose, onTaskUpdated }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const userIsAdmin = isAdmin();

  useEffect(() => {
    if (taskId && visible) {
      fetchTaskDetails();
    }
  }, [taskId, visible]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const taskData = await getTaskById(taskId);
      setTask(taskData);
    } catch (error) {
      message.error('Failed to load task details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      await updateTaskStatus(taskId, newStatus);
      message.success('Task status updated');
      fetchTaskDetails();
      if (onTaskUpdated) {
        onTaskUpdated();
      }
    } catch (error) {
      message.error('Failed to update task status');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Get priority styling
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };

  // Get status styling
  const getStatusClass = (status) => {
    return `status-${status.replace('_', '-')}`;
  };

  // Get user initials for the avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  if (!task) {
    return (
      <Modal
        title="Task Details"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={700}
      >
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <Spin />
          <div style={{ marginTop: '16px' }}>Loading task details...</div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Task Details</span>
          <Tag className={getStatusClass(task.status)}>
            {task.status.replace('_', ' ')}
          </Tag>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <div className="task-detail-content">
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <Title level={4} style={{ margin: 0 }}>
              {task.title}
            </Title>
            <Tag className={getPriorityClass(task.priority)}>
              {task.priority}
            </Tag>
          </div>

          {task.description && (
            <Paragraph style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {task.description}
            </Paragraph>
          )}
        </div>

        <Divider style={{ margin: '16px 0' }} />

        <div style={{ marginBottom: '24px' }}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            {/* Assignee information */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <UserOutlined style={{ fontSize: '16px', marginRight: '12px', color: '#3B82F6' }} />
              <div>
                <Text type="secondary">Assigned to</Text>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                  <Avatar
                    style={{
                      marginRight: '8px',
                      backgroundColor: task.assignee?.is_admin ? '#9333EA' : '#3B82F6'
                    }}
                  >
                    {getInitials(task.assignee?.name)}
                  </Avatar>
                  <Text>{task.assignee?.name || 'Unassigned'}</Text>
                </div>
              </div>
            </div>

            {/* Timeline information */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CalendarOutlined style={{ fontSize: '16px', marginRight: '12px', color: '#3B82F6' }} />
              <div>
                <Text type="secondary">Timeline</Text>
                <div style={{ marginTop: '4px' }}>
                  <Text>
                    {moment(task.start_date).format('MMM D, YYYY')} - {moment(task.end_date).format('MMM D, YYYY')}
                  </Text>
                </div>
              </div>
            </div>

            {/* Created information */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <TagOutlined style={{ fontSize: '16px', marginRight: '12px', color: '#3B82F6' }} />
              <div>
                <Text type="secondary">Created</Text>
                <div style={{ marginTop: '4px' }}>
                  <Text>{moment(task.created_at).format('MMM D, YYYY')} by {task.creator?.name}</Text>
                </div>
              </div>
            </div>
          </Space>
        </div>

        {/* Status change buttons */}
        {task.status !== 'completed' && (
          <div style={{ marginBottom: '24px' }}>
            <Divider style={{ margin: '16px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              {task.status !== 'in_progress' && (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  className="status-in-progress"
                  onClick={() => handleStatusChange('in_progress')}
                >
                  Mark In Progress
                </Button>
              )}
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                className="status-completed"
                onClick={() => handleStatusChange('completed')}
              >
                Mark Complete
              </Button>
            </div>
          </div>
        )}

        <Divider style={{ margin: '16px 0' }} />

        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane
            tab={
              <span>
                <CommentOutlined />
                Comments
              </span>
            }
            key="1"
          >
            <CommentSection taskId={taskId} />
          </TabPane>
        </Tabs>
      </div>
    </Modal>
  );
};

export default TaskDetailModal;