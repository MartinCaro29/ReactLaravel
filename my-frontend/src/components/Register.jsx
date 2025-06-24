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
            setResendSuccess('Kodi i verifikimit u ridërgua me sukses!');
            setCountdown(60);
            setTimeout(() => setResendSuccess(''), 3000);
        } catch (err) {
            setAlert('danger');
            if (err.response?.status === 400) {
                setError(err.response.data);
            } else {
                setError('Gabim gjatë ridërgimit të kodit. Ju lutemi provoni përsëri.');
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
            handleError("Ju lutemi pranoni kushtet e shërbimit për të vazhduar.");
            setIsRegistering(false);
            return;
        }

        if (!newUser.name || !newUser.email || !newUser.password || !newUser.confirmPassword) {
            handleError('Të gjitha fushat janë të detyrueshme');
            setIsRegistering(false);
            return;
        }

        if (newUser.password !== newUser.confirmPassword) {
            handleError('Fjalëkalimet nuk përputhen');
            setIsRegistering(false);
            return;
        }

        if (newUser.password.length < 8 || !validatePassword(newUser.password)) {
            handleError('Fjalëkalimi duhet të jetë të paktën 8 karaktere i gjatë, të përmbajë një shkronjë të madhe dhe një karakter special.');
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
                handleError('Gabim gjatë regjistrimit. Ju lutemi provoni përsëri.');
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
            setError('Email-i u verifikua me sukses! Po ridrejtoheni në faqen e hyrjes...');

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            if (err.response?.status === 400) {
                const errorMsg =
                    err.response.data === 'Token not found or expired.' ? 'Kodi i verifikimit nuk u gjet ose ka skaduar.' :
                        err.response.data === 'Token has expired.' ? 'Kodi i verifikimit ka skaduar.' :
                            err.response.data === 'Invalid token.' ? 'Kodi i verifikimit është i pavlefshëm.' :
                                'Kodi i verifikimit është i pasaktë ose ka skaduar.';
                handleError(errorMsg);
            } else {
                handleError('Gabim gjatë verifikimit. Ju lutemi provoni përsëri.');
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
                                {step === 'register' ? 'Krijoni llogarinë tuaj' : 'Verifikoni Email-in'}
                            </h2>

                            {step === 'register' && (
                                <p className="auth-subtitle text-center mb-4">
                                    Filloni udhëtimin tuaj me ne
                                </p>
                            )}

                            {step === 'register' ? (
                                <Form onSubmit={handleRegister}>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="auth-label">Emri i përdoruesit</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    value={newUser.name}
                                                    onChange={handleChange}
                                                    placeholder="Shkruani emrin tuaj"
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
                                                    placeholder="Shkruani email-in tuaj"
                                                    className="auth-input"
                                                    size="lg"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="auth-label">Fjalëkalimi</Form.Label>
                                                <div className="password-input-wrapper">
                                                    <Form.Control
                                                        type={showPassword ? 'text' : 'password'}
                                                        name="password"
                                                        value={newUser.password}
                                                        onChange={handleChange}
                                                        placeholder="Shkruani fjalëkalimin"
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
                                                    Të paktën 8 karaktere, 1 shkronjë e madhe, 1 karakter special
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="auth-label">Konfirmo fjalëkalimin</Form.Label>
                                                <Form.Control
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="confirmPassword"
                                                    value={newUser.confirmPassword}
                                                    onChange={handleChange}
                                                    placeholder="Konfirmoni fjalëkalimin"
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
                                                    Unë pranoj{' '}
                                                    <a href="/terms" className="auth-link" target="_blank">
                                                        kushtet e shërbimit
                                                    </a>{' '}
                                                    dhe{' '}
                                                    <a href="/privacy" className="auth-link" target="_blank">
                                                        politikën e privatësisë
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
                                                Duke u regjistruar...
                                            </>
                                        ) : (
                                            'Regjistrohu'
                                        )}
                                    </Button>

                                    <p className="text-center auth-footer-text">
                                        Jeni të regjistruar tashmë?{' '}
                                        <a href="/login" className="auth-link fw-bold">
                                            Hyni këtu
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
                                            Kemi dërguar një kod verifikimi në <strong>{newUser.email}</strong>
                                        </p>
                                    </div>

                                    <Form onSubmit={handleVerifyEmail}>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="auth-label">Kodi i Verifikimit</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                                placeholder="Shkruani kodin 6-shifror"
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
                                                    Duke verifikuar...
                                                </>
                                            ) : (
                                                'Verifiko Email-in'
                                            )}
                                        </Button>

                                        <Button
                                            variant="outline-primary"
                                            onClick={handleResendCode}
                                            disabled={countdown > 0}
                                            className="w-100 mb-3"
                                            size="lg"
                                        >
                                            {countdown > 0 ? `Ridërgo kodin (${countdown}s)` : 'Ridërgo kodin'}
                                        </Button>

                                        <div className="text-center">
                                            <button
                                                type="button"
                                                className="btn btn-link auth-link"
                                                onClick={() => setStep('register')}
                                            >
                                                <i className="fas fa-arrow-left me-2"></i>
                                                Kthehu te regjistrimi
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
