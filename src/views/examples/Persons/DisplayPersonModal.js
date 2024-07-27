// src/components/DisplayPerson.js
import React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Table
} from 'reactstrap';

const DisplayPersonModal = ({ isOpen, toggle, person, companies }) => {
  const getCompanyNameById = (id) => {
    const company = companies.find(company => company._id === id);
    return company ? company.nom : 'Company Not Found';
  };

  const thStyle = {
    padding: '8px 12px',
    borderRadius: '10px',
    color: '#770737',
    backgroundColor: '#FFB6C1	',
    textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff',

  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>Person Details</ModalHeader>
      <ModalBody>
        <Table responsive>
          <tbody>
            <tr>
              <th ><span style={thStyle}>First Name</span></th>
              <td>{person.prenom}</td>
            </tr>
            <tr>
              <th ><span style={thStyle}>Last Name</span></th>
              <td>{person.nom}</td>
            </tr>
            <tr>
              <th ><span style={thStyle}>Company</span></th>
              <td>{getCompanyNameById(person.entreprise)}</td>
            </tr>
            <tr>
              <th><span style={thStyle}>Country</span></th>
              <td>{person.pays}</td>
            </tr>
            <tr>
              <th ><span style={thStyle}>Telephone</span></th>
              <td>{person.telephone}</td>
            </tr>
            <tr>
              <th ><span style={thStyle}>Email</span></th>
              <td>{person.email}</td>
            </tr>
          </tbody>
        </Table>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DisplayPersonModal;