import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faTag, faFont, faExchangeAlt, faHashtag } from '@fortawesome/free-solid-svg-icons';

const AddCurrency = ({ isOpen, toggle, refreshCurrencies, userId }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [symbol, setSymbol] = useState('');
  const [symbolPosition, setSymbolPosition] = useState('before');
  const [decimalSeparator, setDecimalSeparator] = useState('.');
  const [thousandSeparator, setThousandSeparator] = useState(',');
  const [precision, setPrecision] = useState(2);
  const [zeroFormat, setZeroFormat] = useState('show');
  const [active, setActive] = useState(true);

  const handleAddCurrency = async () => {
    try {
      const newCurrency = {
        name,
        code,
        symbol,
        symbolPosition,
        decimalSeparator,
        thousandSeparator,
        precision,
        zeroFormat,
        active,
        createdBy: userId,
      };

      const response = await axios.post('http://localhost:5000/api/currency', newCurrency, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      refreshCurrencies();
      toggle();
      toast.success('Currency added successfully');
    } catch (error) {
      console.error("Error adding currency:", error);

      if (error.response) {
        toast.error(`Error: ${error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        toast.error('No response received from the server.');
      } else {
        toast.error('An error occurred while adding the currency.');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="modal-right">
      <ModalHeader toggle={toggle}>Add New Currency</ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="currencyName">Name</Label>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <FontAwesomeIcon icon={faTag} />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                type="text"
                id="currencyName"
                value={name}
                placeholder="Enter currency name"
                onChange={(e) => setName(e.target.value)}
              />
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <Label for="currencyCode">Code</Label>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <FontAwesomeIcon icon={faFont} />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                type="text"
                id="currencyCode"
                value={code}
                placeholder="Enter currency code (e.g., USD)"
                onChange={(e) => setCode(e.target.value.toUpperCase())} // Ensure code is uppercase
              />
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <Label for="currencySymbol">Symbol</Label>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <FontAwesomeIcon icon={faDollarSign} />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                type="text"
                id="currencySymbol"
                value={symbol}
                placeholder="Enter currency symbol (e.g., $)"
                onChange={(e) => setSymbol(e.target.value)}
              />
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <Label for="currencySymbolPosition">Symbol Position</Label>
            <Input
              type="select"
              id="currencySymbolPosition"
              value={symbolPosition}
              onChange={(e) => setSymbolPosition(e.target.value)}
            >
              <option value="before">Before</option>
              <option value="after">After</option>
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="currencyDecimalSeparator">Decimal Separator</Label>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <FontAwesomeIcon icon={faExchangeAlt} />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                type="text"
                id="currencyDecimalSeparator"
                value={decimalSeparator}
                placeholder="Enter decimal separator (e.g., .)"
                onChange={(e) => setDecimalSeparator(e.target.value)}
              />
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <Label for="currencyThousandSeparator">Thousand Separator</Label>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <FontAwesomeIcon icon={faHashtag} />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                type="text"
                id="currencyThousandSeparator"
                value={thousandSeparator}
                placeholder="Enter thousand separator (e.g., ,)"
                onChange={(e) => setThousandSeparator(e.target.value)}
              />
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <Label for="currencyPrecision">Precision</Label>
            <Input
              type="number"
              id="currencyPrecision"
              value={precision}
              min="0"
              placeholder="Enter number of decimal places"
              onChange={(e) => setPrecision(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="currencyZeroFormat">Zero Format</Label>
            <Input
              type="select"
              id="currencyZeroFormat"
              value={zeroFormat}
              onChange={(e) => setZeroFormat(e.target.value)}
            >
              <option value="hide">Hide</option>
              <option value="show">Show</option>
            </Input>
          </FormGroup>
          <FormGroup check>
            <Label check>
              <Input
                type="checkbox"
                id="currencyActive"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              {' '}
              Active
            </Label>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleAddCurrency}>Add Currency</Button>{' '}
        <Button color="secondary" onClick={toggle}>Cancel</Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddCurrency;
