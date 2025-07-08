import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Card, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AuthLogo from '../images/logo.png';
import '../styles/ModernAuth.css';
import api from '../api';

const Register = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [step, setStep] = useState('register');
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [alert, setAlert] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [resendSuccess, setResendSuccess] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [agreedTerms, setAgreedTerms] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const handleResendCode = async () => {
        try {
            await api.post('/api/resend-verification', {
                email: newUser.email,
            });
            setResendSuccess('Verification code resent successfully!');
            setCountdown(60);
            setTimeout(() => setResendSuccess(''), 3000);
        } catch (err) {
            setAlert('danger');
            if (err.response?.status === 400) {
                setError(err.response.data);
            } else {
                setError('Error resending code. Please try again.');
            }
        }
    };

    const validatePassword = (password) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return hasUpperCase && hasSpecialChar;
    };

    const handleChange = (e) => {
        setNewUser({ ...newUser, [e.target.name]: e.target.value });
        setError('');
        setAlert('');
    };

    const handleError = (message, alertType = 'danger') => {
        setError(message);
        setAlert(alertType);
        setTimeout(() => {
            setError('');
        }, 5000);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsRegistering(true);

        if (!agreedTerms) {
            handleError("Please accept the terms of service to continue.");
            setIsRegistering(false);
            return;
        }

        if (!newUser.name || !newUser.email || !newUser.password || !newUser.confirmPassword) {
            handleError('All fields are required');
            setIsRegistering(false);
            return;
        }

        if (newUser.password !== newUser.confirmPassword) {
            handleError('Passwords do not match');
            setIsRegistering(false);
            return;
        }

        if (newUser.password.length < 8 || !validatePassword(newUser.password)) {
            handleError('Password must be at least 8 characters long, contain one uppercase letter and one special character.');
            setIsRegistering(false);
            return;
        }

        try {
            await api.get('/sanctum/csrf-cookie', {
                withCredentials: true,
            });

            await api.post('/api/register', {
                name: newUser.name,
                email: newUser.email,
                password: newUser.password
            });

            setStep('verify');
            setCountdown(60);
        } catch (err) {
            if (err.response?.status === 400) {
                handleError(err.response.data);
            } else {
                handleError('Error during registration. Please try again.');
            }
        } finally {
            setIsRegistering(false);
        }
    };

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setIsVerifying(true);

        try {
            await api.post('/api/verify-email', {
                email: newUser.email,
                token: verificationCode
            });

            setAlert('success');
            setError('Email verified successfully! Redirecting to login page...');

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            if (err.response?.status === 400) {
                const errorMsg =
                    err.response.data === 'Token not found or expired.' ? 'Verification code not found or expired.' :
                        err.response.data === 'Token has expired.' ? 'Verification code has expired.' :
                            err.response.data === 'Invalid token.' ? 'Verification code is invalid.' :
                                'Verification code is incorrect or expired.';
                handleError(errorMsg);
            } else {
                handleError('Error during verification. Please try again.');
            }
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="modern-auth-container">
            <div className="auth-background">
                <div className="auth-overlay"></div>
                <div className="floating-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                    <div className="shape shape-4"></div>
                </div>
            </div>

            <Container className="h-100 d-flex align-items-center justify-content-center">
                <div className="auth-card-wrapper">
                    <Card className="auth-card shadow-lg">
                        <Card.Body className="p-4 p-md-5">
                            {/* Logo */}
                            <div className="text-center mb-4">
                                <a href ='/'>
                                    <img
                                        src={AuthLogo}
                                        alt="Logo"
                                        className="auth-logo"
                                    />
                                </a>
                            </div>

                            {/* Title */}
                            <h2 className="auth-title text-center mb-4">
                                {step === 'register' ? 'Create Your Account' : 'Verify Your Email'}
                            </h2>

                            {step === 'register' && (
                                <p className="auth-subtitle text-center mb-4">
                                    Start your journey with us
                                </p>
                            )}

                            {step === 'register' ? (
                                <Form onSubmit={handleRegister}>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="auth-label">Username</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    value={newUser.name}
                                                    onChange={handleChange}
                                                    placeholder="Enter your name"
                                                    className="auth-input"
                                                    size="lg"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="auth-label">Email</Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    name="email"
                                                    value={newUser.email}
                                                    onChange={handleChange}
                                                    placeholder="Enter your email"
                                                    className="auth-input"
                                                    size="lg"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="auth-label">Password</Form.Label>
                                                <div className="password-input-wrapper">
                                                    <Form.Control
                                                        type={showPassword ? 'text' : 'password'}
                                                        name="password"
                                                        value={newUser.password}
                                                        onChange={handleChange}
                                                        placeholder="Enter password"
                                                        className="auth-input"
                                                        size="lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="password-toggle"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                    </button>
                                                </div>
                                                <Form.Text className="text-muted small">
                                                    At least 8 characters, 1 uppercase letter, 1 special character
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="auth-label">Confirm Password</Form.Label>
                                                <Form.Control
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="confirmPassword"
                                                    value={newUser.confirmPassword}
                                                    onChange={handleChange}
                                                    placeholder="Confirm password"
                                                    className="auth-input"
                                                    size="lg"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-4">
                                        <Form.Check
                                            type="checkbox"
                                            id="agree-terms"
                                            label={
                                                <span>
                                                    I agree to the{' '}
                                                    <a href="/terms" className="auth-link" target="_blank">
                                                        terms of service
                                                    </a>{' '}
                                                    and{' '}
                                                    <a href="/privacy" className="auth-link" target="_blank">
                                                        privacy policy
                                                    </a>
                                                </span>
                                            }
                                            onChange={() => setAgreedTerms(!agreedTerms)}
                                            checked={agreedTerms}
                                            className="auth-checkbox"
                                        />
                                    </Form.Group>

                                    <Button
                                        variant="primary"
                                        type="submit"
                                        size="lg"
                                        className="auth-btn w-100 mb-3"
                                        disabled={isRegistering}
                                    >
                                        {isRegistering ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    className="me-2"
                                                />
                                                Registering...
                                            </>
                                        ) : (
                                            'Sign Up'
                                        )}
                                    </Button>

                                    <p className="text-center auth-footer-text">
                                        Already registered?{' '}
                                        <a href="/login" className="auth-link fw-bold">
                                            Sign in here
                                        </a>
                                    </p>
                                </Form>
                            ) : (
                                /* Verification Form */
                                <div>
                                    <div className="text-center mb-4">
                                        <div className="verification-icon mb-3">
                                            <i className="fas fa-envelope-open"></i>
                                        </div>
                                        <p className="verification-text">
                                            We've sent a verification code to <strong>{newUser.email}</strong>
                                        </p>
                                    </div>

                                    <Form onSubmit={handleVerifyEmail}>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="auth-label">Verification Code</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                                placeholder="Enter 6-digit code"
                                                className="auth-input text-center"
                                                size="lg"
                                                maxLength="6"
                                            />
                                        </Form.Group>

                                        <Button
                                            variant="primary"
                                            type="submit"
                                            size="lg"
                                            className="auth-btn w-100 mb-3"
                                            disabled={isVerifying}
                                        >
                                            {isVerifying ? (
                                                <>
                                                    <Spinner
                                                        as="span"
                                                        animation="border"
                                                        size="sm"
                                                        role="status"
                                                        className="me-2"
                                                    />
                                                    Verifying...
                                                </>
                                            ) : (
                                                'Verify Email'
                                            )}
                                        </Button>

                                        <Button
                                            variant="outline-primary"
                                            onClick={handleResendCode}
                                            disabled={countdown > 0}
                                            className="w-100 mb-3"
                                            size="lg"
                                        >
                                            {countdown > 0 ? `Resend code (${countdown}s)` : 'Resend code'}
                                        </Button>

                                        <div className="text-center">
                                            <button
                                                type="button"
                                                className="btn btn-link auth-link"
                                                onClick={() => setStep('register')}
                                            >
                                                <i className="fas fa-arrow-left me-2"></i>
                                                Back to registration
                                            </button>
                                        </div>
                                    </Form>
                                </div>
                            )}

                            {/* Alerts */}
                            {error && (
                                <Alert variant={alert} className="mt-3 auth-alert">
                                    <i className={`fas ${alert === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                                    {error}
                                </Alert>
                            )}

                            {resendSuccess && (
                                <Alert variant="success" className="mt-3 auth-alert">
                                    <i className="fas fa-check-circle me-2"></i>
                                    {resendSuccess}
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </div>
            </Container>
        </div>
    );
};

export default Register;
