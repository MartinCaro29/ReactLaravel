import { Container, Dropdown, Nav, Navbar, Badge } from "react-bootstrap";
import Logo from "../images/logo.png";
import { FaBell, FaUser, FaCog, FaSignOutAlt, FaUsers, FaTachometerAlt } from "react-icons/fa";
import React from "react";
import '../styles/navigation.css';
import { useAuth } from "./AuthContext";

const Navigation = () => {
    const { user, logout, isAdmin, isManager } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <Navbar expand="lg" className="modern-nav shadow-sm">
            <Container fluid className="px-4">
                <Navbar.Brand href="/" className="nav-brand">
                    <img
                        src={Logo}
                        height="45"
                        alt="Çaro Logo"
                        loading="lazy"
                        className="nav-logo"
                    />
                    <span className="brand-text d-none d-md-inline ms-2">Çaro Consulting</span>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="navbarSupportedContent" className="custom-toggler" />

                <Navbar.Collapse id="navbarSupportedContent">
                    <Nav className="me-auto">
                        <Nav.Link className="nav-link-custom" href="/">
                            <span>Home</span>
                        </Nav.Link>
                        {user && (
                            <Nav.Link className="nav-link-custom" href="/dashboard">
                                <FaTachometerAlt className="me-1" />
                                <span>Dashboard</span>
                            </Nav.Link>
                        )}
                        <Nav.Link className="nav-link-custom" href="/team">
                            <span>Team</span>
                        </Nav.Link>
                        <Nav.Link className="nav-link-custom" href="/projects">
                            <span>Projects</span>
                        </Nav.Link>
                        {(isAdmin() || isManager()) && (
                            <Nav.Link className="nav-link-custom" href="/users">
                                <FaUsers className="me-1" />
                                <span>User Management</span>
                            </Nav.Link>
                        )}
                    </Nav>

                    <Nav className="align-items-center">
                        {user ? (
                            <>
                                {/* Notifications */}
                                <Nav.Item className="me-3">
                                    <div className="notification-bell">
                                        <FaBell className="bell-icon" />
                                        <Badge bg="danger" className="notification-badge">3</Badge>
                                    </div>
                                </Nav.Item>

                                {/* User Dropdown */}
                                <Dropdown align="end">
                                    <Dropdown.Toggle variant="none" className="user-dropdown-toggle">
                                        <div className="user-avatar">
                                            <FaUser className="user-icon" />
                                        </div>
                                        <div className="user-info d-none d-md-block">
                                            <div className="user-name">{user.name}</div>
                                            <div className="user-role">{user.role}</div>
                                        </div>
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu className="user-dropdown-menu">
                                        <div className="dropdown-header">
                                            <div className="user-details">
                                                <div className="user-name-dropdown">{user.name}</div>
                                                <div className="user-email">{user.email}</div>
                                                <Badge bg="primary" className="role-badge">{user.role}</Badge>
                                            </div>
                                        </div>

                                        <Dropdown.Divider />

                                        <Dropdown.Item href="/profile" className="dropdown-item-custom">
                                            <FaUser className="me-2" />
                                            Profile
                                        </Dropdown.Item>

                                        <Dropdown.Item href="/forgotpassword" className="dropdown-item-custom">
                                            <FaCog className="me-2" />
                                            Change Password
                                        </Dropdown.Item>

                                        <Dropdown.Divider />

                                        <Dropdown.Item
                                            onClick={handleLogout}
                                            className="dropdown-item-custom logout-item"
                                        >
                                            <FaSignOutAlt className="me-2" />
                                            Logout
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </>
                        ) : (
                            <div className="auth-buttons">
                                <Nav.Link className="nav-link-custom login-btn" href="/login">
                                    Login
                                </Nav.Link>
                                <Nav.Link className="nav-link-custom signup-btn" href="/register">
                                    Sign Up
                                </Nav.Link>
                            </div>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Navigation;
