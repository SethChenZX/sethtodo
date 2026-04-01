import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { todoApi } from '../utils/todoApi';
import { userApi } from '../utils/userApi';
import { requestNotificationPermission, showBrowserNotification, shouldShowReminder } from '../utils/notifications';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const checkAndRestoreDelays = (todos) => {
  const now = new Date();
  return todos.map(todo => {
    if (todo.status === 'delayed' && todo.delayedAt && todo.delayDays) {
      const delayedUntil = new Date(todo.delayedAt);
      delayedUntil.setDate(delayedUntil.getDate() + todo.delayDays);
      if (now >= delayedUntil) {
        return { ...todo, status: 'pending', delayDays: null, delayedAt: null };
      }
    }
    return todo;
  });
};

const checkAndMarkOverdue = (todos) => {
  const now = new Date();
  return todos.map(todo => {
    if (todo.status === 'pending' && todo.deadline && !todo.isDeleted) {
      const deadline = new Date(todo.deadline);
      if (now > deadline) {
        return { ...todo, status: 'overdue' };
      }
    }
    return todo;
  });
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [filter, setFilter] = useState('all');
  const [completedDateFilter, setCompletedDateFilter] = useState('all');
  const [delayFilter, setDelayFilter] = useState('all');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState(null);
  const [completedDate, setCompletedDate] = useState(getTodayString());
  const [showDelayPicker, setShowDelayPicker] = useState(false);
  const [selectedDelayTodoId, setSelectedDelayTodoId] = useState(null);
  const [reminderNotification, setReminderNotification] = useState(null);

  const fetchTodos = async () => {
    try {
      const token = await user.getIdToken();
      const userData = await userApi.getMe(user.uid, token);
      
      let userTodos = await todoApi.getAll(token);
      userTodos = userTodos.filter(t => {
        const todoUserId = typeof t.userId === 'object' ? t.userId._id || t.userId.$oid : t.userId;
        return todoUserId === user.uid || todoUserId === userData._id;
      });
      
      userTodos = checkAndRestoreDelays(userTodos);
      userTodos = checkAndMarkOverdue(userTodos);
      
      setTodos(userTodos);
      checkReminders(userTodos);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const checkReminders = async (todosData) => {
    for (const todo of todosData) {
      if (shouldShowReminder(todo)) {
        const sent = showBrowserNotification(
          '⏰ Reminder: Todo Deadline',
          `"${todo.title}" deadline is in 5 minutes!`
        );
        
        setReminderNotification({
          title: todo.title,
          message: 'Deadline is in 5 minutes!'
        });
        
        const todoId = typeof todo._id === 'object' ? todo._id.$oid : todo._id;
        const token = await user.getIdToken();
        await todoApi.update(todoId, { reminderSent: true }, token);
        break;
      }
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (user) {
      fetchTodos();
    }
  }, [user]);

  const createTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const token = await user.getIdToken();
    await todoApi.create({
      title,
      description,
      status: 'pending',
      deadline: today.toISOString()
    }, token);
    
    setTitle('');
    setDescription('');
    fetchTodos();
  };

  const handleCompleteClick = (todoId) => {
    setSelectedTodoId(todoId);
    setCompletedDate(getTodayString());
    setShowDatePicker(true);
  };

  const handleDateSubmit = async () => {
    if (!selectedTodoId || !completedDate) return;

    const token = await user.getIdToken();
    await todoApi.update(selectedTodoId, {
      status: 'completed',
      completedAt: new Date(completedDate).toISOString()
    }, token);
    
    setShowDatePicker(false);
    setSelectedTodoId(null);
    setCompletedDate(getTodayString());
    fetchTodos();
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
    setSelectedTodoId(null);
    setCompletedDate(getTodayString());
  };

  const handleDelayClick = (todoId) => {
    setSelectedDelayTodoId(todoId);
    setShowDelayPicker(true);
  };

  const handleDelaySubmit = async (days) => {
    if (!selectedDelayTodoId) return;

    const token = await user.getIdToken();
    await todoApi.update(selectedDelayTodoId, {
      status: 'delayed',
      delayDays: days,
      delayedAt: new Date().toISOString()
    }, token);
    
    setShowDelayPicker(false);
    setSelectedDelayTodoId(null);
    fetchTodos();
  };

  const handleDelayCancel = () => {
    setShowDelayPicker(false);
    setSelectedDelayTodoId(null);
  };

  const updateTodo = async (id, status) => {
    const token = await user.getIdToken();
    await todoApi.update(id, { status }, token);
    fetchTodos();
  };

  const getCompletedMonthKey = (todo) => {
    if (!todo.completedAt) return 'unknown';
    const date = new Date(todo.completedAt);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const filteredTodos = todos.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (completedDateFilter !== 'all' && completedDateFilter !== 'unknown') {
      if (getCompletedMonthKey(t) !== completedDateFilter) return false;
    } else if (completedDateFilter === 'unknown') {
      if (t.completedAt) return false;
    }
    if (delayFilter !== 'all' && t.delayDays) {
      if (t.delayDays !== parseInt(delayFilter)) return false;
    }
    return true;
  });

  const completedMonths = [...new Set(
    todos
      .filter(t => t.completedAt)
      .map(getCompletedMonthKey)
  )].sort().reverse();

  const delayDaysOptions = [...new Set(
    todos
      .filter(t => t.delayDays)
      .map(t => t.delayDays)
  )].sort((a, b) => a - b);

  const formatMonthFilter = (monthKey) => {
    if (monthKey === 'all') return 'All';
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
  };

  const getRestoreDate = (todo) => {
    if (!todo.delayedAt || !todo.delayDays) return null;
    const restoreDate = new Date(todo.delayedAt);
    restoreDate.setDate(restoreDate.getDate() + todo.delayDays);
    return formatDate(restoreDate.toISOString());
  };

  const getTodoId = (todo) => {
    return typeof todo._id === 'object' ? todo._id.$oid : todo._id;
  };

  return (
    <div className="app">
      <div className="header">
        <h1>My Todos</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user.role === 'super' && (
            <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
              Admin
            </button>
          )}
          <span style={{ margin: '0 10px', fontWeight: 'bold' }}>{user.displayName}</span>
          <span style={{ color: '#666', fontSize: '14px' }}>({user.email})</span>
          <button className="btn btn-danger" onClick={logout}>Logout</button>
        </div>
      </div>

      <form className="todo-form" onSubmit={createTodo}>
        <input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button className="btn btn-primary" type="submit" style={{ marginTop: '10px' }}>Add Todo</button>
      </form>

      <div className="filters">
        {['all', 'pending', 'overdue', 'completed', 'delayed', 'abandoned'].map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filter === 'completed' && (
        <div className="filters" style={{ marginTop: '10px' }}>
          <span style={{ marginRight: '10px', fontSize: '14px', color: '#666' }}>Completed:</span>
          <button
            className={`filter-btn ${completedDateFilter === 'all' ? 'active' : ''}`}
            onClick={() => setCompletedDateFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${completedDateFilter === 'unknown' ? 'active' : ''}`}
            onClick={() => setCompletedDateFilter('unknown')}
          >
            No Date
          </button>
          {completedMonths.map(month => (
            <button
              key={month}
              className={`filter-btn ${completedDateFilter === month ? 'active' : ''}`}
              onClick={() => setCompletedDateFilter(month)}
            >
              {formatMonthFilter(month)}
            </button>
          ))}
        </div>
      )}

      {filter === 'delayed' && delayDaysOptions.length > 0 && (
        <div className="filters" style={{ marginTop: '10px' }}>
          <span style={{ marginRight: '10px', fontSize: '14px', color: '#666' }}>Delay:</span>
          <button
            className={`filter-btn ${delayFilter === 'all' ? 'active' : ''}`}
            onClick={() => setDelayFilter('all')}
          >
            All
          </button>
          {delayDaysOptions.map(days => (
            <button
              key={days}
              className={`filter-btn ${delayFilter === String(days) ? 'active' : ''}`}
              onClick={() => setDelayFilter(String(days))}
            >
              {days} day{days > 1 ? 's' : ''}
            </button>
          ))}
        </div>
      )}

      <div className="todo-list">
        {filteredTodos.map(todo => (
          <div key={getTodoId(todo)} className={`todo-item ${todo.status}`}>
            <div className="todo-content">
              <h3>{todo.title}</h3>
              {todo.description && <p>{todo.description}</p>}
              <span className={`status ${todo.status}`}>{todo.status}</span>
              {todo.completedAt && (
                <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>
                  Completed: {formatDate(todo.completedAt)}
                </span>
              )}
              {todo.status === 'delayed' && todo.delayDays && (
                <span style={{ marginLeft: '10px', fontSize: '12px', color: '#ff9800' }}>
                  Delayed: {todo.delayDays} day{todo.delayDays > 1 ? 's' : ''} (until {getRestoreDate(todo)})
                </span>
              )}
              {todo.deadline && (
                <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>
                  Deadline: {formatDateTime(todo.deadline)}
                </span>
              )}
            </div>
            <div className="todo-actions">
              {(todo.status === 'pending' || todo.status === 'overdue') && (
                <>
                  <button className="btn btn-success" onClick={() => handleCompleteClick(getTodoId(todo))}>
                    Complete
                  </button>
                  {todo.status === 'pending' && (
                    <button className="btn btn-warning" onClick={() => handleDelayClick(getTodoId(todo))}>
                      Delay
                    </button>
                  )}
                </>
              )}
              {(todo.status === 'pending' || todo.status === 'overdue') && (
                <button className="btn btn-danger" onClick={() => updateTodo(getTodoId(todo), 'abandoned')}>
                  Give Up
                </button>
              )}
              {(todo.status === 'delayed' || todo.status === 'abandoned') && (
                <button className="btn btn-primary" onClick={() => updateTodo(getTodoId(todo), 'pending')}>
                  Restore
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showDatePicker && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '24px',
            borderRadius: '8px',
            minWidth: '300px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ marginTop: 0 }}>Select Completed Date</h3>
            <input
              type="date"
              value={completedDate}
              onChange={(e) => setCompletedDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                marginBottom: '20px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={handleDateCancel}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleDateSubmit}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showDelayPicker && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '24px',
            borderRadius: '8px',
            minWidth: '300px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ marginTop: 0 }}>Select Delay Period</h3>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '10px' }}>
              {[1, 2, 3, 4].map(days => (
                <button
                  key={days}
                  className="btn btn-warning"
                  onClick={() => handleDelaySubmit(days)}
                  style={{ minWidth: '60px' }}
                >
                  {days} day{days > 1 ? 's' : ''}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button className="btn btn-secondary" onClick={handleDelayCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {reminderNotification && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '24px',
            borderRadius: '8px',
            minWidth: '350px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            border: '3px solid #9c27b0'
          }}>
            <h3 style={{ marginTop: 0, color: '#9c27b0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>⏰</span> Reminder
            </h3>
            <p style={{ fontSize: '16px', marginBottom: '10px' }}>
              <strong>"{reminderNotification.title}"</strong>
            </p>
            <p style={{ fontSize: '14px', color: '#666' }}>
              {reminderNotification.message}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={() => setReminderNotification(null)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
