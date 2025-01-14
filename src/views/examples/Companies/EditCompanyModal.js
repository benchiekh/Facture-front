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
  InputGroup,
  InputGroupText
} from "reactstrap";
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import { parsePhoneNumber, isValidNumber, getCountryCallingCode } from 'libphonenumber-js';
import Flag from 'react-world-flags';

const decodeToken = (token) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const payload = JSON.parse(atob(base64));
  return payload;
};

const EditCompanyModal = ({ isOpen, toggle, company, refreshCompany, userId }) => {
  const [nom, setNom] = useState("");
  const [pays, setPays] = useState(null);
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [rib, setRib] = useState("");
  const [matriculeFiscale, setMatriculefiscale] = useState("");

  const [siteweb, setSiteweb] = useState("");
  const [mainContact, setMainContact] = useState(null);
  const [people, setPeople] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);

  const token = localStorage.getItem('token');
  const decodedToken = token ? decodeToken(token) : {};
  const currentUserId = decodedToken.AdminID;

  useEffect(() => {
    if (isOpen) {
      fetchPeople();
      setCountryOptions(countryList().getData().map(country => ({
        value: country.value,
        label: country.label
      })));
    }
  }, [isOpen]);

  useEffect(() => {
    if (company) {
      setNom(company.nom);
      setPays(countryOptions.find(option => option.value === company.pays) || null);
      setTelephone(company.telephone);
      setEmail(company.email);
      setRib(company.rib);
      setMatriculefiscale(company.matriculeFiscale);

      setSiteweb(company.siteweb);
      setMainContact(company.mainContact);
    }
  }, [company, countryOptions]);

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

    setTelephone((prev) => {
      const numberWithoutCode = prev.replace(/^\+\d+\s*/, '');
      return `${countryCode} ${numberWithoutCode}`;
    });
  };

  const validatePhoneNumber = (number, countryCode) => {
    try {
      const phoneNumber = number.replace(/\s+/g, '');
      return isValidNumber(phoneNumber, countryCode);
    } catch (error) {
      console.error("Phone number validation error:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const countryCode = pays ? pays.value : "";
    const numberToValidate = telephone.replace(/^\+\d+\s*/, '');

    if (!validatePhoneNumber(numberToValidate, countryCode)) {
      toast.error('Invalid phone number format.', {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    const updatedCompany = {
      nom,
      pays: pays ? pays.value : "",
      telephone,
      email,
      rib,
      matriculeFiscale,
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

  const customSingleValue = ({ data }) => (
    <div className="custom-single-value">
      <Flag code={data.value} alt={data.label} style={{ width: 20, marginRight: 10 }} />
      {data.label}
    </div>
  );

  const customOption = (props) => {
    const { data, innerRef, innerProps } = props;
    return (
      <div ref={innerRef} {...innerProps} className="custom-option">
        <Flag code={data.value} alt={data.label} style={{ width: 20, marginRight: 10 }} />
        {data.label}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} fade={true} className="custom-modal">
      <ModalHeader toggle={toggle}>Edit Company</ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          <FormGroup>
            <Label for="nom">Company Name</Label>
            <InputGroup>
              <InputGroupText style={{ backgroundColor: '#fff', border: '1px solid #ced4da', borderRight: 0, borderRadius: '0.25rem 0 0 0.25rem' }}>
                <i className="ni ni-building"></i>
              </InputGroupText>
              <Input
                type="text"
                id="nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Enter company name"
                required
                style={{ borderLeft: 0, borderRadius: '0 0.25rem 0.25rem 0', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = '#80bdff'}
                onBlur={(e) => e.target.style.borderColor = '#ced4da'}
              />
            </InputGroup>
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
              components={{ SingleValue: customSingleValue, Option: customOption }}
            />
          </FormGroup>
          <FormGroup>
            <Label for="telephone">Telephone</Label>
            <InputGroup>
              <InputGroupText style={{ backgroundColor: '#fff', border: '1px solid #ced4da', borderRight: 0, borderRadius: '0.25rem 0 0 0.25rem' }}>
                <i className="ni ni-mobile-button"></i>
              </InputGroupText>
              <Input
                type="text"
                id="telephone"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="Enter phone number"
                required
                style={{ borderLeft: 0, borderRadius: '0 0.25rem 0.25rem 0', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = '#80bdff'}
                onBlur={(e) => e.target.style.borderColor = '#ced4da'}
              />
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <Label for="email">Email</Label>
            <InputGroup>
              <InputGroupText style={{ backgroundColor: '#fff', border: '1px solid #ced4da', borderRight: 0, borderRadius: '0.25rem 0 0 0.25rem' }}>
                <i className="ni ni-email-83"></i>
              </InputGroupText>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
                style={{ borderLeft: 0, borderRadius: '0 0.25rem 0.25rem 0', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = '#80bdff'}
                onBlur={(e) => e.target.style.borderColor = '#ced4da'}
              />
            </InputGroup>
          </FormGroup>




          
          <FormGroup>
            <Label for="rib">RIB</Label>
            <InputGroup>
              <InputGroupText style={{ backgroundColor: '#fff', border: '1px solid #ced4da', borderRight: 0, borderRadius: '0.25rem 0 0 0.25rem' }}>
                <i className="ni ni-email-83"></i>
              </InputGroupText>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
                style={{ borderLeft: 0, borderRadius: '0 0.25rem 0.25rem 0', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = '#80bdff'}
                onBlur={(e) => e.target.style.borderColor = '#ced4da'}
              />
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <Label for="siteweb">Website</Label>
            <InputGroup>
              <InputGroupText style={{ backgroundColor: '#fff', border: '1px solid #ced4da', borderRight: 0, borderRadius: '0.25rem 0 0 0.25rem' }}>
                <i className="ni ni-world-2"></i>
              </InputGroupText>
              <Input
                type="text"
                id="siteweb"
                value={siteweb}
                onChange={(e) => setSiteweb(e.target.value)}
                placeholder="Enter website URL"
                required
                style={{ borderLeft: 0, borderRadius: '0 0.25rem 0.25rem 0', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = '#80bdff'}
                onBlur={(e) => e.target.style.borderColor = '#ced4da'}
              />
            </InputGroup>
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

export default EditCompanyModal;
