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
    Label
} from "reactstrap";
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';

const EditProductModal = ({ isOpen, toggle, product, refreshProducts, refreshCategories, categories }) => {
    const [name, setName] = useState("");
    const [category, setCategory] = useState(null); 
    const [currency, setCurrency] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [reference, setReference] = useState("");

    useEffect(() => {
        if (product) {
            setName(product.name);
            setCategory(categories.find(cat => cat._id === product.productCategory._id));
            setCurrency(product.currency);
            setPrice(product.price);
            setDescription(product.description);
            setReference(product.reference);
        }
    }, [product, categories]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const updatedProduct = {
            name,
            productCategory: category ? category.value : '',
            currency,
            price,
            description,
            reference
        };

        try {
            await axios.put(`http://localhost:5000/api/product/${product._id}`, updatedProduct);
            refreshProducts();
            refreshCategories();
            toggle();
            toast.success('Product updated successfully');
        } catch (error) {
            console.error("Error updating product:", error);
            toast.error('Error updating product. Please try again.');
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} className="modal-right">
           
                    <ModalHeader toggle={toggle}>Edit Product</ModalHeader>
                    <Form onSubmit={handleSubmit}>
                        <ModalBody>
                            <FormGroup>
                                <Label for="name">Name</Label>
                                <Input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="category">Category</Label>
                                <Select
                                    options={categories.map(cat => ({ value: cat._id, label: cat.name }))}
                                    value={category} // Display the current category
                                    onChange={(selectedOption) => setCategory(selectedOption)}
                                    placeholder="Select category"
                                    isClearable={false} // Prevent clearing of selection
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="currency">Currency</Label>
                                <Input
                                    type="text"
                                    id="currency"
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="price">Price</Label>
                                <Input
                                    type="number"
                                    id="price"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="description">Description</Label>
                                <Input
                                    type="text"
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="reference">Reference</Label>
                                <Input
                                    type="text"
                                    id="reference"
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
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

export default EditProductModal;
