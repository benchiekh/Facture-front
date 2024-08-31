import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Button,
    Card,
    CardHeader,
    Input,
    Table,
    Container,
    Row,
    Dropdown,
    DropdownMenu,
    DropdownItem,
    DropdownToggle,
    Pagination,
    PaginationItem,
    PaginationLink,
    CardFooter,
} from "reactstrap";
import Header from "components/Headers/ElementHeader";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import DisplayInvoiceModal from "../Invoices/DisplayInvoicemodal";
import AddInvoiceModal from "../Invoices/AddInvoiceModal";
import EditInvoiceModal from "./EditInvoiceModal";

import ConfirmDeleteModal from "./ConfirmDeleteModal"

const decodeToken = (token) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return payload;
};

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState([]);

    const [clients, setClients] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [invoicesPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [displayModalOpen, setDisplayModalOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [invoiceToEdit, setInvoiceToEdit] = useState(null);


    const token = localStorage.getItem('token');
    const decodedToken = token ? decodeToken(token) : {};
    const currentUserId = decodedToken.AdminID;
    const username = decodedToken.name
    const userlastname = decodedToken.surname



    const fetchInvoices = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/invoices?createdBy=${currentUserId}`);
            console.log(response.data)
            setInvoices(response.data);
        } catch (error) {
            console.error("Error fetching invoices:", error);
        }
    };
    const refreshInvoices = () => {
        fetchInvoices();
    };
    const fetchClients = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/client', {
                params: { createdBy: currentUserId }
            });

            setClients(response.data);
            console.log("les clients cree par moi " + clients)

        } catch (err) {

            toast.error('Failed to fetch clients');
        }
    };

    const getClientNameById = (clientId) => {
        const client = clients.find(client => client._id === clientId);
        if (!client) return 'Client not found';

        if (client.type === 'Person' && client.person) {
            return `${client.person.prenom} ${client.person.nom}`;
        } else if (client.type === 'Company' && client.entreprise) {
            return client.entreprise.nom;
        } else {
            return 'Client type not recognized';
        }
    };

    useEffect(() => {
        fetchInvoices();
        fetchClients();
    }, []);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };
    const handleDeleteClick = (id) => {
        setInvoiceToDelete(id);
        toggleDeleteModal();
    };
    const confirmDeleteInvoice = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/invoices/${invoiceToDelete}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            refreshInvoices();
            toggleDeleteModal();
            toast.success('Invoice deleted successfully', {
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } catch (error) {
            console.error("Error deleting currency:", error);
        }
    };

    const filteredInvoices = invoices.filter((invoice) => {
        return (
            invoice?.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice?.number?.toString().includes(searchQuery) ||
            invoice?.currency?.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice?.status?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });


    const indexOfLastInvoice = currentPage * invoicesPerPage;
    const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
    const currentInvoices = filteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const toggleDropdown = (id) => {
        setDropdownOpen(dropdownOpen === id ? null : id);
    };

    const toggleDisplayModal = () => {
        setDisplayModalOpen(!displayModalOpen);
    };
    const handleDisplayClick = (invoice) => {
        setSelectedInvoice(invoice);
        toggleDisplayModal();
    };
    const toggleModal = () => {
        setModalOpen(!modalOpen);
    };
    const toggleDeleteModal = () => {
        setDeleteModalOpen(!deleteModalOpen);
    };
    const toggleEditModal = () => {
        setEditModalOpen(!editModalOpen);
    };

    const handleEditClick = (invoice) => {
        setSelectedInvoice(invoice);
        setInvoiceToEdit(invoice);
        toggleEditModal();
    };


    return (
        <>
            <ToastContainer />
            <Header />
            <Container className="mt--7" fluid >
                <Row>
                    <div className="col">
                        <Card className="shadow" >
                            <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                                <h3 className="mb-0">Invoices list</h3>
                                <div className="d-flex">
                                    <Input
                                        type="text"
                                        placeholder="Search"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        className="mr-3"
                                    />
                                    <Button color="primary" onClick={toggleModal}>Add new invoice</Button>
                                </div>
                            </CardHeader>
                            <div className="table-wrapper">
                                <Table className="align-items-center table-flush" responsive>
                                    <thead className="thead-light">
                                        <tr>
                                            <th scope="col">Invoice Number</th>
                                            <th scope="col">Client</th>
                                            <th scope="col">Date</th>
                                            <th scope="col">Expiration Date</th>
                                            <th scope="col">Total</th>
                                            <th scope="col">Status</th>
                                            <th scope="col">Créer par</th>

                                            <th scope="col"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentInvoices.length > 0 ? (
                                            currentInvoices.map((invoice) => (
                                                <tr key={invoice._id}>
                                                    <td>{invoice.number}</td>
                                                    <td>{getClientNameById(invoice.client)}</td>
                                                    <td>{new Date(invoice.date).toLocaleDateString()}</td>
                                                    <td>{new Date(invoice.expirationDate).toLocaleDateString()}</td>
                                                    <td>{invoice.total}</td>
                                                    <td>{invoice.status}</td>
                                                    <td>{username + " " + userlastname}</td>

                                                    <td>
                                                        <Dropdown isOpen={dropdownOpen === invoice._id} toggle={() => toggleDropdown(invoice._id)} >
                                                            <DropdownToggle tag="span" data-toggle="dropdown" style={{ cursor: 'pointer' }}>
                                                                <FontAwesomeIcon icon={faEllipsisH} style={{ fontSize: '1rem' }} />
                                                            </DropdownToggle>
                                                            <DropdownMenu right style={{ marginTop: "-25px" }}>
                                                                <DropdownItem onClick={() => { handleDisplayClick(invoice) }}>
                                                                    <span className="d-flex align-items-center">
                                                                        <i className="fa-solid fa-eye" style={{ fontSize: '1rem', marginRight: '10px' }}></i>
                                                                        Display
                                                                    </span>
                                                                </DropdownItem>
                                                                <DropdownItem onClick={() => handleEditClick(invoice)}>
                                                                    <span className="d-flex align-items-center">
                                                                        <i className="fa-solid fa-gear" style={{ fontSize: '1rem', marginRight: '10px' }}></i>
                                                                        Edit
                                                                    </span>
                                                                </DropdownItem>
                                                                <DropdownItem divider />
                                                                <DropdownItem onClick={() => handleDeleteClick(invoice._id)}>
                                                                    <span className="d-flex align-items-center">
                                                                        <i className="fa-solid fa-trash text-danger" style={{ fontSize: '1rem', marginRight: '10px' }}></i>
                                                                        Delete
                                                                    </span>
                                                                </DropdownItem>
                                                            </DropdownMenu>
                                                        </Dropdown>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6">
                                                    <div style={{ textAlign: 'center' }}>
                                                        <i className="fa-solid fa-ban" style={{ display: 'block', marginBottom: '10px', fontSize: '50px', opacity: '0.5' }}></i>
                                                        No invoices found
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>

                                </Table>
                            </div>
                            <CardFooter className="py-4">
                                <nav aria-label="...">
                                    <Pagination className="pagination justify-content-end mb-0">
                                        {[...Array(Math.ceil(filteredInvoices.length / invoicesPerPage)).keys()].map((pageNumber) => (
                                            <PaginationItem key={pageNumber + 1} active={currentPage === pageNumber + 1}>
                                                <PaginationLink onClick={() => paginate(pageNumber + 1)}>
                                                    {pageNumber + 1}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}
                                    </Pagination>
                                </nav>
                            </CardFooter>
                        </Card>
                    </div>
                </Row>
            </Container>
            <AddInvoiceModal
                isOpen={modalOpen}
                toggle={toggleModal}
                refreshInvoices={fetchInvoices}
                userId={currentUserId}
            />
             <ConfirmDeleteModal
                isOpen={deleteModalOpen}
                toggle={toggleDeleteModal}
                onConfirm={confirmDeleteInvoice}
            />

            {displayModalOpen && (
                <DisplayInvoiceModal
                    isOpen={displayModalOpen}
                    toggle={toggleDisplayModal}
                    invoice={selectedInvoice}
                    clients={clients}

                />
            )}
             {editModalOpen && (
                <EditInvoiceModal
                    isOpen={editModalOpen}
                    toggle={toggleEditModal}
                    invoiceData={invoiceToEdit}
                    refreshInvoices={refreshInvoices}
                    userId={currentUserId}

                />
            )}
        </>
    );
};

export default Invoices;