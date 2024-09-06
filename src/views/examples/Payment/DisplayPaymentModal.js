import React, { useState, useEffect } from 'react';
import {
    Modal, ModalHeader, ModalBody, ModalFooter,
    Button, Table
} from 'reactstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const DisplayPaymentModal = ({ isOpen, toggle, invoice }) => {
    const [payments, setPayments] = useState([]);
    const [noPayments, setNoPayments] = useState(false);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/payments/${invoice._id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.data.length === 0) {
                    setNoPayments(true);
                } else {
                    setNoPayments(false);
                }
                
                setPayments(response.data);
            } catch (error) {
                if (error.response?.status === 404) {
                    setNoPayments(true);
                } else {
                    console.error("Error fetching payment history:", error);
                    toast.error('Failed to fetch payment history');
                }
            }
        };

        if (invoice?._id) {
            fetchPayments();
        }
    }, [invoice]);

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>
                Payment History for Invoice # {invoice.number}
            </ModalHeader>
            <ModalBody>
                {noPayments ? (
                    <div style={{ textAlign: 'center' }}>
                        <i className="fa-solid fa-ban" style={{ display: 'block', marginBottom: '10px', fontSize: '50px', opacity: '0.5' }}></i>
                        No payment history found
                    </div>
                ) : (
                    payments.length > 0 ? (
                        <Table responsive>
                            <thead>
                                <tr>
                                    <th>Amount Paid</th>
                                    <th>Payment Method</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map(payment => (
                                    <tr key={payment._id}>
                                        <td>{payment.amountPaid} $</td>
                                        <td>{payment.paymentMethod}</td>
                                        <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <i className="fa-solid fa-ban" style={{ display: 'block', marginBottom: '10px', fontSize: '50px', opacity: '0.5' }}></i>
                            No payment history found
                        </div>
                    )
                )}
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle}>Close</Button>
            </ModalFooter>
        </Modal>
    );
};

export default DisplayPaymentModal;
