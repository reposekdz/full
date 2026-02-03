import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Chip,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  Circle,
  CheckCircle,
  Info,
  Warning,
  Error,
  Payment,
  Assignment,
  School,
  Person,
  Message,
  Event,
  ClearAll,
  Settings
} from '@mui/icons-material';
import axios from 'axios';
import io from 'socket.io-client';

const API_BASE_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  action_url?: string;
  metadata?: any;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

interface RealTimeNotificationsProps {
  userId: number;
  userRole: string;
}

const RealTimeNotifications: React.FC<RealTimeNotificationsProps> = ({ userId, userRole }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('Socket.io connected');
      setIsConnected(true);
      
      if (userRole === 'parent') {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        newSocket.emit('join_parent_room', user.phone);
      } else if (userRole === 'student') {
        newSocket.emit('join_student_room', userId);
      } else {
        newSocket.emit('join_staff_room', userId);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Socket.io disconnected');
      setIsConnected(false);
    });

    newSocket.on('notification', (notification: Notification) => {
      console.log('New notification received:', notification);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png'
        });
      }
    });

    newSocket.on('payment_reminder', (data: any) => {
      console.log('Payment reminder received:', data);
      const notification: Notification = {
        id: Date.now(),
        user_id: userId,
        title: 'Payment Reminder',
        message: data.message,
        type: 'payment',
        priority: 'high',
        is_read: false,
        created_at: new Date().toISOString()
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    newSocket.on('grade_update', (data: any) => {
      console.log('Grade update received:', data);
      const notification: Notification = {
        id: Date.now(),
        user_id: userId,
        title: 'New Grade Posted',
        message: data.message,
        type: 'grade',
        priority: 'normal',
        is_read: false,
        created_at: new Date().toISOString()
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    newSocket.on('assignment_update', (data: any) => {
      console.log('Assignment update received:', data);
      const notification: Notification = {
        id: Date.now(),
        user_id: userId,
        title: 'Assignment Update',
        message: data.message,
        type: 'assignment',
        priority: 'normal',
        is_read: false,
        created_at: new Date().toISOString()
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userId, userRole]);

  useEffect(() => {
    fetchNotifications();
    
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/realtime-notifications/${userId}?limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/realtime-notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/realtime-notifications/user/${userId}/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/realtime-notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.is_read ? prev - 1 : prev;
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <Payment color="warning" />;
      case 'assignment':
      case 'work':
        return <Assignment color="primary" />;
      case 'grade':
        return <School color="success" />;
      case 'attendance':
        return <Event color="info" />;
      case 'message':
        return <Message color="secondary" />;
      case 'alert':
      case 'warning':
        return <Warning color="error" />;
      case 'info':
        return <Info color="info" />;
      default:
        return <Circle color="disabled" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'normal':
        return 'info';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Box>
      <Tooltip title={isConnected ? 'Notifications (Live)' : 'Notifications (Offline)'}>
        <IconButton
          color="inherit"
          onClick={handleClick}
          sx={{ position: 'relative' }}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            {isConnected ? <NotificationsActive /> : <Notifications />}
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 600,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllAsRead} startIcon={<CheckCircle />}>
              Mark all read
            </Button>
          )}
        </Box>

        <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Notifications sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">No notifications yet</Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      backgroundColor: notification.is_read ? 'transparent' : 'action.hover',
                      '&:hover': { backgroundColor: 'action.selected' },
                      cursor: 'pointer',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      py: 2
                    }}
                    onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                  >
                    <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {getNotificationIcon(notification.type)}
                      </ListItemIcon>
                      <Box sx={{ flexGrow: 1, mr: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: notification.is_read ? 'normal' : 'bold' }}>
                          {notification.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {notification.message}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
                          <Chip
                            label={notification.priority}
                            size="small"
                            color={getPriorityColor(notification.priority) as any}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(notification.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                      >
                        <ClearAll fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {notifications.length > 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {isConnected ? '🟢 Live updates enabled' : '🔴 Reconnecting...'}
            </Typography>
          </Box>
        )}
      </Menu>
    </Box>
  );
};

export default RealTimeNotifications;
