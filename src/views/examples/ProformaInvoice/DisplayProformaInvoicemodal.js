import React, { useState } from 'react';
import { Modal, ModalBody, Button, Badge, Table, Spinner } from 'reactstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./style.css";

const DisplayProformaInvoiceModal = ({ isOpen, toggle, proformaInvoice }) => {
    const [loading, setLoading] = useState(false); 

    const getBadgeColor = (status) => {
        switch (status) {
            case 'Paid':
                return 'success'; 
            case 'Sent':
                return 'info'; 
            case 'Draft':
                return 'secondary'; 
            case 'Unpaid':
                return 'danger'; 
            case 'Canceled':
                return 'warning'; 
            default:
                return 'light'; 
        }
    };

    const handleDownloadPDF = async () => {
        console.log('Downloading PDF for proforma invoice:', proformaInvoice);
    
        try {
            const response = await axios.get(`http://localhost:5000/api/invoices/export-pdf/${proformaInvoice._id}/${proformaInvoice.createdBy}`, {
                responseType: 'blob', 
            });
    
            if (response.status === 200) {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `proforma-invoice-${proformaInvoice.number}.pdf`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                console.error('Failed to download PDF. Status:', response.status);
                toast.error('Failed to download PDF. Please try again.');
            }
        } catch (error) {
            console.error('Error downloading PDF:', error);
            toast.error('Error downloading PDF. Please try again.');
        }
    };

    const handleSendEmail = async () => {
        setLoading(true); 
        console.log('Sending proforma invoice via email...');

        try {
            const response = await axios.get(`http://localhost:5000/api/invoices/export-pdf/send-email/${proformaInvoice._id}/${proformaInvoice.createdBy}`);
            if (response.status === 200) {
                toast.success('Proforma invoice sent via email successfully.');
            } else {
                toast.error('Failed to send the proforma invoice. Please try again.');
            }
        } catch (error) {
            console.error('Error sending proforma invoice via email:', error);
            toast.error('Error sending proforma invoice via email. Please try again.');
        } finally {
            setLoading(false); 
        }
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalBody>
                <div className="invoice-header">
                    <h4>Proforma Facture # {proformaInvoice.number}/{proformaInvoice.year}</h4>
                    <div className="status-badges">
                        <Badge color={getBadgeColor(proformaInvoice.status)}>{proformaInvoice.status}</Badge>
                    </div>
                    <div className="amounts-summary">
                        <div>Status: {proformaInvoice.status}</div>
                        <div>Sous-total: ${proformaInvoice.subtotal}</div>
                        <div>Total: ${proformaInvoice.total}</div>
                    </div>
                </div>

                <div className="client-info">
                    <p><strong>Client:</strong> {proformaInvoice.client.person.nom} {proformaInvoice.client.person.prenom}</p>
                    <p><strong>Email:</strong> {proformaInvoice.client.person.email}</p>
                    <p><strong>Téléphone:</strong> {proformaInvoice.client.person.telephone}</p>
                </div>

                <Table>
                    <thead>
                        <tr>
                            <th>Produit</th>
                            <th>Description</th>
                            <th>Prix</th>
                            <th>Quantité</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {proformaInvoice.items.map((item, index) => (
                            <tr key={index}>
                                <td>{item.article}</td>
                                <td>{item.description}</td>
                                <td>${item.price}</td>
                                <td>{item.quantity}</td>
                                <td>${item.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                <div className="totals-section">
                    <p>Sous-total: ${proformaInvoice.subtotal}</p>
                    <p>Total des taxes ({proformaInvoice.tax.value}%): ${proformaInvoice.taxAmount}</p>
                    <p><strong>Total:</strong> ${proformaInvoice.total}</p>
                </div>

                <div className="action-buttons">
                    <Button color="secondary" onClick={toggle}>Close</Button>
                    <Button color="info" onClick={handleDownloadPDF}>Download PDF</Button>
                    <Button color="warning" >Convert to invoice</Button>

                    <Button color="primary" onClick={handleSendEmail} disabled={loading}>
                        {loading ? (
                            <>
                                <Spinner size="sm" /> Sending...
                            </>
                        ) : (
                            'Send by email'
                        )}
                    </Button>
                </div>
            </ModalBody>
        </Modal>
    );
};

export default DisplayProformaInvoiceModal;
