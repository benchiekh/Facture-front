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
import Select from 'react-select';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { colorOptions } from './colorOptions';

// Function to decode the JWT token and get payload
const decodeToken = (token) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const payload = JSON.parse(atob(base64));
  return payload;
};

// Function to determine if the color is light or dark
const isColorLight = (color) => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
};

const AddProductCategoryModal = ({ isOpen, toggle, userId, refreshCategories }) => {
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(colorOptions[0]);

  const token = localStorage.getItem('token');
  const decodedToken = token ? decodeToken(token) : {};
  const currentUserId = decodedToken.AdminID;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:5000/api/category`, {
        name: nom,
        description,
        color: color.value,
        createdBy: userId,
      });
      toggle();
      refreshCategories();
      setNom("");
      setDescription("");
      setColor(colorOptions[0]);
      toast.success('Category added successfully', {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      toast.error('Error creating category');
    }
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: '38px',
    }),
    option: (provided, state) => {
      const color = state.data.hex;
      const textColor = isColorLight(color) ? '#000' : '#fff';
      return {
        ...provided,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '10px',
        color: textColor,
        ':before': {
          content: '""',
          display: 'inline-block',
          marginRight: '10px', // Space between color block and text
          padding: '5px 10px', // Padding to make the width adaptive
          backgroundColor: color,
          borderRadius: '3px',
        },
        fontWeight: state.isSelected ? 'bold' : 'normal',
      };
    },
    singleValue: (provided, state) => {
      const color = state.data.hex;
      const textColor = isColorLight(color) ? '#000' : '#fff';
      return {
        ...provided,
        display: 'flex',
        alignItems: 'center',
        ':before': {
          content: '""',
          display: 'inline-block',
          marginRight: '10px', // Space between color block and text
          padding: '5px 10px', // Padding to make the width adaptive
          backgroundColor: color,
          borderRadius: '3px',
        },
        color: textColor,
      };
    },
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} fade={true} className="custom-modal">
      <ModalHeader toggle={toggle}>Add New Product Category</ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          <FormGroup>
            <Label for="nom">Category Name</Label>
            <Input
              type="text"
              id="nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label for="description">Description</Label>
            <Input
              type="textarea"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label for="color">Color</Label>
            <Select
              id="color"
              options={colorOptions}
              value={color}
              onChange={(selectedOption) => setColor(selectedOption)}
              isClearable={false}
              placeholder="Select a color"
              //styles={customStyles} // Applying custom styles
              formatOptionLabel={(option) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      backgroundColor: option.hex,
                      padding: '5px 10px',
                      borderRadius: '25px',
                      color: isColorLight(option.hex) ? '#000' : '#fff',
                    }}
                  >
                    {option.label}
                  </div>
                </div>
              )}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" type="submit">
            Save
          </Button>{' '}
          <Button color="secondary" onClick={toggle}>Cancel</Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default AddProductCategoryModal;
