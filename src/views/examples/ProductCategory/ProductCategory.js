import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import ElementHeader from 'components/Headers/ElementHeader';
import { Button, Card, CardFooter, CardHeader, Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Input, Pagination, PaginationItem, PaginationLink, Row, Table } from 'reactstrap';
import AddProductCategoryModal from './AddProductCategory';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ConfirmDeleteModal from './ConfirmDeleteModal'
import DisplayCategory from "./DisplayCategoryModal"
import EditCategoryModal from "./EditCategoryModal"

const decodeToken = (token) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return payload;
};

function ProductCategory() {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [categoriesPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [displayModalOpen, setDisplayModalOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);





    const token = localStorage.getItem('token');
    const decodedToken = token ? decodeToken(token) : {};
    const currentUserId = decodedToken.AdminID;

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/category`, {
                params: { createdBy: currentUserId }
            });
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
            setError("Error fetching categories");
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const refreshCategories = () => {
        fetchCategories();
    }

    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const indexOfLastCategory = currentPage * categoriesPerPage;
    const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
    const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleSearchChange = (e) => setSearchQuery(e.target.value);



    const toggleModal = () => setModalOpen(!modalOpen);
    const toggleDropdown = (id) => setDropdownOpen(dropdownOpen === id ? null : id);
    const toggleDeleteModal = () => setDeleteModalOpen(!deleteModalOpen);
    const toggleDisplayModal = () => {
        setDisplayModalOpen(!displayModalOpen);
    };
    const toggleEditModal = () => {
        setEditModalOpen(!editModalOpen);
    };

    const handleDeleteClick = (id) => {
        setCategoryToDelete(id);
        toggleDeleteModal();
    };
    const handleDisplayClick = (category) => {
        setSelectedCategory(category);
        toggleDisplayModal();
    };
    const handleEditClick = (category) => {
        setSelectedCategory(category);
        setCategoryToEdit(category);
        toggleEditModal();
    };


    const confirmDeleteCategory = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/category/${categoryToDelete}`);

            refreshCategories();

            toggleDeleteModal();
            toast.success('Category deleted successfully', {
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } catch (error) {
            console.error("Error deleting Category:", error);
            toast.error('Error deleting category', {
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
        <>
            <ToastContainer />
            <ElementHeader />
            <Container className="mt--7" fluid>
                <Row>
                    <div className="col">
                        <Card className="shadow border-0">
                            <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                                <h3 className="mb-0">Categories List</h3>
                                <div className="d-flex">
                                    <Input
                                        type="text"
                                        placeholder="Search"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        className="mr-3"
                                    />
                                    <Button color="primary" onClick={toggleModal}>Add new category</Button>
                                </div>
                            </CardHeader>
                            <Table className="align-items-center table-flush" responsive>
                                <thead className="thead-light">
                                    <tr>
                                        <th scope="col">Name</th>
                                        <th scope="col">Description</th>
                                        <th scope="col">Color</th>
                                        <th scope="col">Enabled</th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentCategories.map((category) => (
                                        <tr key={category._id}>
                                            <td>{category.name}</td>
                                            <td style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word', maxWidth: '300px' }}>
                                                {category.description}
                                            </td>
                                            <td>{category.color}</td>
                                            <td>{category.enabled ? 'Yes' : 'No'}</td>
                                            <td>
                                                <Dropdown isOpen={dropdownOpen === category._id} toggle={() => toggleDropdown(category._id)}>
                                                    <DropdownToggle tag="span" data-toggle="dropdown" style={{ cursor: 'pointer' }}>
                                                        <FontAwesomeIcon icon={faEllipsisH} style={{ fontSize: '1rem' }} />
                                                    </DropdownToggle>
                                                    <DropdownMenu right style={{ marginTop: "-25px" }}>
                                                        <DropdownItem onClick={() => handleDisplayClick(category)}>
                                                            <span className="d-flex align-items-center">
                                                                <i className="fa-solid fa-eye" style={{ fontSize: '1rem', marginRight: '10px' }}></i>
                                                                Display
                                                            </span>
                                                        </DropdownItem>
                                                        <DropdownItem onClick={() => handleEditClick(category)}>
                                                            <span className="d-flex align-items-center">
                                                                <i className="fa-solid fa-gear" style={{ fontSize: '1rem', marginRight: '10px' }}></i>
                                                                Edit
                                                            </span>
                                                        </DropdownItem>
                                                        <DropdownItem divider />
                                                        <DropdownItem onClick={() => handleDeleteClick(category._id)}>
                                                            <span className="d-flex align-items-center">
                                                                <i className="fa-solid fa-trash text-danger" style={{ fontSize: '1rem', marginRight: '10px' }}></i>
                                                                Delete
                                                            </span>
                                                        </DropdownItem>
                                                    </DropdownMenu>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

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
                                    {[...Array(Math.ceil(filteredCategories.length / categoriesPerPage))].map((_, index) => (
                                        <PaginationItem key={index + 1} active={currentPage === index + 1}>
                                            <PaginationLink
                                                href="#pablo"
                                                onClick={(e) => { e.preventDefault(); paginate(index + 1); }}
                                            >
                                                {index + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem disabled={currentPage === Math.ceil(filteredCategories.length / categoriesPerPage)}>
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
            <AddProductCategoryModal
                isOpen={modalOpen}
                toggle={toggleModal}
                userId={currentUserId}
                refreshCategories={refreshCategories}
            />

            {selectedCategory && (
                <EditCategoryModal
                    isOpen={editModalOpen}
                    toggle={toggleEditModal}
                    category={selectedCategory}
                    refreshCategories={refreshCategories}
                    userId={currentUserId}
                />
            )}

            <ConfirmDeleteModal
                isOpen={deleteModalOpen}
                toggle={toggleDeleteModal}
                onConfirm={confirmDeleteCategory}
            />

            {selectedCategory && (
                <DisplayCategory
                    isOpen={displayModalOpen}
                    toggle={toggleDisplayModal}
                    category={selectedCategory}
                />
            )}
        </>
    );
}

export default ProductCategory;
