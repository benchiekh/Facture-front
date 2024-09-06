import React from 'react';
import { Modal, ModalHeader, ModalBody, Button, Table, Badge } from 'reactstrap';

const DetailModal = ({ isOpen, toggle, payment, invoice }) => {
    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>
                Payment Detail for Invoice #{invoice.number}/{invoice.year}
            </ModalHeader>
            <ModalBody>
                <div className="invoice-detail-header">
                    <h4>Payment #{payment.number}/{payment.year}</h4>
                    <div className="status-summary">
                        <div><strong>Status:</strong> {payment.status}</div>
                        <div><strong>Paid Amount:</strong> ${payment.amountPaid}</div>
                        <div><strong>Subtotal:</strong> ${payment.subtotal}</div>
                        <div><strong>Total:</strong> ${payment.total}</div>
                    </div>
                </div>

                <div className="client-info">
                    <p><strong>Client:</strong> {invoice.client.name}</p>
                    <p><strong>Email:</strong> {invoice.client.email}</p>
                    <p><strong>Phone:</strong> {invoice.client.phone}</p>
                </div>

                <div className="payment-summary">
                    <p><strong>Amount Paid:</strong> ${payment.amountPaid}</p>
                    <p><strong>Total Paid:</strong> ${payment.totalPaid}</p>
                    <p><strong>Total Remaining:</strong> ${payment.totalRemaining}</p>
                </div>

                <Table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item, index) => (
                            <tr key={index}>
                                <td>{item.name}</td>
                                <td>{item.description}</td>
                                <td>${item.price}</td>
                                <td>{item.quantity}</td>
                                <td>${item.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                <div className="action-buttons">
                    <Button color="secondary" onClick={toggle}>Close</Button>
                </div>
            </ModalBody>
        </Modal>
    );
};

export default DetailModal;
