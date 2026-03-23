import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { todoCollection, userCollection, dataApi } from '../utils/mongodb';

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

const Admin = () => {
  const { user, logout } = useAuth();
  const [allTodos, setAllTodos] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [completedDateFilter, setCompletedDateFilter] = useState('all');
  const [delayFilter, setDelayFilter] = useState('all');
  const [showDeleted, setShowDeleted] = useState(false);

  const fetchAllTodos = async () => {
    try {
      let allTodos = await todoCollection.findAll();
      
      const allUsers = await userCollection.findAll();
      setUsers(allUsers);
      
      const userMap = {};
      allUsers.forEach(u => {
        const uid = typeof u._id === 'object' ? u._id.$oid : u._id;
        userMap[uid] = u;
      });
      
      allTodos = checkAndRestoreDelays(allTodos);
      allTodos = checkAndMarkOverdue(allTodos);
      
      setAllTodos(allTodos);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllTodos();
    }
  }, [user]);

  const deleteTodo = async (id) => {
    try {
      await todoCollection.delete(id);
      fetchAllTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const restoreTodo = async (id) => {
    try {
      await todoCollection.restore(id);
      fetchAllTodos();
    } catch (error) {
      console.error('Error restoring todo:', error);
    }
  };

  const getCompletedMonthKey = (todo) => {
    if (!todo.completedAt) return 'unknown';
    const date = new Date(todo.completedAt);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const filteredTodos = allTodos.filter(t => {
    if (t.isDeleted && !showDeleted) return false;
    if (!t.isDeleted && showDeleted) return false;
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
    allTodos
      .filter(t => t.completedAt)
      .map(getCompletedMonthKey)
  )].sort().reverse();

  const delayDaysOptions = [...new Set(
    allTodos
      .filter(t => t.delayDays)
      .map(t => t.delayDays)
  )].sort((a, b) => a - b);

  const statusCounts = {
    pending: allTodos.filter(t => !t.isDeleted && t.status === 'pending').length,
    overdue: allTodos.filter(t => !t.isDeleted && t.status === 'overdue').length,
    completed: allTodos.filter(t => !t.isDeleted && t.status === 'completed').length,
    delayed: allTodos.filter(t => !t.isDeleted && t.status === 'delayed').length,
    abandoned: allTodos.filter(t => !t.isDeleted && t.status === 'abandoned').length,
    deleted: allTodos.filter(t => t.isDeleted).length,
  };

  const groupedByUser = filteredTodos.reduce((acc, todo) => {
    const userId = typeof todo.userId === 'object' ? todo.userId.$oid : todo.userId;
    const userInfo = users.find(u => (u._id?.$oid || u._id) === userId);
    const email = userInfo?.email || 'Unknown';
    if (!acc[email]) acc[email] = [];
    acc[email].push(todo);
    return acc;
  }, {});

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
        <h1>Admin Panel</h1>
        <div>
          <span style={{ marginRight: '10px' }}>{user.email}</span>
          <button className="btn btn-danger" onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <span style={{ padding: '10px', background: '#e3f2fd', borderRadius: '4px' }}>
          Pending: {statusCounts.pending}
        </span>
        <span style={{ padding: '10px', background: '#e1bee7', borderRadius: '4px', color: '#7b1fa2' }}>
          Overdue: {statusCounts.overdue}
        </span>
        <span style={{ padding: '10px', background: '#c8e6c9', borderRadius: '4px' }}>
          Completed: {statusCounts.completed}
        </span>
        <span style={{ padding: '10px', background: '#ffe0b2', borderRadius: '4px' }}>
          Delayed: {statusCounts.delayed}
        </span>
        <span style={{ padding: '10px', background: '#ffcdd2', borderRadius: '4px' }}>
          Abandoned: {statusCounts.abandoned}
        </span>
        <span style={{ padding: '10px', background: '#e0e0e0', borderRadius: '4px' }}>
          Deleted: {statusCounts.deleted}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          className={`filter-btn ${!showDeleted ? 'active' : ''}`}
          onClick={() => setShowDeleted(false)}
        >
          Active Todos
        </button>
        <button
          className={`filter-btn ${showDeleted ? 'active' : ''}`}
          onClick={() => setShowDeleted(true)}
        >
          Deleted Todos
        </button>
      </div>

      {!showDeleted && (
        <>
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
        </>
      )}

      <div className="admin-panel">
        {Object.entries(groupedByUser).map(([email, todos]) => (
          <div key={email} className="user-section">
            <h4>{email} ({todos.length} todos)</h4>
            {todos.map(todo => (
              <div key={getTodoId(todo)} className={`todo-item ${todo.status}`} style={{ marginBottom: '5px', opacity: todo.isDeleted ? 0.6 : 1 }}>
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
                  {todo.isDeleted && (
                    <span style={{ marginLeft: '10px', fontSize: '12px', color: '#999' }}>
                      [Deleted]
                    </span>
                  )}
                </div>
                <div className="todo-actions">
                  {!todo.isDeleted && (
                    <button className="btn btn-danger" onClick={() => deleteTodo(getTodoId(todo))}>
                      Delete
                    </button>
                  )}
                  {todo.isDeleted && (
                    <button className="btn btn-primary" onClick={() => restoreTodo(getTodoId(todo))}>
                      Restore
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;
