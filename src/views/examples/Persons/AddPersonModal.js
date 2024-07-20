import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Form,
  FormGroup,
  Label
} from "reactstrap";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const AddPersonModal = ({ isOpen, toggle, refreshPeople }) => {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [company, setCompany] = useState("");
  const [pays, setPays] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newPerson = {
      prenom,
      nom,
      company,
      pays,
      telephone,
      email
    };

    try {
      await axios.post("http://localhost:5000/api/people", newPerson);
      refreshPeople(); 
      toggle();
      toast.success('Person added successfully', {
        autoClose: 2000, 
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      
      

    } catch (error) {
      console.error("Error creating new person:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} fade={true} className="custom-modal">
      <ModalHeader toggle={toggle}>Add New Person</ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          <FormGroup>
            <Label for="prenom">First Name</Label>
            <Input
              type="text"
              id="prenom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label for="nom">Last Name</Label>
            <Input
              type="text"
              id="nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
          <Label for="company">Company</Label>
          <Input
            type="select"
            name="company"
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}          >

            <option value="">Select company</option>
            <option value="Company A">Company A</option>
            <option value="Company B">Company B</option>
            <option value="Company C">Company C</option>
            
          </Input>
        </FormGroup>
          <FormGroup>
            <Label for="pays">Country</Label>
            <Input
              type="text"
              id="pays"
              value={pays}
              onChange={(e) => setPays(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label for="telephone">Tel</Label>
            <Input
              type="text"
              id="telephone"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label for="email">Email</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" type="submit">Save</Button>{' '}
          <Button color="secondary" onClick={toggle}>Cancel</Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default AddPersonModal;
