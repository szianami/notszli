import * as React from 'react';
import { userAuthContext } from '../context/userAuthContext';
import { Snackbar, Alert } from '@mui/material';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Navbar from './navbar';
import { Navigate } from 'react-router-dom';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      error: '',
      password: '',
      user: false,
      isAlertOpen: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.googleSignIn = this.googleSignIn.bind(this);
    this.closeAlert = this.closeAlert.bind(this);
  }

  handleSubmit = async (event) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');

    this.setState({ error: '' });
    await this.context.logIn(email, password).catch((err) => {
      this.setState({ isAlertOpen: true, error: err.message, user: true });
    });
  };

  async googleSignIn() {
    await this.context.googleSignIn().catch((err) => {
      console.log(err);
      this.setState({ isAlertOpen: true, error: err.message, user: true });
    });
  }

  closeAlert(event, reason) {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({ isAlertOpen: false });
  }

  render() {
    return (
      <>
        <Navbar />
        {this.context.user && <Navigate to="/" replace={true} />}

        <Snackbar
          open={this.state.isAlertOpen}
          autoHideDuration={3000}
          onClose={this.closeAlert}
        >
          <Alert
            onClose={this.closeAlert}
            severity="error"
            sx={{ width: '100%' }}
          >
            {this.state.error}
          </Alert>
        </Snackbar>

        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography
              component="h1"
              variant="h5"
              style={{
                fontSize: '50px',
                fontFamily: 'Segoe UI',
                marginTop: '12vh',
                fontWeight: '700',
                textAlign: 'center',
              }}
              color="primary"
            >
              Log in
            </Typography>
            <Box
              component="form"
              onSubmit={this.handleSubmit}
              noValidate
              sx={{ mt: 1 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email address"
                name="email"
                autoComplete="email"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              />
              <Button
                color="primary"
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Go!
              </Button>
              <Divider
                variant="fullWidth"
                style={{
                  borderColor: '#1976d2',
                }}
              />
              <Grid container>
                <Grid item xs={12}>
                  <Button
                    onClick={this.googleSignIn}
                    fullWidth
                    variant="outlined"
                    sx={{ mt: 3, mb: 2 }}
                  >
                    <img
                      src="https://img.icons8.com/color/30/null/google-logo.png"
                      alt="google logo"
                    />
                    Continue with Google
                  </Button>
                </Grid>
                <Grid item sx={{ marginLeft: 'auto', marginRight: 'auto' }}>
                  <Link
                    href="/register"
                    variant="body2"
                    style={{ textDecoration: 'none' }}
                  >
                    Don't have an account? Sign up
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>
      </>
    );
  }
}

Login.contextType = userAuthContext;

export default Login;
