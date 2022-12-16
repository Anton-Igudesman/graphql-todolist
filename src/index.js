import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';
import App from './App';

const client = new ApolloClient({
  uri: 'https://react-todo-777.hasura.app/v1/graphql',
  cache: new InMemoryCache() 
});

client
  .query({
    query: gql`
      query getTodo {
        todos {
          done
          id
          text
        }
      }
    `,
  })
  .then((result) => console.log(result));

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);


