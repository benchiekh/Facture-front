import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  Container,
  Input,
  Pagination,
  PaginationItem,
  PaginationLink,
  Row,
  Table
} from "reactstrap";
import ElementHeader from "components/Headers/ElementHeader";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import AddCompanyModal from "./AddCompanyModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import EditCompanyModal from "./EditCompanyModal";
import countryList from 'react-select-country-list';
import { Rings } from 'react-loader-spinner'; // Import the loader spinner component

const decodeToken = (token) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const payload = JSON.parse(atob(base64));
  return payload;
};

const Company = () => {
  const [companies, setCompanies] = useState([]);
  const [people, setPeople] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [companiesPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [buttonWidth, setButtonWidth] = useState('auto');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  const token = localStorage.getItem('token');
  const decodedToken = token ? decodeToken(token) : {};
  const currentUserId = decodedToken.AdminID;

  // Get the list of countries
  const countries = countryList().getData();
  const countryOptions = countries.reduce((acc, country) => {
    acc[country.value] = country.label;
    return acc;
  }, {});

  const fetchCompanies = async () => {
    setLoading(true); // Set loading to true before fetching
    try {
      const response = await axios.get("http://localhost:5000/api/entreprise");
      const filteredCompanies = response.data.filter(company => company.createdBy === currentUserId);
      setCompanies(filteredCompanies);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  const fetchPeople = async () => {
    setLoading(true); // Set loading to true before fetching
    try {
      const response = await axios.get("http://localhost:5000/api/people");
      setPeople(response.data.filter(person => person.createdBy === currentUserId));
    } catch (error) {
      console.error("Error fetching people:", error);
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchPeople();
  }, []);

  const refreshCompany = () => {
    fetchCompanies();
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const getMainContact = (companyId) => {
    const mainContacts = people.filter(person => person.entreprise === companyId);
    if (mainContacts.length === 0) {
      return <span style={{ color: 'red' }}>No main contacts available</span>;
    }
    return (
      <span style={{
        display: 'inline-block',
        backgroundColor: '#b3d7ff',
        color: '#0056b3',
        padding: '5px 10px',
        borderRadius: '5px',
        textAlign: 'center'
      }}>
        {mainContacts[0].prenom} {mainContacts[0].nom}
      </span>
    );
  };

  const filteredCompanies = companies.filter((company) =>
    (company.nom && company.nom.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (company.pays && company.pays.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (company.telephone && company.telephone.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (company.email && company.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 576) {
        setButtonWidth('100%');
      } else {
        setButtonWidth('auto');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Get current companies
  const indexOfLastCompany = currentPage * companiesPerPage;
  const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
  const currentCompanies = filteredCompanies.slice(indexOfFirstCompany, indexOfLastCompany);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Toggle modals
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
      await axios.delete(`http://localhost:5000/api/entreprise/${companyToDelete}`);
      refreshCompany();
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

  const toggleEditModal = () => {
    setEditModalOpen(!editModalOpen);
  };

  const handleEditClick = (company) => {
    setCompanyToEdit(company);
    toggleEditModal();
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

  return (
    <>
      <ToastContainer />
      <ElementHeader />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow border-0">
              <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Companies list</h3>
                <div className="d-flex">
                  <Input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="mr-3"
                  />
                  <Button color="primary" style={{ width: buttonWidth }} onClick={toggleModal}>Add new company</Button>
                </div>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Main Contact</th>
                    <th scope="col">Country</th>
                    <th scope="col">Tel</th>
                    <th scope="col">Email</th>
                    <th scope="col">Website</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCompanies.length > 0 ? (
                    currentCompanies.map((company) => (
                      <tr key={company._id}>
                        <td>{company.nom}</td>
                        <td>{getMainContact(company._id)}</td>
                        <td>{countryOptions[company.pays] || company.pays}</td> {/* Display full country name */}
                        <td>{company.telephone}</td>
                        <td>{company.email}</td>
                        <td><a target="_blank" href={company.siteweb}>{company.siteweb}</a></td>
                        <td>
                          <span className="ni ni-settings-gear-65 text-primary" style={{ fontSize: '1.5rem', marginRight: '10px', cursor: 'pointer' }} onClick={() => handleEditClick(company)}></span>
                          <span className="ni ni-fat-remove text-danger" style={{ fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => handleDeleteClick(company._id)}></span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center text-danger">No matching records found</td>
                    </tr>
                  )}
                </tbody>
              </Table>

              <ConfirmDeleteModal
                isOpen={deleteModalOpen}
                toggle={toggleDeleteModal}
                onConfirm={confirmDeleteCompany}
              />

              <EditCompanyModal
                isOpen={editModalOpen}
                toggle={toggleEditModal}
                company={companyToEdit}
                refreshCompany={refreshCompany}
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
                  {[...Array(Math.ceil(filteredCompanies.length / companiesPerPage))].map((_, index) => (
                    <PaginationItem key={index + 1} active={currentPage === index + 1}>
                      <PaginationLink
                        href="#pablo"
                        onClick={(e) => { e.preventDefault(); paginate(index + 1); }}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem disabled={currentPage === Math.ceil(filteredCompanies.length / companiesPerPage)}>
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
      <AddCompanyModal
        isOpen={modalOpen}
        toggle={toggleModal}
        refreshCompany={refreshCompany}
        userId={currentUserId}
      />
    </>
  );
};

export default Company;