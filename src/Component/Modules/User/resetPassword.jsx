import { useState } from 'react'
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Eye, EyeSlash } from 'react-bootstrap-icons';
import CommonTextInput from '../../Common/MultiSelect/CommonTextInput';
import AppButton from '../../Common/Buttton/button';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const ResetPassword = ({ onClose, item }) => {
    const { t } = useTranslation();
    const token = Cookies.get("accessToken");
    const [newPassword, setNewPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false);
    const [isPasswordTouched, setIsPasswordTouched] = useState(false);

    const validatePassword = (password) => {
        const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
        return regex.test(password);
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setIsPasswordTouched(true);

        if (!validatePassword(newPassword)) {
            toast.error(t('errors.invalidPassword'));
            return;
        }

        try {
            await axios.post(`${window.runtimeConfig.VITE_APP_API_USER_MAN}/api/user-man/v1/user/resetpassword`,
                {
                    new_password: newPassword,
                    user_id: item.id,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(t('success.passwordReset'));
            onClose();

        } catch (error) {
            toast.error(error.response?.data?.detail || t('errors.resetPassword'));
        }
    };

    return (
        <div className="popup-overlay" style={{ padding: '150px 100px 0px 0px' }}>
            <div className="popup-container">
                <button className="close-icon" onClick={onClose}>
                    &times;
                </button>
                <div className="popup-content">
                    <form onSubmit={handleReset}>
                        <h5>{item.username}</h5>

                        <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
                            <CommonTextInput
                                label={t('labels.newPassword')}
                                type={showPassword ? "text" : "password"}
                                id="title"
                                name="title"
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    if (!isPasswordTouched) setIsPasswordTouched(true);
                                }}
                                onBlur={() => setIsPasswordTouched(true)}
                                placeholder={t('placeholders.enterNewPassword')}
                                required
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                style={{
                                    position: "absolute",
                                    right: "10px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    cursor: "pointer",
                                    background: "none",
                                    border: "none",
                                    padding: 0,
                                    margin: 0
                                }}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <Eye /> : <EyeSlash />}
                            </button>
                        </div>

                        {isPasswordTouched && !validatePassword(newPassword) && (
                            <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>
                                {t('validation.passwordCriteria')}
                            </p>
                        )}

                        <div className="button-container">
                            <AppButton type="submit" className="create-btn">
                                {t('buttons.reset')}
                            </AppButton>
                            <AppButton type="button" className="cancel-btn" onClick={onClose}>
                                {t('buttons.cancel')}
                            </AppButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
ResetPassword.propTypes = {
    item: PropTypes.shape({
        id: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
    }).isRequired,
    onClose: PropTypes.func.isRequired,
};
export default ResetPassword;
