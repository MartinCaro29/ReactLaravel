import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Import useAuth
import api from '../api'; // Use your centralized API instance
import AuthLogo from '../images/dreamestatelogoauth.png';
import './Auth.css';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth(); // Use AuthContext

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [])

    const [step, setStep] = useState('initial');
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [passwords, setPasswords] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [alert, setAlert] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [resendSuccess, setResendSuccess] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuthentication = async () => {
            if (authLoading) return;

            if (user) {
                setEmail(user.email);
                setIsAuthenticated(true);
                try {

                    await api.post('/api/request-password-reset', { email: user.email });
                    setStep('verify');
                    setAlert('Verification code sent to your email');
                } catch (err) {
                    setError(err.response?.data?.message || 'Failed to send reset code');
                }
            } else {
                setStep('email');
            }
        };

        checkAuthentication();
    }, [user, authLoading]);

    const handleAuthenticatedReset = async (userEmail) => {
        try {
            await api.get('/sanctum/csrf-cookie');

            await api.post('/api/request-password-reset', {
                email: userEmail
            });
            setStep('verify');
            setCountdown(10);
        } catch (err) {
            handleError('Gabim gjatë dërgimit të kodit. Ju lutemi provoni përsëri.');
            setStep('verify');
        }
    };

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const validatePassword = (password) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return hasUpperCase && hasSpecialChar;
    };

    const handleError = (message, alertType = 'danger') => {
        setError(message);
        setAlert(alertType);
        setTimeout(() => {
            setError('');
        }, 3000);
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            handleError('Email-i është i detyrueshëm');
            return;
        }

        try {
            await api.get('/sanctum/csrf-cookie');

            await api.post('/api/request-password-reset', {
                email: email
            });
            setStep('verify');
            setCountdown(10);
        } catch (err) {
            if (err.response?.status === 404) {
                handleError('Ky email nuk ekziston.');
            } else {
                handleError('Gabim gjatë dërgimit të kodit. Ju lutemi provoni përsëri.');
            }
        }
    };

    const handleResendCode = async () => {
        try {
            await api.get('/sanctum/csrf-cookie');
            await api.post('/api/resend-verification', {
                email: email
            });
            setResendSuccess('Kodi i verifikimit u ridërgua me sukses!');
            setCountdown(10);
            setTimeout(() => setResendSuccess(''), 3000);
        } catch (err) {
            handleError('Gabim gjatë ridërgimit të kodit. Ju lutemi provoni përsëri.');
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        if (!verificationCode) {
            handleError('Kodi i verifikimit është i detyrueshëm');
            return;
        }

        setIsVerifying(true);
        try {

            await api.post('/api/verify-reset-code', {
                email: email,
                token: verificationCode
            });
            setStep('reset');
        } catch (err) {
            if (err.response?.status === 400) {
                const errorMessage = err.response?.data?.message;
                if (errorMessage === 'Kodi i verifikimit ka skaduar.') {
                    handleError('Kodi i verifikimit ka skaduar. Ju lutemi kërkoni një kod të ri.');
                } else if (errorMessage === 'Kodi i verifikimit është i pavlefshëm.') {
                    handleError('Kodi i verifikimit është i pavlefshëm.');
                } else {
                    handleError('Kodi i verifikimit është i pasaktë ose ka skaduar.');
                }
            } else {
                handleError('Kodi i verifikimit është i pasaktë ose ka skaduar.');
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (!passwords.password || !passwords.confirmPassword) {
            handleError('Të gjitha fushat janë të detyrueshme');
            return;
        }
        if (passwords.password !== passwords.confirmPassword) {
            handleError('Fjalëkalimet nuk përputhen');
            return;
        }
        if (passwords.password.length < 8 || !validatePassword(passwords.password)) {
            handleError('Fjalëkalimi duhet të jetë të paktën 8 karaktere i gjatë, të përmbajë një shkronjë të madhe dhe një karakter special.');
            return;
        }

        try {
            await api.get('/sanctum/csrf-cookie');
            await api.post('/api/reset-password', {
                email: email,
                token: verificationCode,
                new_password: passwords.password,
                new_password_confirmation: passwords.confirmPassword
            });

            // Show success message and redirect after 2 seconds
            setAlert('success');
            setError('Fjalëkalimi u ndryshua me sukses! Po ridrejtoheni...');

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            if (err.response?.status === 400) {
                const errorMessage = err.response?.data?.message;
                if (errorMessage === 'Token has expired.') {
                    handleError('Kodi i verifikimit ka skaduar. Ju lutemi kërkoni një kod të ri.');
                } else if (errorMessage === 'User not found.') {
                    handleError('Përdoruesi nuk u gjet.');
                } else if (errorMessage === 'Invalid request data.') {
                    handleError('Të dhënat e kërkesës janë të pavlefshme.');
                } else if (errorMessage === 'Kodi i verifikimit është i pavlefshëm.') {
                    handleError('Kodi i verifikimit është i pavlefshëm.');
                } else {
                    handleError(errorMessage || 'Gabim gjatë ndryshimit të fjalëkalimit.');
                }
            } else if (err.response?.status === 404) {
                handleError('Përdoruesi nuk u gjet.');
            } else {
                handleError('Gabim gjatë ndryshimit të fjalëkalimit. Ju lutemi provoni përsëri.');
            }

            setTimeout(() => {
                if(isAuthenticated) {setStep('verify');


                }else {setStep('email');
                    setEmail('');
                }


                setVerificationCode('');

            }, 3000);
        }
    };

    const renderStep = () => {
        // Show loading state while checking authentication
        if (step === 'initial') {
            return <div className="text-center">Duke kontrolluar...</div>;
        }

        switch (step) {
            case 'email':
                return !isAuthenticated ? (
                    <Form onSubmit={handleEmailSubmit}>
                        <Form.Group className="mb-3 form-element">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Shkruani email-in"
                                className="shadow-sm"
                                required
                            />
                        </Form.Group>
                        <div className="d-grid gap-2">
                            <Button variant="primary" type="submit" size="lg">
                                Dërgo kodin e verifikimit
                            </Button>
                        </div>
                    </Form>
                ) : null;

            case 'verify':
                return (
                    <Form onSubmit={handleVerifyCode}>
                        <div className="mb-3 text-center">
                            <small className="text-muted">
                                Kodi i verifikimit u dërgua në: <strong>{email}</strong>
                            </small>
                        </div>
                        <Form.Group className="mb-3 form-element">
                            <Form.Label>Kodi i Verifikimit</Form.Label>
                            <Form.Control
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="Shkruani kodin 6-shifror"
                                className="shadow-sm"
                                maxLength="6"
                                required
                            />
                        </Form.Group>
                        <div className="d-grid gap-2">
                            <Button
                                variant="primary"
                                type="submit"
                                size="lg"
                                className="mb-3"
                                disabled={isVerifying}
                            >
                                {isVerifying ? 'Duke verifikuar...' : 'Verifiko Kodin'}
                            </Button>
                            <Button
                                variant="outline-primary"
                                onClick={handleResendCode}
                                disabled={countdown > 0}
                            >
                                {countdown > 0
                                    ? `Ridërgo kodin (${countdown}s)`
                                    : 'Ridërgo kodin'}
                            </Button>
                        </div>
                    </Form>
                );

            case 'reset':
                return (
                    <Form onSubmit={handlePasswordReset}>
                        <div className="mb-3 text-center">
                            <small className="text-success">
                                Kodi u verifikua me sukses! Tani mund të ndryshoni fjalëkalimin.
                            </small>
                        </div>

                        <Form.Group className="mb-3 form-element">
                            <Form.Label>Fjalëkalimi i ri</Form.Label>
                            <Form.Control
                                type={showPassword ? 'text' : 'password'}
                                value={passwords.password}
                                onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                                placeholder="Shkruani fjalëkalimin e ri"
                                className="shadow-sm"
                                required
                            />
                            <Form.Text className="text-muted">
                                Të paktën 8 karaktere, një shkronjë e madhe dhe një karakter special.
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3 form-element">
                            <Form.Label>Konfirmo fjalëkalimin e ri</Form.Label>
                            <Form.Control
                                type={showPassword ? 'text' : 'password'}
                                value={passwords.confirmPassword}
                                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                placeholder="Konfirmoni fjalëkalimin e ri"
                                className="shadow-sm"
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Check
                                type="checkbox"
                                id="show-password"
                                label="Shfaq fjalëkalimin"
                                onChange={() => setShowPassword(!showPassword)}
                                checked={showPassword}
                            />
                        </Form.Group>

                        <div className="d-grid gap-2">
                            <Button variant="primary" type="submit" size="lg">
                                Ndrysho Fjalëkalimin
                            </Button>
                        </div>
                    </Form>
                );
            default:
                return null;
        }
    };

    return (
        <Container fluid className="vh-100 p-0">
            <Row className="h-100 g-0">
                <Col md={6} className="d-none left-side left-side-login d-md-block h-100" />
                <Col md={6} className="h-100 right-side right-side-login">
                    <div className="h-100 d-flex align-items-center right-side-stuff justify-content-center p-4">
                        <div className="w-100" style={{ maxWidth: '400px' }}>

                            <div className="w-100">
                                <a href="/">
                                    <img src={AuthLogo} className="logo-auth-img" style={{ marginBottom: '3rem' }} alt="Auth Logo" />
                                </a>
                            </div>

                            <h1 className="text-center mb-4">
                                {step === 'email' ? 'Rivendos Fjalëkalimin' :
                                    step === 'verify' ? 'Verifiko Email-in' :
                                        step === 'initial' ? 'Duke kontrolluar...' :
                                            'Fjalëkalimi i Ri'}
                            </h1>

                            {renderStep()}

                            {error && (
                                <Alert variant={alert} className="mt-3">
                                    {error}
                                </Alert>
                            )}

                            {resendSuccess && (
                                <Alert variant="success" className="mt-3">
                                    {resendSuccess}
                                </Alert>
                            )}

                            {!isAuthenticated && (
                                <p className="text-center mt-3">
                                    Ju kujtua fjalëkalimi?{' '}
                                    <a href="/login" className="text-decoration-none auth-link">
                                        Autentikohu
                                    </a>
                                </p>
                            )}

                            {isAuthenticated && (
                                <p className="text-center mt-3">
                                    Ju kujtua fjalëkalimi?{' '}
                                    <a href="/llogaria" className="text-decoration-none auth-link">
                                        Kthehu
                                    </a>
                                </p>
                            )}
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default ForgotPassword;
