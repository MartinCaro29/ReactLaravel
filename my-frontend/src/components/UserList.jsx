import React, { useEffect, useState, useRef } from 'react';
import { Container, Button, Modal, Form, Alert, Spinner, Badge, Card, Row, Col } from 'react-bootstrap';
import { useAuth } from './AuthContext';
import api from '../api';
import Navigation from "./Navigation";
import Footer from "./Footer";
import { FaUsers, FaEdit, FaTrash, FaPlus, FaSearch, FaFilter, FaDownload } from 'react-icons/fa';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import '../styles/user-management.css';
import {FaPencil} from "react-icons/fa6";

DataTable.use(DT);

const UserList = () => {
    const { user: currentUser, isAdmin, isManager } = useAuth();
    const [users, setUsers] = useState([]);
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false); // ADD THIS LINE
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '', // ADD THIS LINE
        role: 'user',
        manager_id: ''
    });
    const [formLoading, setFormLoading] = useState(false);

    // DataTable ref
    const tableRef = useRef(null);

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        admins: 0,
        managers: 0,
        users: 0,
        verified: 0
    });

    // Calculate stats
    useEffect(() => {
        if (users.length > 0) {
            setStats({
                total: users.length,
                admins: users.filter(u => u.role === 'admin').length,
                managers: users.filter(u => u.role === 'manager').length,
                users: users.filter(u => u.role === 'user').length,
                verified: users.filter(u => u.email_verified_at).length
            });
        }
    }, [users]);

    // Fetch users
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/users');
            setUsers(response.data.users || []);
            setError(null);
        } catch (err) {
            setError('Failed to fetch users');
            console.error('Fetch users error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch managers
    const fetchManagers = async () => {
        try {
            const response = await api.get('/api/managers');
            setManagers(response.data || []);
        } catch (err) {
            console.error('Fetch managers error:', err);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchUsers();
            fetchManagers();
        }
    }, [currentUser]);

    // Clear alerts after 5 seconds
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError(null);
                setSuccess(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    // Handle create user
    const handleCreateUser = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'user',
            manager_id: ''
        });
        // Reset password validation
        setPasswordValidation({
            minLength: false,
            hasUpperCase: false,
            hasLowerCase: false,
            hasNumbers: false,
            hasSpecialChar: false,
            isValid: false
        });
        setShowCreateModal(true);
    };

    // Handle edit user
    const handleEditUser = (user) => {
        setSelectedUser(user);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            password: '', // Don't include password in edit
            role: user.role || 'user',
            manager_id: user.manager_id || ''
        });
        setShowEditModal(true);
    };

    // Handle delete user
    const handleDeleteUser = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    // Submit create form
    const handleSubmitCreate = async (e) => {
        e.preventDefault();

        // Validate password before submitting
        const validation = validatePassword(formData.password);
        if (!validation.isValid) {
            setError('Please ensure your password meets all requirements.');
            return;
        }

        setFormLoading(true);

        try {
            const response = await api.post('/api/users', formData);

            // Add new user to list
            setUsers([...users, response.data.user]);

            setSuccess('User created successfully');
            setShowCreateModal(false);

            // Reset form
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'user',
                manager_id: ''
            });
            // Reset password validation
            setPasswordValidation({
                minLength: false,
                hasUpperCase: false,
                hasLowerCase: false,
                hasNumbers: false,
                hasSpecialChar: false,
                isValid: false
            });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create user');
        } finally {
            setFormLoading(false);
        }
    };

    // Submit edit form
    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            // Remove password from edit data
            const editData = { ...formData };
            delete editData.password;

            const response = await api.put(`/api/users/${selectedUser.id}`, editData);

            // Update users list
            setUsers(users.map(user =>
                user.id === selectedUser.id ? response.data.user : user
            ));

            setSuccess('User updated successfully');
            setShowEditModal(false);
            setSelectedUser(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update user');
        } finally {
            setFormLoading(false);
        }
    };

    // Confirm delete
    const confirmDelete = async () => {
        setFormLoading(true);

        try {
            await api.delete(`/api/users/${selectedUser.id}`);

            // Remove user from list
            setUsers(users.filter(user => user.id !== selectedUser.id));

            setSuccess('User deleted successfully');
            setShowDeleteModal(false);
            setSelectedUser(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete user');
        } finally {
            setFormLoading(false);
        }
    };

    // Password validation function
    const validatePassword = (password) => {
        const minLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[@$!%*?&]/.test(password);

        return {
            minLength,
            hasUpperCase,
            hasLowerCase,
            hasNumbers,
            hasSpecialChar,
            isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
        };
    };

    // Password validation state
    const [passwordValidation, setPasswordValidation] = useState({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumbers: false,
        hasSpecialChar: false,
        isValid: false
    });

    // Handle form input changes with password validation
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Validate password in real-time for create modal
        if (name === 'password' && showCreateModal) {
            setPasswordValidation(validatePassword(value));
        }
    };

    // Get role badge variant
    const getRoleBadgeVariant = (role) => {
        switch (role) {
            case 'admin': return 'danger';
            case 'manager': return 'warning';
            case 'user': return 'primary';
            default: return 'secondary';
        }
    };

    // Prepare data for DataTable
    const tableData = users.map(user => [
        user.name || 'N/A',                    // Column 0
        user.email || 'N/A',                   // Column 1
        `<span class="badge bg-${getRoleBadgeVariant(user.role)}">${user.role}</span>`, // Column 2
        user.manager_name || 'N/A',            // Column 3
        user.email_verified_at ?               // Column 4
            `<span class="badge bg-success">Verified</span>` :
            `<span class="badge bg-warning">Unverified</span>`,
        user.can_edit || user.can_delete ? `
        <div class="btn-group" role="group">
            ${user.can_edit ? `<button class="btn btn-sm btn-mint edit-btn" data-user-id="${user.id}" title="Edit User"><i class="fas fa-edit"></i></button>` : ''}
            ${user.can_delete ? `<button class="btn btn-sm btn-navy delete-btn" data-user-id="${user.id}" title="Delete User"><i class="fas fa-trash"></i></button>` : ''}
        </div>
    ` : 'No actions'
    ]);

    const tableColumns = [
        { title: 'Name' },
        { title: 'Email' },
        { title: 'Role' },
        { title: 'Manager' },
        { title: 'Status' },
        { title: 'Actions', orderable: false }
    ];

    // Handle DataTable button clicks
    const handleTableClick = (e) => {
        const userId = parseInt(e.target.dataset.userId);
        const user = users.find(u => u.id === userId);

        if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
            handleEditUser(user);
        } else if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
            handleDeleteUser(user);
        }
    };

    if (!currentUser || (!isAdmin() && !isManager())) {
        return (
            <>
                <Navigation/>
                <Container className="mt-4 vh-100">
                    <Card className="modern-card">
                        <Card.Body className="text-center py-5">
                            <FaUsers className="text-muted mb-3" size={48} />
                            <h4>Access Denied</h4>
                            <p className="text-muted">You don't have permission to access user management.</p>
                            <Button variant="primary" href="/dashboard">Go to Dashboard</Button>
                        </Card.Body>
                    </Card>
                </Container>
                <Footer/>
            </>
        );
    }

    if (loading) {
        return (
            <>
                <Navigation/>
                <Container className="mt-4 text-center">
                    <div className="loading-container">
                        <Spinner animation="border" className="spinner-mint" size="lg" />
                        <h4 className="mt-3">Loading Users...</h4>
                        <p className="text-muted">Please wait while we fetch the user data</p>
                    </div>
                </Container>
                <Footer/>
            </>
        );
    }

    return (
        <>
            <Navigation/>

            <Container className="mt-4 mb-5">
                {/* Header Section */}
                <div className="page-header">
                    <div className="header-content">
                        <div>
                            <h1 className="page-title">
                                <FaUsers className="me-3" />
                                User Management
                            </h1>
                            <p className="page-subtitle">Manage users, roles, and permissions</p>
                        </div>
                        <div className="header-actions">
                            <Button variant="outline-primary" className="me-2">
                                <FaDownload className="me-2" />
                                Export
                            </Button>
                            <Button variant="primary" onClick={handleCreateUser}>
                                <FaPlus className="me-2" />
                                Add User
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <Row className="mb-4">
                    <Col md={3} sm={6}>
                        <Card className="stats-card">
                            <Card.Body>
                                <div className="stats-content">
                                    <div className="stats-number">{stats.total}</div>
                                    <div className="stats-label">Total Users</div>
                                </div>
                                <div className="stats-icon total">
                                    <FaUsers />
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3} sm={6}>
                        <Card className="stats-card">
                            <Card.Body>
                                <div className="stats-content">
                                    <div className="stats-number">{stats.admins}</div>
                                    <div className="stats-label">Admins</div>
                                </div>
                                <div className="stats-icon admin">
                                    <Badge bg="danger">{stats.admins}</Badge>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3} sm={6}>
                        <Card className="stats-card">
                            <Card.Body>
                                <div className="stats-content">
                                    <div className="stats-number">{stats.managers}</div>
                                    <div className="stats-label">Managers</div>
                                </div>
                                <div className="stats-icon manager">
                                    <Badge bg="warning">{stats.managers}</Badge>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3} sm={6}>
                        <Card className="stats-card">
                            <Card.Body>
                                <div className="stats-content">
                                    <div className="stats-number">{stats.verified}</div>
                                    <div className="stats-label">Verified</div>
                                </div>
                                <div className="stats-icon verified">
                                    <Badge bg="success">{stats.verified}</Badge>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Alerts */}
                {error && <Alert variant="danger" className="modern-alert">{error}</Alert>}
                {success && <Alert variant="success" className="modern-alert">{success}</Alert>}

                {/* Users Table */}
                {users.length > 0 && (
                    <Card className="modern-card">
                        <Card.Header className="modern-card-header">
                            <h5 className="mb-0">All Users</h5>
                            <div className="table-actions">
                                <Button variant="outline-secondary" size="sm" className="me-2">
                                    <FaFilter className="me-1" />
                                    Filter
                                </Button>
                                <Button variant="outline-secondary" size="sm">
                                    <FaSearch className="me-1" />
                                    Search
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <div className="table-responsive">
                                <DataTable
                                    ref={tableRef}
                                    data={tableData}
                                    columns={tableColumns}
                                    options={{
                                        pageLength: 10,
                                        responsive: true,
                                        order: [[0, 'asc']],
                                        columnDefs: [
                                            { targets: [2, 4, 5], orderable: false, searchable: false }
                                        ],
                                        drawCallback: function() {
                                            const table = this.api().table().container();
                                            table.removeEventListener('click', handleTableClick);
                                            table.addEventListener('click', handleTableClick);
                                        }
                                    }}
                                    className="modern-datatable"
                                />
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {/* Create User Modal */}
                <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" className="modern-modal">
                    <Modal.Header closeButton className="modern-modal-header">
                        <Modal.Title>
                            <FaPencil className="me-2" />
                            Create User
                        </Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={handleSubmitCreate}>
                        <Modal.Body className="modern-modal-body">
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="modern-label">Name *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="modern-input"
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="modern-label">Password *</Form.Label>
                                        <Form.Control
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="modern-input"
                                            required
                                            minLength="8"
                                            placeholder="Enter secure password"
                                        />

                                        {/* Password Requirements */}
                                        {formData.password && (
                                            <div className="password-requirements mt-2">
                                                <small className="form-text">
                                                    <div className={`requirement ${passwordValidation.minLength ? 'text-success' : 'text-danger'}`}>
                                                        <i className={`fas ${passwordValidation.minLength ? 'fa-check' : 'fa-times'} me-1`}></i>
                                                        At least 8 characters
                                                    </div>
                                                    <div className={`requirement ${passwordValidation.hasUpperCase ? 'text-success' : 'text-danger'}`}>
                                                        <i className={`fas ${passwordValidation.hasUpperCase ? 'fa-check' : 'fa-times'} me-1`}></i>
                                                        One uppercase letter (A-Z)
                                                    </div>
                                                    <div className={`requirement ${passwordValidation.hasLowerCase ? 'text-success' : 'text-danger'}`}>
                                                        <i className={`fas ${passwordValidation.hasLowerCase ? 'fa-check' : 'fa-times'} me-1`}></i>
                                                        One lowercase letter (a-z)
                                                    </div>
                                                    <div className={`requirement ${passwordValidation.hasNumbers ? 'text-success' : 'text-danger'}`}>
                                                        <i className={`fas ${passwordValidation.hasNumbers ? 'fa-check' : 'fa-times'} me-1`}></i>
                                                        One number (0-9)
                                                    </div>
                                                    <div className={`requirement ${passwordValidation.hasSpecialChar ? 'text-success' : 'text-danger'}`}>
                                                        <i className={`fas ${passwordValidation.hasSpecialChar ? 'fa-check' : 'fa-times'} me-1`}></i>
                                                        One special character (@$!%*?&)
                                                    </div>
                                                </small>
                                            </div>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label className="modern-label">Email *</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="modern-input"
                                    required
                                />
                            </Form.Group>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="modern-label">Role *</Form.Label>
                                        <Form.Select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            className="modern-select"
                                            required
                                        >
                                            <option value="user">User</option>
                                            <option value="manager">Manager</option>
                                            {isAdmin() && <option value="admin">Admin</option>}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="modern-label">Manager</Form.Label>
                                        <Form.Select
                                            name="manager_id"
                                            value={formData.manager_id}
                                            onChange={handleInputChange}
                                            className="modern-select"
                                            disabled={formData.role === 'admin'}
                                        >
                                            <option value="">No Manager</option>
                                            {managers
                                                .map(manager => (
                                                    <option key={manager.id} value={manager.id}>
                                                        {manager.name} ({manager.role})
                                                    </option>
                                                ))
                                            }
                                        </Form.Select>
                                        {isAdmin() && (
                                            <Form.Text className="text-muted">
                                                As admin, you can assign any manager to this user.
                                            </Form.Text>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>

                            {formData.role === 'admin' && (
                                <Alert variant="info" className="modern-alert">
                                    <i className="fas fa-info-circle me-2"></i>
                                    Admin users cannot have a manager assigned.
                                </Alert>
                            )}
                        </Modal.Body>
                        <Modal.Footer className="modern-modal-footer">
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowCreateModal(false)}
                                disabled={formLoading}
                                className="modern-btn-secondary"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={formLoading || !passwordValidation.isValid}
                                className="modern-btn-primary"
                            >
                                {formLoading ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            className="me-2"
                                        />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <FaPencil className="me-2" />
                                        Create User
                                    </>
                                )}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>

                {/* Edit User Modal */}
                <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" className="modern-modal">
                    <Modal.Header closeButton className="modern-modal-header">
                        <Modal.Title>
                            <FaEdit className="me-2" />
                            Edit User
                        </Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={handleSubmitEdit}>
                        <Modal.Body className="modern-modal-body">
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="modern-label">Name *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="modern-input"
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label className="modern-label">Email *</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="modern-input"
                                    required
                                />
                            </Form.Group>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="modern-label">Role *</Form.Label>
                                        <Form.Select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            className="modern-select"
                                            required
                                        >
                                            <option value="user">User</option>
                                            <option value="manager">Manager</option>
                                            {isAdmin() && <option value="admin">Admin</option>}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="modern-label">Manager</Form.Label>
                                        <Form.Select
                                            name="manager_id"
                                            value={formData.manager_id}
                                            onChange={handleInputChange}
                                            className="modern-select"
                                            disabled={formData.role === 'admin'}
                                        >
                                            <option value="">No Manager</option>
                                            {managers
                                                .filter(manager => {
                                                    if (isAdmin()) {
                                                        return manager.id !== selectedUser?.id;
                                                    }
                                                    return manager.id !== selectedUser?.id;
                                                })
                                                .map(manager => (
                                                    <option key={manager.id} value={manager.id}>
                                                        {manager.name} ({manager.role})
                                                    </option>
                                                ))
                                            }
                                        </Form.Select>
                                        {isAdmin() && (
                                            <Form.Text className="text-muted">
                                                As admin, you can assign any manager to this user.
                                            </Form.Text>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>

                            {formData.role === 'admin' && (
                                <Alert variant="info" className="modern-alert">
                                    <i className="fas fa-info-circle me-2"></i>
                                    Admin users cannot have a manager assigned.
                                </Alert>
                            )}
                        </Modal.Body>
                        <Modal.Footer className="modern-modal-footer">
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowEditModal(false)}
                                disabled={formLoading}
                                className="modern-btn-secondary"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={formLoading}
                                className="modern-btn-primary"
                            >
                                {formLoading ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            className="me-2"
                                        />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <FaEdit className="me-2" />
                                        Update User
                                    </>
                                )}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} className="modern-modal">
                    <Modal.Header closeButton className="modern-modal-header">
                        <Modal.Title>
                            <FaTrash className="me-2 text-danger" />
                            Confirm Delete
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="modern-modal-body">
                        <div className="delete-confirmation">
                            <div className="delete-icon">
                                <FaTrash />
                            </div>
                            <h5>Are you sure?</h5>
                            <p>
                                You are about to delete user <strong>{selectedUser?.name}</strong>.
                                This action cannot be undone.
                            </p>
                        </div>
                        <Alert variant="warning" className="modern-alert">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            This action is permanent and cannot be reversed.
                        </Alert>
                    </Modal.Body>
                    <Modal.Footer className="modern-modal-footer">
                        <Button
                            variant="outline-secondary"
                            onClick={() => setShowDeleteModal(false)}
                            disabled={formLoading}
                            className="modern-btn-secondary"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={confirmDelete}
                            disabled={formLoading}
                            className="modern-btn-danger"
                        >
                            {formLoading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        className="me-2"
                                    />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <FaTrash className="me-2" />
                                    Delete User
                                </>
                            )}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>

            <Footer/>
        </>
    );
};

export default UserList;
