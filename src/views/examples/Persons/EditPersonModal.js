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
import 'react-toastify/dist/ReactToastify.css';
import AddCompanyModal from "../Companies/AddCompanyModal";

const EditPersonModal = ({ isOpen, toggle, person, refreshPeople, userId }) => {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [company, setCompany] = useState("");
  const [pays, setPays] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [companies, setCompanies] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [addCompanyModalOpen, setAddCompanyModalOpen] = useState(false);

  useEffect(() => {
    fetchCompanies();
    if (person) {
      setPrenom(person.prenom);
      setNom(person.nom);
      setCompany(person.entreprise);
      setPays(person.pays);
      setTelephone(person.telephone);
      setEmail(person.email);
    }
  }, [person, userId]);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/entreprise`);
      const filteredCompanies = response.data.filter(company => company.createdBy === userId);
      console.log(filteredCompanies)
      setCompanies(filteredCompanies);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleAddCompanyModal = () => setAddCompanyModalOpen(!addCompanyModalOpen);

  const handleCompanyChange = (companyId) => {
    setCompany(companyId);
    toggleDropdown();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedPerson = {
      prenom,
      nom,
      entreprise: company,
      pays,
      telephone,
      email
    };

    try {
      await axios.put(`http://localhost:5000/api/people/${person._id}`, updatedPerson);
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
      toast.error('Error updating person. Please try again.', {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} toggle={toggle} fade={true} className="custom-modal">
        <ModalHeader toggle={toggle}>Edit Person</ModalHeader>
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
              <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                <DropdownToggle caret>
                  {companies.find(c => c._id === company)?.nom || "Select Company"}
                </DropdownToggle>
                <DropdownMenu>
                  {companies.map((comp) => (
                    <DropdownItem key={comp._id} onClick={() => handleCompanyChange(comp._id)}>
                      {comp.nom}
                    </DropdownItem>
                  ))}
                  <DropdownItem divider />
                  <DropdownItem onClick={toggleAddCompanyModal}>
                    Add New Company
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
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

      <AddCompanyModal
        isOpen={addCompanyModalOpen}
        toggle={toggleAddCompanyModal}
        refreshCompany={() => {
          fetchCompanies();
          toggleAddCompanyModal();
        }}
        userId={userId}
      />
    </>
  );
};

export default EditPersonModal;
