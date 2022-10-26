import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Form, Alert } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import GoogleButton from 'react-google-button';
import { userAuthContext } from '../context/userAuthContext';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      error: '',
      password: '',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleGoogleSignIn = this.handleGoogleSignIn.bind(this);
  }

  logIn(email, password) {
    return this.context.logIn(email, password);
  }

  googleSignIn() {
    return this.context.googleSignIn();
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ error: '' });
    try {
      await this.logIn(this.state.email, this.state.password);
      console.log('wtf');
    } catch (err) {
      this.setState({ error: err.message });
    }
  };

  handleGoogleSignIn = async (e) => {
    e.preventDefault();
    try {
      await this.googleSignIn();

      // navigate("/home");
    } catch (error) {
      console.log(error.message);
    }
  };

  render() {
    return (
      <>
        {this.context.user && <Navigate to="/home" replace={true} />}

        <div className="p-4 box">
          <h2 className="mb-3">Firebase Auth Login</h2>
          {this.state.error && <Alert variant="danger">{this.state.error}</Alert>}
          <Form onSubmit={this.handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Control
                type="email"
                placeholder="Email address"
                onChange={(e) => this.setState({ email: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Control
                type="current-password"
                placeholder="Password"
                onChange={(e) => this.setState({ password: e.target.value })}
              />
            </Form.Group>

            <div className="d-grid gap-2">
              <Button variant="primary" type="Submit">
                Log In
              </Button>
            </div>
          </Form>
          <hr />
          <div>
            <GoogleButton onClick={this.handleGoogleSignIn} className="g-btn" type="dark" />
          </div>
        </div>
        <div className="p-4 box mt-3 text-center">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </>
    );
  }
}

Login.contextType = userAuthContext;

export default Login;
