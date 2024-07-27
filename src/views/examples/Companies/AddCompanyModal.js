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
  Label
} from "reactstrap";
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import { getCountryCallingCode, parsePhoneNumberFromString } from 'libphonenumber-js';
import Flag from 'react-world-flags';

// Function to decode the JWT token and get payload
const decodeToken = (token) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const payload = JSON.parse(atob(base64));
  return payload;
};

// Function to validate phone number based on country
const validatePhoneNumber = (number, countryCode) => {
  if (!countryCode || !number) return false;

  const phoneNumber = parsePhoneNumberFromString(number, countryCode);
  return phoneNumber ? phoneNumber.isValid() : false;
};

const AddCompanyModal = ({ isOpen, toggle, refreshCompany, userId }) => {
  const [nom, setNom] = useState("");
  const [pays, setPays] = useState(null);
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [siteweb, setSiteweb] = useState("");
  const [mainContact, setMainContact] = useState(null);
  const [people, setPeople] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const token = localStorage.getItem('token');
  const decodedToken = token ? decodeToken(token) : {};
  const currentUserId = decodedToken.AdminID;

  const countryOptions = countryList().getData().map(country => ({
    value: country.value,
    label: (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Flag code={country.value} style={{ width: 20, marginRight: 10 }} />
        {country.label}
      </div>
    )
  }));

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

  const handleCountryChange = (selectedOption) => {
    setPays(selectedOption);

    const countryCode = selectedOption?.value ? `+${getCountryCallingCode(selectedOption.value)}` : "";

    // Remove any existing country code and set the new one
    setTelephone((prev) => {
      const numberWithoutCode = prev.replace(/^\+\d+\s*/, '');
      return `${countryCode} ${numberWithoutCode}`;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePhoneNumber(telephone, pays?.value)) {
      toast.error('Invalid phone number for the selected country. Please check the number and try again.', {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    const newCompany = {
      nom,
      pays: pays ? pays.value : "",
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

      // Clear the form
      setNom("");
      setPays(null);
      setTelephone("");
      setEmail("");
      setSiteweb("");
      setMainContact(null);
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
            <Select
              options={countryOptions}
              value={pays}
              onChange={handleCountryChange}
              placeholder="Select country"
              isClearable
              styles={{
                control: (provided) => ({
                  ...provided,
                  border: '1px solid #ced4da',
                  borderRadius: '0.25rem',
                  transition: 'border-color 0.2s'
                }),
                menu: (provided) => ({
                  ...provided,
                  zIndex: 9999
                })
              }}
            />
          </FormGroup>
          <FormGroup>
            <Label for="telephone">Telephone</Label>
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
