import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, CardBody, FormGroup, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Col, CardHeader } from 'reactstrap';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/sendotp', { email });
      setMessage(response.data.message);
      setStep(2);
    } catch (error) {
      setError(error.response?.data?.error || 'Error requesting OTP');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/verfieropt', { email, otp });
      setMessage(response.data.message);
      setStep(3);
    } catch (error) {
      setError(error.response?.data?.error || 'Invalid or expired OTP');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/resetpassword', { email, newpassword: newPassword });
      setMessage(response.data.message);
      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.error || 'Error resetting password');
    }
  };

  return (
    <Col lg="5" md="7" className="mx-auto">
      <Card className="bg-secondary shadow border-0">
        <CardHeader className="bg-transparent pb-5"></CardHeader>
        <CardBody className="px-lg-5 py-lg-5">
          <Form role="form" onSubmit={step === 1 ? handleRequestOtp : step === 2 ? handleVerifyOtp : handleResetPassword}>
            {message && <div className="text-center text-success mb-4"><small>{message}</small></div>}
            {error && <div className="text-center text-danger mb-4"><small>{error}</small></div>}

            {step === 1 && (
              <FormGroup className="mb-3">
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText><i className="ni ni-email-83" /></InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </InputGroup>
              </FormGroup>
            )}

            {step === 2 && (
              <FormGroup className="mb-3">
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText><i className="ni ni-lock-circle-open" /></InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="OTP"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </InputGroup>
              </FormGroup>
            )}

            {step === 3 && (
              <FormGroup className="mb-3">
                <InputGroup className="input-group-alternative">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText><i className="ni ni-lock-circle-open" /></InputGroupText>
                  </InputGroupAddon>
                  <Input
                    placeholder="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </InputGroup>
              </FormGroup>
            )}

            <div className="text-center">
              <Button className="my-4" color="primary" type="submit">
                {step === 1 ? 'Request OTP' : step === 2 ? 'Verify OTP' : 'Reset Password'}
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
      <Col className="text-center mt-4">
        <Link className="text-light" to="/auth/login">
          <small>Sign in</small>
        </Link>
      </Col>
    </Col>
  );
};

export default ForgotPassword;
