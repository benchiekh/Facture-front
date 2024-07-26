import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import ElementHeader from 'components/Headers/ElementHeader';
import AddClientModal from "./AddClientModal";
import EditClientModal from "./EditClientModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import countryList from 'react-select-country-list';
import { Button, Card, CardFooter, CardHeader, Container, Input, Pagination, PaginationItem, PaginationLink, Row, Table } from 'reactstrap';
import { Rings } from 'react-loader-spinner'; // Import the loader spinner component

const decodeToken = (token) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return payload;
};

function Clients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [clientPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [companyToDelete, setCompanyToDelete] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [clientToEdit, setClientToEdit] = useState(null);

    const token = localStorage.getItem('token');
    const decodedToken = token ? decodeToken(token) : {};
    const currentUserId = decodedToken.AdminID;

    const adminId = currentUserId;

    // Get the list of countries
    const countries = countryList().getData();
    const countryOptions = countries.reduce((acc, country) => {
        acc[country.value] = country.label;
        return acc;
    }, {});

    const fetchClients = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/client', {
                params: { createdBy: adminId }
            });
            setClients(response.data);
        } catch (err) {
            setError(err.message);
            toast.error('Failed to fetch clients');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, [adminId]);

    const refreshClients = () => {
        fetchClients();
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Rings
                    height="80"
                    width="80"
                    color="#4fa94d"
                    radius="6"
                    wrapperStyle={{}}
                    wrapperClass=""
                    visible={true}
                    ariaLabel="rings-loading"
                />
            </div>
        );
    }
    if (error) return <p>Error: {error}</p>;

    const filteredClients = clients.filter((client) =>
        (client.person && client.person.prenom.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (client.person && client.person.nom.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (client.entreprise && client.entreprise.pays.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (client.person && client.person.telephone.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (client.person && client.person.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const indexOfLastClient = currentPage * clientPerPage;
    const indexOfFirstClient = indexOfLastClient - clientPerPage;
    const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const toggleModal = () => {
        setModalOpen(!modalOpen);
    };

    const toggleDeleteModal = () => {
        setDeleteModalOpen(!deleteModalOpen);
    };

    const handleDeleteClick = (id) => {
        setCompanyToDelete(id);
        toggleDeleteModal();
    };

    const confirmDeleteCompany = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/client/${companyToDelete}`);
            refreshClients();
            toggleDeleteModal();
            toast.success('Company deleted successfully', {
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } catch (error) {
            console.error("Error deleting company:", error);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const toggleEditModal = () => {
        setEditModalOpen(!editModalOpen);
    };

    const handleEditClick = (client) => {
        setClientToEdit(client);
        toggleEditModal();
    };

    return (
        <>
            <ToastContainer />
            <ElementHeader />
            <Container className="mt--7" fluid>
                <Row>
                    <div className="col">
                        <Card className="shadow border-0">
                            <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                                <h3 className="mb-0">Clients List</h3>
                                <div className="d-flex">
                                    <Input
                                        type="text"
                                        placeholder="Search"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        className="mr-3"
                                    />
                                    <Button color="primary" onClick={toggleModal}>Add new client</Button>
                                </div>
                            </CardHeader>
                            <Table className="align-items-center table-flush" responsive>
                                <thead className="thead-light">
                                    <tr>
                                        <th scope="col">Type</th>
                                        <th scope="col">Full name</th>
                                        <th scope="col">Country</th>
                                        <th scope="col">Tel</th>
                                        <th scope="col">Email</th>
                                        <th scope="col">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentClients.length > 0 ? (
                                        currentClients.map(client => (
                                            <tr key={client._id}>
                                                <td>
                                                    <span style={{
                                                        padding: '5px 10px',
                                                        borderRadius: '10px',
                                                        color: client.type === 'Person' ? '#0047AB' : '#097969',
                                                        backgroundColor: client.type === 'Person' ? '#89CFF0' : '#AFE1AF',
                                                        textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fff',

                                                    }}>
                                                        {client.type}
                                                    </span>
                                                </td>
                                                <td>
                                                    {client.type === 'Person' && client.person ? client.person.prenom + ' ' + client.person.nom : client.type === 'Company' && client.entreprise ? client.entreprise.nom : 'N/A'}
                                                </td>
                                                <td>
                                                    {client.type === 'Company' && client.entreprise ? countryOptions[client.entreprise.pays] :  client.type === 'Person' && client.person ? client.person.pays : 'N/A'}
                                                </td>
                                                <td>
                                                    {client.type === 'Person' && client.person ? client.person.telephone : client.type === 'Company' && client.entreprise ? client.entreprise.telephone : 'N/A'}
                                                </td>
                                                <td>
                                                    {client.type === 'Person' && client.person ? client.person.email : client.type === 'Company' && client.entreprise ? client.entreprise.email : 'N/A'}
                                                </td>
                                                <td>
                                                    <span className="ni ni-settings-gear-65 text-primary" style={{ fontSize: '1.5rem', marginRight: '10px', cursor: 'pointer' }} onClick={() => handleEditClick(client)}></span>
                                                    <span className="ni ni-fat-remove text-danger" style={{ fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => handleDeleteClick(client._id)}></span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center text-danger">No matching records found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>

                            <ConfirmDeleteModal
                                isOpen={deleteModalOpen}
                                toggle={toggleDeleteModal}
                                onConfirm={confirmDeleteCompany}
                            />

                            <EditClientModal
                                isOpen={editModalOpen}
                                toggle={toggleEditModal}
                                client={clientToEdit}
                                refreshClients={refreshClients}
                                userId={currentUserId}
                            />

                            <CardFooter className="py-4">
                                <Pagination className="pagination justify-content-end mb-0" listClassName="justify-content-end">
                                    <PaginationItem disabled={currentPage === 1}>
                                        <PaginationLink
                                            href="#pablo"
                                            onClick={(e) => { e.preventDefault(); paginate(currentPage - 1); }}
                                        >
                                            <i className="fas fa-chevron-left" />
                                            <span className="sr-only">Previous</span>
                                        </PaginationLink>
                                    </PaginationItem>
                                    {[...Array(Math.ceil(filteredClients.length / clientPerPage))].map((_, index) => (
                                        <PaginationItem key={index + 1} active={currentPage === index + 1}>
                                            <PaginationLink
                                                href="#pablo"
                                                onClick={(e) => { e.preventDefault(); paginate(index + 1); }}
                                            >
                                                {index + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem disabled={currentPage === Math.ceil(filteredClients.length / clientPerPage)}>
                                        <PaginationLink
                                            href="#pablo"
                                            onClick={(e) => { e.preventDefault(); paginate(currentPage + 1); }}
                                        >
                                            <i className="fas fa-chevron-right" />
                                            <span className="sr-only">Next</span>
                                        </PaginationLink>
                                    </PaginationItem>
                                </Pagination>
                            </CardFooter>
                        </Card>
                    </div>
                </Row>
            </Container>
            <AddClientModal
                isOpen={modalOpen}
                toggle={toggleModal}
                refreshClients={refreshClients}
                userId={currentUserId}
            />
        </>
    );
}

export default Clients;
