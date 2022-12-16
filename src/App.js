import React, { useState } from 'react';
import { useQuery, gql, useMutation, } from '@apollo/client';
import 'tachyons';

//add todos
//delete todos

const GET_TODOS = gql`
  query getTodo {
    todos {
      done
      id
      text
  }
}`

const TOGGLE_TODO = gql`
  mutation toggleTodo($id: uuid!, $done: Boolean!) {
  update_todos(where: {id: {_eq: $id}}, _set: {done: $done}) {
    returning {
      done
      id
      text
    }
  }
}`

const ADD_TODO = gql`
  mutation addTodo($text: String) {
  insert_todos(objects: {text: $text}) {
    returning {
      done
      id
      text
    }
  }
}`

const DELETE_TODO = gql`
  mutation deleteTodos($id: uuid!) {
  delete_todos(where: {id: {_eq: $id}}) {
    returning {
      done
      id
      text
    }
  }
}`
export default function App() {
  const [addTaskInput, setAddTaskInput] = useState('');
  const { data, loading, error } = useQuery(GET_TODOS)
  const [toggleTodo] = useMutation(TOGGLE_TODO);
  const [addingTodo] = useMutation(ADD_TODO, {
    onCompleted: () => setAddTaskInput('')
  });
  const [deleteTodo] = useMutation(DELETE_TODO);

  if (loading) return <div>...loading todos</div>
  if (error) return <div>Error fetching todos</div>

  async function handleToggleTodo({ id, done }) {
    const data = await toggleTodo({ variables: { id, done: !done } })
    console.log('toggle: ', data);
  }

  async function handleAddingTodo(event) {
    event.preventDefault();
    if (!addTaskInput.trim()) {
      setAddTaskInput('');
      return
    } 
    const data = await addingTodo({ 
      variables: {text: addTaskInput},
      refetchQueries: [
        { query: GET_TODOS }
      ]
    });
    console.log('add task: ', data);
  }

  async function handleDeleteTodo({ id }) {
    const isConfirmed = window.confirm('Are you sure you want to delete?')
    if (isConfirmed) {
      const data = await deleteTodo({ 
        variables: { id },
        update: cache => {
          const prevData = cache.readQuery({ query: GET_TODOS })
          const newTodos = prevData.todos.filter(todo => todo.id !== id)
          cache.writeQuery({ query: GET_TODOS, data: { todos: newTodos } });
        }
      });
    }
  }
  
  return(
    <div className='vh-100 code flex flex-column items-center bg-purple white pa4 fl-1'>
      <h1 className='f2-l'>
        GraphQL Checklist{' '}
        <span role='img' aria-label='checkmark'>✅</span>
        </h1>
        <h5 className='red'>Click on a task to mark it as complete!</h5>
      <form onSubmit={handleAddingTodo}>
        <input
          value={addTaskInput}
          onChange={event => setAddTaskInput(event.target.value)}
          className='br3 pa1 mr2 bg-pink black' 
          type='text'
          placeholder='Add a task'
       />
          <button className='br3 pa1 bg-black white pointer grow'
          type='submit'>Create</button>
      </form>
      <div>
      {data.todos.map(todo => (
        <p onClick={() => handleToggleTodo(todo)} key={todo.id}>
          <span className={`mr2 pointer ${todo.done && 'strike'}`}>
            {todo.text}
          </span>
          <button
            onClick={() => handleDeleteTodo(todo)} 
            className='br3 bg-black white pointer'>
            &times;
            </button>
        </p>
      ))}
      </div>
    </div>
  ) 
  
}


