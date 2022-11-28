import * as React from 'react';
import GoogleButton from 'react-google-button';
import { userAuthContext } from '../context/userAuthContext';
import validator from 'validator';
import { Snackbar, Alert } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const theme = createTheme();

class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      displayName: '',
      error: '',
      password: '',
      isEmailValid: true,
      isAlertOpen: false,
      helperText: '',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.googleSignIn = this.googleSignIn.bind(this);
    this.closeAlert = this.closeAlert.bind(this);
  }

  async googleSignIn() {
    await this.context.googleSignIn().catch((err) => {
      console.log(err);
      this.setState({ isAlertOpen: true });
      this.setState({ error: err.message });
    });
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');
    const displayName = data.get('displayName');

    if (email) {
      if (!validator.isEmail(email)) {
        this.setState({ isEmailValid: false, helperText: 'Invalid email' });
        return;
      } else {
        this.setState({ isEmailValid: true, helperText: '' });
      }
    }

    await this.context.signUp(email, password, displayName).catch((err) => {
      console.log(err);
      this.setState({ isAlertOpen: true });
      this.setState({ error: err.message });
    });
  };

  closeAlert(event, reason) {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({ isAlertOpen: false });
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <Snackbar open={this.state.isAlertOpen} autoHideDuration={3000} onClose={this.closeAlert}>
          <Alert onClose={this.closeAlert} severity="error" sx={{ width: '100%' }}>
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
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign up to Notszli
            </Typography>
            <Box component="form" onSubmit={this.handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                error={!this.state.isEmailValid}
                helperText={this.state.helperText}
              />
              <TextField margin="normal" required fullWidth id="displayName" label="Display Name" name="displayName" />
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
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                Go!
              </Button>
              <Grid container>
                <Grid item>
                  <Link href="#" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
                <Grid item>
                  <GoogleButton onClick={this.googleSignIn} className="g-btn" type="dark" />
                </Grid>
              </Grid>
            </Box>
          </Box>
          <Copyright sx={{ mt: 8, mb: 4 }} />
        </Container>
      </ThemeProvider>
    );
  }
}

SignIn.contextType = userAuthContext;

export default SignIn;
