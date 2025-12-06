import { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import style from './login.module.css';
import { InputField } from '../../Common/InpuField/inputField';
import { toast } from 'react-toastify';
import { Eye, EyeSlash } from 'react-bootstrap-icons';
import { jwtDecode } from "jwt-decode";
import { useAutoFocusWithManualAutofill } from '../../../utils/autoFocus';
import AppButton from '../../Common/Buttton/button';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const { inputRef, isReadOnly, handleFocus } = useAutoFocusWithManualAutofill();
    const [loginData, setLoginData] = useState(null);

    useEffect(() => {
        fetch('/login-text.json', { cache: "no-store" })
            .then((res) => res.json())
            .then((data) => {
                setLoginData({
                    loginTextHeader: (data.loginTextHeader),
                    loginTextFooter: (data.loginTextFooter),
                    logoUrl: (data.logoUrl),
                });
            });
    }, []);

    const validateForm = () => {
        const errors = {};

        if (!formData.username.trim()) {
            errors.username = t('loginErrors.usernameRequired', 'Username is required');
        }

        if (!formData.password.trim()) {
            errors.password = t('loginErrors.passwordRequired', 'Password is required');
        }

        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        setError((prevErrors) => ({
            ...prevErrors,
            [name]: ""
        }));

    };

    const handleLogin = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setError(validationErrors);
            return;
        }
        try {


            const response = await axios.post(`${window.runtimeConfig.VITE_APP_API_USER_MAN}/api/user-man/v1/user/validate`, {
                username: formData.username,
                password: formData.password
            });
            console.log("response", response)
            if (response.status === 200) {
                const { access_token, refresh_token } = response.data;
                Cookies.set('accessToken', access_token, { expires: 10 });
                Cookies.set('refreshToken', refresh_token, { expires: 10 });

                const decodedToken = jwtDecode(access_token);
                console.log("admin", decodedToken)
                const username = decodedToken?.sub;

                navigate(username === "admin" ? "/admin" : "/cases");

            } else {
                toast.error(t('login.LoginError', 'An unexpected error has occurred. Please try again'));
            }
        } catch (err) {
            console.error('Error during login:', err);

            if (err.response) {

                toast.error(err.response?.data?.detail || (t('LoginError1', 'Something went wrong. Please try again')));

            } else if (err.request) {
                toast.error('No response from the server. Please check your connection.');
            } else {
                toast.error('An unknown error occurred. Please try again.');
            }
        }
    };

    return (
        <Container fluid className={style.loginContainer}>
            <Row className="justify-content-center" style={{ marginTop: '2rem' }}>
                <img
                    src={loginData?.logoUrl || "Logo"}
                    alt=" Logo"
                    className={style.logoCenter}
                />
            </Row>

            <h1>{loginData?.loginTextHeader || "Default Login"}</h1>

            <Row className="justify-content-center">
                <Col >
                    <Form className={style.loginForm} onSubmit={handleLogin} noValidate>
                        <h2 style={{ color: 'white', marginBottom: '24px' }}>{t('login.title', 'Login')}</h2>

                        <InputField
                            label={t('login.username', 'Username *')}
                            type="text"
                            ref={inputRef}
                            value={formData.username}
                            onChange={handleChange}
                            placeholder={t('login.usernamePlaceholder', 'Enter your username')}
                            autoComplete="user-name"
                            name="username"
                            autoFocus
                            readOnly={isReadOnly}
                            onFocus={handleFocus}
                            error={!!error.username}
                        />
                        {error.username && <p style={{ color: "red" }}>{error.username}</p>}

                        <div style={{ position: 'relative', justifyContent: 'center', marginBottom: '20px' }}>
                            <InputField
                                label={t('login.password', 'Password *')}
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder={t('login.passwordPlaceholder', 'Enter your password')}
                                autoComplete="current-password"
                                name="password"
                                error={!!error.password}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '28%',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    color: 'white',
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                }}
                                aria-label={showPassword ? t('login.hidePassword', 'Hide password') : t('login.showPassword', 'Show password')}
                            >
                                {showPassword ? <Eye size={20} /> : <EyeSlash size={20} />}
                            </button>
                        </div>
                        {error.password && <p style={{ color: "red" }}>{error.password}</p>}

                        <div className="d-flex justify-content-end mt-3">
                            <AppButton>
                                {t('login.submit', 'Login to Begin Your Investigation')}
                            </AppButton>
                        </div>
                    </Form>
                </Col>
            </Row>



            <h4>{loginData?.loginTextFooter || "Default Login"} </h4>
        </Container>
    );
}

export default LoginPage;      
