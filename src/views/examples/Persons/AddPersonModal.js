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

const AddPersonModal = ({ isOpen, toggle, refreshPeople, userId }) => {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [company, setCompany] = useState("");
  const [pays, setPays] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [addCompanyModalOpen, setAddCompanyModalOpen] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/entreprise");
      const allCompanies = response.data;
      setCompanies(allCompanies);
      // Filter companies based on the current user
      const userCompanies = allCompanies.filter(company => company.createdBy === userId);
      setFilteredCompanies(userCompanies);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleAddCompanyModal = () => setAddCompanyModalOpen(!addCompanyModalOpen);

  const handleCompanyChange = (e) => {
    setCompany(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newPerson = {
      prenom,
      nom,
      entreprise: company, // Use the company ID here
      pays,
      telephone,
      email,
      createdBy: userId
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
      toast.error('Error creating person. Please try again.', {
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
              <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                <DropdownToggle caret>
                  {filteredCompanies.find(c => c._id === company)?.nom || "Select Company"}
                </DropdownToggle>
                <DropdownMenu>
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map((comp) => (
                      <DropdownItem key={comp._id} onClick={() => setCompany(comp._id)}>
                        {comp.nom}
                      </DropdownItem>
                    ))
                  ) : (
                    <DropdownItem disabled>No companies available</DropdownItem>
                  )}
                  <DropdownItem divider />
                  <DropdownItem onClick={toggleAddCompanyModal}>
                    <span className="ni ni-fat-add text-blue" style={{ fontSize: '24px' }}></span>
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
          fetchCompanies(); // Refresh the company list after adding a new company
          toggleAddCompanyModal(); // Close the modal after adding a company
        }}
        userId={userId}
      />
    </>
  );
};

export default AddPersonModal;
