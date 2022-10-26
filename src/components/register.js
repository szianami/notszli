import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Form, Alert } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { userAuthContext } from '../context/userAuthContext';

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      error: '',
      password: '',
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ error: '' });
    try {
      await this.context.signUp(this.state.email, this.state.password);
    } catch (err) {
      this.setState({ error: err.message });
    }
  };

  render() {
    return (
      <>
        {this.context.user && <Navigate to="/home" replace={true} />}

        <div className="p-4 box">
          <h2 className="mb-3">Firebase Auth Signup</h2>
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
                Sign up
              </Button>
            </div>
          </Form>
        </div>
        <div className="p-4 box mt-3 text-center">
          Already have an account? <Link to="/login">Log In</Link>
        </div>
      </>
    );
  }
}

Register.contextType = userAuthContext;

export default Register;
