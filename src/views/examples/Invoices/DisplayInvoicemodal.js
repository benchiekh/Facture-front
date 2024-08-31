import React from 'react';
import { Modal, ModalBody, Button, Badge, Table } from 'reactstrap';
import axios from 'axios';
import "./style.css"

const DisplayInvoiceModal = ({ isOpen, toggle, invoice, clients }) => {

    const getClientNameById = (clientId) => {
        const client = clients.find(client => client._id === clientId);
        if (!client) return 'Client not found';
    
        if (client.type === 'Person' && client.person) {
            return `${client.person.prenom} ${client.person.nom}`;
        } else if (client.type === 'Company' && client.entreprise) {
            return client.entreprise.name; 
        } else {
            return 'Client type not recognized';
        }
    };

    const getClientEmailById = (clientId) => {
        const client = clients.find(client => client._id === clientId);
        if (!client) return 'Client not found';
    
        if (client.type === 'Person' && client.person) {
            return `${client.person.email}`;
        } else if (client.type === 'Company' && client.entreprise) {
            return client.entreprise.email; 
        } else {
            return 'Client type not recognized';
        }
    };

    const getClientPhoneById = (clientId) => {
        const client = clients.find(client => client._id === clientId);
        if (!client) return 'Client not found';
    
        if (client.type === 'Person' && client.person) {
            return `${client.person.telephone}`;
        } else if (client.type === 'Company' && client.entreprise) {
            return client.entreprise.telephone; 
        } else {
            return 'Client type not recognized';
        }
    };

    const handleDownloadPDF = async () => {
      console.log(invoice._id);
  
      try {
          const response = await axios.get(`http://localhost:5000/api/invoices/export-pdf/${invoice._id}/${invoice.createdBy}`, {
              responseType: 'blob', 
          });
  
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `invoice-${invoice.number}.pdf`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } catch (error) {
          console.error('Error downloading PDF:', error);
          alert('Error downloading PDF. Please try again.');
      }
  };
  

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalBody>
                <div className="invoice-header">
                    <h4>Facture # {invoice.number}/{invoice.year}</h4>
                    <div className="status-badges">
                        {/* <Badge color="success">Envoyé</Badge> */}
                        <Badge color="danger">Impayé</Badge>
                    </div>
                    <div className="amounts-summary">
                        <div>Status: {invoice.status}</div>
                        <div>Sous-total: ${invoice.subtotal}</div>
                        <div>Total: ${invoice.total}</div>
                        {/* <div>Payé: ${invoice.paid}</div> */}
                    </div>
                </div>

                <div className="client-info">
                    <p><strong>Client:</strong> {getClientNameById(invoice.client)}</p>
                    <p><strong>Email:</strong> {getClientEmailById(invoice.client)}</p>
                    <p><strong>Téléphone:</strong> {getClientPhoneById(invoice.client)}</p>
                </div>

                <Table>
                    <thead>
                        <tr>
                            <th>Produit</th>
                            <th>description</th>

                            <th>Prix</th>
                            <th>Quantité</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item, index) => (
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
                    <p>Sous-total: ${invoice.subtotal}</p>
                    <p>Total des taxes ({invoice.taxRate}%): ${invoice.taxTotal}</p>
                    <p><strong>Total:</strong> ${invoice.total}</p>
                </div>

                <div className="action-buttons">
                    <Button color="secondary" onClick={toggle}>Fermer</Button>
                    <Button color="info" onClick={handleDownloadPDF}>Télécharger PDF</Button>
                    <Button color="primary">Envoyer par email</Button>
                    <Button color="primary">Modifier</Button>
                </div>
            </ModalBody>
        </Modal>
    );
}

export default DisplayInvoiceModal;