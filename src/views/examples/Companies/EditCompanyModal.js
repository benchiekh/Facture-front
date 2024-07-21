import React, { useState, useEffect } from "react";
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

const EditCompanyModal = ({ isOpen, toggle, company, refreshCompany, userId }) => {
  const [nom, setNom] = useState("");
  const [pays, setPays] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [siteweb, setSiteweb] = useState("");
  const [mainContact, setMainContact] = useState(null);
  const [people, setPeople] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (company) {
      setNom(company.nom);
      setPays(company.pays);
      setTelephone(company.telephone);
      setEmail(company.email);
      setSiteweb(company.siteweb);
      setMainContact(company.mainContact);
    }
    fetchPeople();
  }, [company]);

  const fetchPeople = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/people");
      setPeople(response.data.filter(person => person.createdBy === userId));
    } catch (error) {
      console.error("Error fetching people:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedCompany = {
      nom,
      pays,
      telephone,
      email,
      siteweb,
      mainContact
    };

    try {
      await axios.put(`http://localhost:5000/api/entreprise/${company._id}`, updatedCompany);
      refreshCompany();
      toggle();
      toast.success('Company updated successfully', {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error("Error updating company:", error);
      toast.error('Error updating company. Please try again.', {
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

  const handleSelectContact = (contactId) => {
    setMainContact(contactId);
    toggleDropdown();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} fade={true} className="custom-modal">
      <ModalHeader toggle={toggle}>Edit Company</ModalHeader>
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
                    onClick={() => handleSelectContact(person._id)}
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

export default EditCompanyModal;
