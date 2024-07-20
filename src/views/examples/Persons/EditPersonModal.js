import React, { useState, useEffect } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label } from "reactstrap";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditPersonModal = ({ isOpen, toggle, person, refreshPeople }) => {
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    company: "",
    pays: "",
    telephone: "",
    email: "",
  });

  useEffect(() => {
    if (person) {
      setFormData({
        prenom: person.prenom,
        nom: person.nom,
        company: person.company,
        pays: person.pays,
        telephone: person.telephone,
        email: person.email,
      });
    }
  }, [person]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await axios.put(`http://localhost:5000/api/people/${person._id}`, formData);
      refreshPeople(); 
      toggle(); 
      toast.success('Person updated successfully', {
        autoClose: 2000, 
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

    } catch (error) {
      console.error("Error updating person:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} fade={true}>
      <ModalHeader toggle={toggle}>Edit Person</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label for="prenom">First Name</Label>
          <Input
            type="text"
            name="prenom"
            id="prenom"
            value={formData.prenom}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="nom">Last Name</Label>
          <Input
            type="text"
            name="nom"
            id="nom"
            value={formData.nom}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="company">Company</Label>
          <Input
            type="select"
            name="company"
            id="company"
            value={formData.company}
            onChange={handleChange}
          >
            <option value="">Select Company</option>
            <option value="Company A">Company A</option>
            <option value="Company B">Company B</option>
            <option value="Company C">Company C</option>
            {/* Add more options as needed */}
          </Input>
        </FormGroup>
        <FormGroup>
          <Label for="pays">Country</Label>
          <Input
            type="text"
            name="pays"
            id="pays"
            value={formData.pays}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="telephone">Telephone</Label>
          <Input
            type="text"
            name="telephone"
            id="telephone"
            value={formData.telephone}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="email">Email</Label>
          <Input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
          />
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleSubmit}>Save</Button>{' '}
        <Button color="secondary" onClick={toggle}>Cancel</Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditPersonModal;
