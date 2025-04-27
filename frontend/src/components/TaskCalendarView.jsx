// Updated TaskCalendarView.jsx with Task Detail Modal integration
import React, { useState, useEffect } from 'react';
import { Calendar, Badge, Select, Spin, message, Typography, Tooltip, Empty, Button } from 'antd';
import { getTasks, getUsers, isAdmin } from '../services/api';
import moment from 'moment';
import TaskDetailModal from './TaskDetailModal';
import { CommentOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title, Text } = Typography;

const TaskCalendarView = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    assignee_id: null
  });
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const userIsAdmin = isAdmin();

  useEffect(() => {
    // Only admins need to fetch users for filtering
    if (userIsAdmin) {
      const fetchUsersData = async () => {
        try {
          const usersData = await getUsers();
          setUsers(usersData);
        } catch (error) {
          message.error('Failed to load users data');
          console.error(error);
        }
      };

      fetchUsersData();
    }
  }, [userIsAdmin]);

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const queryParams = {};

      if (filters.assignee_id) {
        queryParams.assignee_id = filters.assignee_id;
      }

      const tasksData = await getTasks(queryParams);

      // Process tasks to ensure dates are moment objects
      const processedTasks = tasksData.map(task => ({
        ...task,
        start_date: moment(task.start_date),
        end_date: moment(task.end_date)
      }));

      setTasks(processedTasks);
    } catch (error) {
      message.error('Failed to load tasks');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: value
    }));
  };

  // Fixed method - use moment's comparison methods
  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      // Ensure we're comparing moment objects
      const cellDate = moment(date.format('YYYY-MM-DD'));
      const startDate = moment(task.start_date.format('YYYY-MM-DD'));
      const endDate = moment(task.end_date.format('YYYY-MM-DD'));

      // Use moment's isSameOrAfter and isSameOrBefore methods
      return cellDate.isSameOrAfter(startDate) && cellDate.isSameOrBefore(endDate);
    });
  };

  const handleViewTaskDetails = (taskId) => {
    setSelectedTaskId(taskId);
    setDetailModalVisible(true);
  };

  const dateCellRender = (date) => {
    const tasksForDate = getTasksForDate(date);

    if (tasksForDate.length === 0) return null;

    return (
      <ul className="events" style={{ listStyleType: 'none', margin: 0, padding: 0 }}>
        {tasksForDate.map(task => (
          <li key={task.id} style={{ marginBottom: '4px' }}>
            <div
              onClick={() => handleViewTaskDetails(task.id)}
              style={{
                cursor: 'pointer',
                borderRadius: '4px',
                padding: '2px 4px',
                transition: 'all 0.2s',
                backgroundColor: 'rgba(0, 0, 0, 0.2)'
              }}
              className="calendar-task-item"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Badge
                  status={getPriorityColor(task.priority)}
                  text={<span style={{ fontSize: '12px' }}>{task.title}</span>}
                />
                {task.comments && task.comments.length > 0 && (
                  <Badge
                    count={task.comments.length}
                    size="small"
                    style={{ backgroundColor: '#4F46E5', marginLeft: '4px' }}
                    title={`${task.comments.length} comments`}
                  />
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'processing';
    }
  };

  return (
    <div className="calendar-view">
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Task Calendar</Title>
        {userIsAdmin && (
          <Select
            allowClear
            style={{ width: 200 }}
            placeholder="Filter by User"
            onChange={(value) => handleFilterChange('assignee_id', value)}
          >
            {users.map(user => (
              <Option key={user.id} value={user.id}>{user.name}</Option>
            ))}
          </Select>
        )}
      </div>

      <Spin spinning={loading}>
        {tasks.length > 0 ? (
          <>
            <div style={{ marginBottom: '16px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
              Click on any task to view details and add comments
            </div>
            <Calendar
              dateCellRender={dateCellRender}
              className="task-calendar"
            />
          </>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Empty description={
              userIsAdmin ?
                "No tasks found. Try creating new tasks first." :
                "No tasks assigned to you yet."
            } />
          </div>
        )}
      </Spin>

      {/* Task Detail Modal */}
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          visible={detailModalVisible}
          onClose={() => {
            setDetailModalVisible(false);
            setSelectedTaskId(null);
          }}
          onTaskUpdated={fetchTasks}
        />
      )}
    </div>
  );
};

export default TaskCalendarView;