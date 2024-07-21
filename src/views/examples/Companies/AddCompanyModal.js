import React, { useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Form,
  FormGroup,
  Label,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const decodeToken = (token) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const payload = JSON.parse(atob(base64));
  return payload;
};
const AddCompanyModal = ({ isOpen, toggle, refreshCompany, userId }) => {
  
  const [nom, setNom] = useState("");
  const [pays, setPays] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [siteweb, setSiteweb] = useState("");
  const [mainContact, setMainContact] = useState(null);
  const [people, setPeople] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const token = localStorage.getItem('token');
  const decodedToken = token ? decodeToken(token) : {};
  const currentUserId = decodedToken.AdminID;
  console.log(currentUserId);

  useEffect(() => {
    if (isOpen) {
      fetchPeople();
    }
  }, [isOpen]);

  const fetchPeople = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/people");
      setPeople(response.data.filter(person => person.createdBy === currentUserId));
    } catch (error) {
      console.error("Error fetching people:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newCompany = {
      nom,
      pays,
      telephone,
      email,
      siteweb,
      createdBy: userId,
      mainContact
    };

    try {
      const response = await axios.post("http://localhost:5000/api/entreprise", newCompany);
      refreshCompany();
      toggle();
      toast.success('Company added successfully', {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error("Error creating new company:", error.response || error.message);
      toast.error('Error creating company. Please try again.', {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const toggleDropdown = () => setDropdownOpen(prevState => !prevState);

  const handleSelectContact = (contactId, contactName) => {
    setMainContact(contactId);
    toggleDropdown();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} fade={true} className="custom-modal">
      <ModalHeader toggle={toggle}>Add New Company</ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          <FormGroup>
            <Label for="nom">Company Name</Label>
            <Input
              type="text"
              id="nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
            />
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
          <FormGroup>
            <Label for="siteweb">Website</Label>
            <Input
              type="text"
              id="siteweb"
              value={siteweb}
              onChange={(e) => setSiteweb(e.target.value)}
              required
            />
          </FormGroup>
          {/* <FormGroup>
            <Label for="mainContact">Main Contact</Label>
            <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
              <DropdownToggle caret>
                {mainContact ? people.find(p => p._id === mainContact)?.prenom + ' ' + people.find(p => p._id === mainContact)?.nom : 'Select Main Contact'}
              </DropdownToggle>
              <DropdownMenu>
                {people.length > 0 ? people.map(person => (
                  <DropdownItem
                    key={person._id}
                    onClick={() => handleSelectContact(person._id, `${person.prenom} ${person.nom}`)}
                  >
                    {person.prenom} {person.nom}
                  </DropdownItem>
                )) : <DropdownItem disabled>No contacts available</DropdownItem>}
              </DropdownMenu>
            </Dropdown>
          </FormGroup> */}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" type="submit">Save</Button>{' '}
          <Button color="secondary" onClick={toggle}>Cancel</Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default AddCompanyModal;
