import { createContext, useContext, useState, useEffect } from 'react';
import { getTasks } from '../api/tasks.js';
import { useAuth } from './AuthContext.jsx';

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await getTasks();
      setTasks(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [user]);

  return (
    <TaskContext.Provider value={{ tasks, loading, fetchTasks }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => useContext(TaskContext);
