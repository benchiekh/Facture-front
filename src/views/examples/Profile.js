import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  Container,
  Row,
  Col,
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader.js";
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const decodeToken = (token) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const payload = JSON.parse(atob(base64));
  return payload;
};

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const Profile = () => {
  const [user, setUser] = useState({});
  const [avatarColor, setAvatarColor] = useState(getRandomColor());
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = decodeToken(token);
      setUser(decodedToken);
      const storedImage = localStorage.getItem(`profileImage_${decodedToken.AdminID}`);
      if (storedImage) {
        setPreviewImage(storedImage);
      } else if (decodedToken.photo) {
        const imageUrl = decodedToken.photo.startsWith('http')
          ? decodedToken.photo
          : `http://localhost:5000/${decodedToken.photo}`;
        setPreviewImage(imageUrl);
        localStorage.setItem(`profileImage_${decodedToken.AdminID}`, imageUrl);
      }
    }
  }, []);

  const togglePasswordForm = () => {
    setShowPasswordForm(!showPasswordForm);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageSubmit = async () => {
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append('photo', selectedImage);

    try {
      const token = localStorage.getItem('token');
      const { AdminID } = decodeToken(token);
      const response = await axios.post(
        `http://localhost:5000/api/update/${AdminID}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const updatedUser = response.data;
      setUser(updatedUser);
      if (updatedUser.photo) {
        const imageUrl = updatedUser.photo.startsWith('http')
          ? updatedUser.photo
          : `http://localhost:5000/${updatedUser.photo}`;
        setPreviewImage(imageUrl);
        localStorage.setItem(`profileImage_${AdminID}`, imageUrl);
      }
      setSelectedImage(null);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handlePasswordSubmit = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const { AdminID } = decodeToken(token);
      const response = await axios.post(
        `http://localhost:5000/api/update/${AdminID}/`,
        { password: newPassword },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        toast.success('Password updated successfully. Please log in again.');
        localStorage.removeItem('token');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        toast.error(response.data.message || 'Error updating password.');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Error updating password.');
    }
  };

  return (
    <>
      <UserHeader />
      <ToastContainer />
      <Container className="mt--7" fluid>
        <Row>
          <Col className="order-xl-2 mb-5 mb-xl-0" xl="4">
            <Card className="card-profile shadow">
              <Row className="justify-content-center">
                <Col className="order-lg-2" lg="3" responsive>
                  <div className="card-profile-image">
                    <a href="#pablo" onClick={(e) => e.preventDefault()}>
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Profile"
                          style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            backgroundColor: avatarColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '40px',
                            color: 'white',
                            marginTop: "20px"
                          }}
                        >
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </a>
                  </div>
                </Col>
              </Row>
              <CardHeader className="text-center border-0 pt-8 pt-md-4 pb-0 pb-md-4">
                <div className="d-flex justify-content-between">
                  <Button
                    className="mr-4"
                    color="info"
                    onClick={() => document.getElementById('imageInput').click()}
                    size="sm"
                  >
                    Change profile image
                  </Button>
                  <input
                    type="file"
                    id="imageInput"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                  <Button
                    className="float-right"
                    color="default"
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                    size="sm"
                  >
                    Message
                  </Button>
                </div>
                {selectedImage && (
                  <div className="text-center mt-2">
                    <Button
                      color="primary"
                      onClick={handleImageSubmit}
                      size="sm"
                    >
                      Save
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardBody className="pt-0 pt-md-4">
                <Row>
                  <div className="col">
                    <div className="card-profile-stats d-flex justify-content-center mt-md-5">
                      <div>
                        <span className="heading">22</span>
                        <span className="description">Friends</span>
                      </div>
                      <div>
                        <span className="heading">10</span>
                        <span className="description">Photos</span>
                      </div>
                      <div>
                        <span className="heading">89</span>
                        <span className="description">Comments</span>
                      </div>
                    </div>
                  </div>
                </Row>
                <div className="text-center">
                  <h3>
                    {user.name || 'User'}
                    <span className="font-weight-light">, {user.surname || 'N/A'}</span>
                  </h3>
                  <div className="h5 font-weight-300">
                    <i className="ni location_pin mr-2" />
                    {user.email || 'City, Country'}
                  </div>
                  <div className="h5 mt-4">
                    <i className="ni business_briefcase-24 mr-2" />
                    {user.Position || 'Position'}
                  </div>
                  <div>
                    <i className="ni education_hat mr-2" />
                    {user.role || 'Education'}
                  </div>
                  <hr className="my-4" />
                  <p>
                    {user.Bio || 'A few words about you...'}
                  </p>
                  <a href="#pablo" onClick={(e) => e.preventDefault()}>
                    Show more
                  </a>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col className="order-xl-1" xl="8">
            <Card className="bg-secondary shadow">
              <CardHeader className="bg-white border-0">
                <Row className="align-items-center">
                  <Col xs="8">
                    <h3 className="mb-0">My account</h3>
                  </Col>
                  <Col className="text-right" xs="4">
                    <Button
                      color="primary"
                      href="#pablo"
                      onClick={(e) => {
                        e.preventDefault();
                        togglePasswordForm();
                      }}
                      size="sm"
                    >
                      {showPasswordForm ? 'Cancel' : 'Change Password'}
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Form>
                  <h6 className="heading-small text-muted mb-4">User information</h6>
                  <div className="pl-lg-4">
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="input-username">
                            Username
                          </label>
                          <Input
                            className="form-control-alternative"
                            id="input-username"
                            placeholder="Username"
                            type="text"
                            value={user.name || ''}
                            readOnly
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="input-email">
                            Email address
                          </label>
                          <Input
                            className="form-control-alternative"
                            id="input-email"
                            placeholder="jesse@example.com"
                            type="email"
                            value={user.email || ''}
                            readOnly
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="input-first-name">
                            First name
                          </label>
                          <Input
                            className="form-control-alternative"
                            id="input-first-name"
                            placeholder="First name"
                            type="text"
                            value={user.name || ''}
                            readOnly
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="input-last-name">
                            Last name
                          </label>
                          <Input
                            className="form-control-alternative"
                            id="input-last-name"
                            placeholder="Last name"
                            type="text"
                            value={user.surname || ''}
                            readOnly
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>
                  {showPasswordForm && (
                    <div className="pl-lg-4">
                      <h6 className="heading-small text-muted mb-4">Change Password</h6>
                      <Row>
                        <Col lg="6">
                          <FormGroup>
                            <label className="form-control-label" htmlFor="input-new-password">
                              New Password
                            </label>
                            <Input
                              className="form-control-alternative"
                              id="input-new-password"
                              placeholder="New password"
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                            />
                          </FormGroup>
                        </Col>
                        <Col lg="6">
                          <FormGroup>
                            <label className="form-control-label" htmlFor="input-confirm-password">
                              Confirm Password
                            </label>
                            <Input
                              className="form-control-alternative"
                              id="input-confirm-password"
                              placeholder="Confirm password"
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                      <Button color="primary" onClick={handlePasswordSubmit}>
                        Update Password
                      </Button>
                    </div>
                  )}
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Profile;
