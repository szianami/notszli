import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
import UserAuthContextProvider from './context/userAuthContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Register from './components/register';
import Login from './components/login';
import Document from './components/document';
import reportWebVitals from './reportWebVitals';
import ErrorPage from './components/errorPage';
import { withRouter } from './withRouter';
import DocumentsContextProvider from './context/documentsContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00006d',
      vlight: '#e8ceff',
      dark: '#000042',
    },
    secondary: {
      main: '#fcc4ba',
      light: '#fff7ec',
    },
  },
});

const AppWithRouter = withRouter(App);

const DocumentWithRouter = withRouter(Document);

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      //<ProtectedRoute>
      <AppWithRouter />
      //</ProtectedRoute>
    ),
    // hogy lehet beletenni az eredeti protected route-ot?
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'documents/:documentId',
        element: <DocumentWithRouter />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={theme}>
    <UserAuthContextProvider>
      <DocumentsContextProvider>
        <RouterProvider router={router} />
      </DocumentsContextProvider>
    </UserAuthContextProvider>
  </ThemeProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
