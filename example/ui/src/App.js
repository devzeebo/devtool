import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Checkbox,
  Fab,
  GlobalStyles,
  Unstable_Grid2 as Grid,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Add as AddIcon, Delete } from '@mui/icons-material';

function App() {
  const [todos, setTodos] = useState([]);

  const fetchTodos = useCallback(
    () => {
      fetch('http://localhost:2000/api/todos').then(async (res) => {
        setTodos(await res.json());
      });
    },
    []
  )

  useEffect(
    () => {
      fetchTodos();
    },
    [fetchTodos],
  );

  const addTodo = useCallback(
    () => {
      fetch('http://localhost:2000/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'test',
        }),
      }).then(fetchTodos);
    },
    [fetchTodos]
  )

  const deleteTodo = useCallback(
    (id) => {
      fetch(`http://localhost:2000/api/todos/${id}`, {
        method: 'DELETE',
      }).then(fetchTodos)
    },
    [fetchTodos]
  )
  
  const completeTodo = useCallback(
    (id) => {
      fetch(`http://localhost:2000/api/todos/${id}`, {
        method: 'POST',
      }).then(fetchTodos)
    },
    [fetchTodos]
  )

  return (
    <Grid container direction="column" alignItems="center">
      <GlobalStyles styles={{
        html: {
          backgroundColor: '#E0E0E0',
        }
      }}></GlobalStyles>
      <Grid sx={{ maxWidth: '600px', width: '100%' }}>
        <Card>
          <CardContent>
            {todos.map(todo => (
              <ListItem
                secondaryAction={
                  <IconButton onClick={() => deleteTodo(todo._id)}>
                    <Delete />
                  </IconButton>
                }>
                <ListItemButton onClick={() => completeTodo(todo._id)}>
                  <ListItemIcon>
                    <Checkbox checked={todo.done} />
                  </ListItemIcon>
                  <ListItemText sx={{textDecoration: todo.done ? 'line-through' : 'none'}}>
                    {todo.name}
                  </ListItemText>
                </ListItemButton>
              </ListItem>
            ))}
          </CardContent>
        </Card>
      </Grid>
      <Fab onClick={addTodo} color="primary" sx={{
        position: 'fixed',
        right: '3em',
        bottom: '3em'
      }}>
        <AddIcon />
      </Fab>
    </Grid>
  );
}

export default App;
