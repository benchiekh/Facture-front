import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Label, Input } from 'reactstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import Switch from 'react-switch'; 

const EditCurrencyModal = ({ isOpen, toggle, currency, refreshCurrencies }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    symbol: '',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandSeparator: ',',
    precision: 2,
    zeroFormat: 'show',
    active: true,
  });

  useEffect(() => {
    if (currency) {
      setFormData({
        name: currency.name || '',
        code: currency.code || '',
        symbol: currency.symbol || '',
        symbolPosition: currency.symbolPosition || 'before',
        decimalSeparator: currency.decimalSeparator || '.',
        thousandSeparator: currency.thousandSeparator || ',',
        precision: currency.precision || 2,
        zeroFormat: currency.zeroFormat || 'show',
        active: currency.active || true,
      });
    }
  }, [currency]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSwitchChange = (checked) => {
    setFormData({
      ...formData,
      active: checked
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/currency/${currency._id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      refreshCurrencies();
      toggle();
      toast.success('Currency updated successfully', {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (error) {
      console.error("Error updating currency:", error);
      toast.error('Failed to update currency', {
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
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Edit Currency</ModalHeader>
      <ModalBody>
        <FormGroup>
          <Label for="name">Name</Label>
          <Input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="code">Code</Label>
          <Input
            type="text"
            name="code"
            id="code"
            value={formData.code}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="symbol">Symbol</Label>
          <Input
            type="text"
            name="symbol"
            id="symbol"
            value={formData.symbol}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="symbolPosition">Symbol Position</Label>
          <Input
            type="select"
            name="symbolPosition"
            id="symbolPosition"
            value={formData.symbolPosition}
            onChange={handleChange}
          >
            <option value="before">Before</option>
            <option value="after">After</option>
          </Input>
        </FormGroup>
        <FormGroup>
          <Label for="decimalSeparator">Decimal Separator</Label>
          <Input
            type="text"
            name="decimalSeparator"
            id="decimalSeparator"
            value={formData.decimalSeparator}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="thousandSeparator">Thousand Separator</Label>
          <Input
            type="text"
            name="thousandSeparator"
            id="thousandSeparator"
            value={formData.thousandSeparator}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="precision">Precision</Label>
          <Input
            type="number"
            name="precision"
            id="precision"
            value={formData.precision}
            min="0"
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <Label for="zeroFormat">Zero Format</Label>
          <Input
            type="select"
            name="zeroFormat"
            id="zeroFormat"
            value={formData.zeroFormat}
            onChange={handleChange}
          >
            <option value="hide">Hide</option>
            <option value="show">Show</option>
          </Input>
        </FormGroup>
        <FormGroup>
          <Label for="active">Active</Label>
          <Switch
            checked={formData.active}
            onChange={handleSwitchChange}
            onColor="#86d3ff"
            offColor="#888"
            onHandleColor="#002395"
            offHandleColor="#d4d4d4"
            handleDiameter={15}
            uncheckedIcon={false}
            checkedIcon={false}
            height={10}
            width={30}
            className="react-switch"
          />
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleSubmit}>Save Changes</Button>
        <Button color="secondary" onClick={toggle}>Cancel</Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditCurrencyModal;
