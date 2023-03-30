/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect, useState } from "react";
import IPage from "interfaces/page";
import logging from "config/logging";
import logo from "assets/img/AlphaPlusLogo.png";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { encryptPassword } from "util/index";
import Footer from "components/theme/footer";
import { useDispatch, useSelector } from "react-redux";
import { login, loginWithClever, requestResendPassword } from "redux/actionCreators/auth";
import { Alert, Spinner } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import config from "../config/config";
import { ReactComponent as ShowIconWhite } from "assets/img/show-icon.svg";
import { ReactComponent as HideIconWhite } from "assets/img/hide-icon.svg";
import { PromptModal } from "components/classroom/modals/prompt";
import SuccessModal from "components/common/successModal";
import ActionType from "redux/actionTypes";


interface RootState {
  auth: any;
}

const LoginPage: React.FunctionComponent<IPage> = (props) => {

  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSend, setIsEmailSend] = useState(false);
  const [isSubmittingClever, setIsSubmittingClever] = useState(false);
  const [passwordType, setPasswordType] = useState('password');
  const [searchParams] = useSearchParams();
  const cleverId = searchParams.get('clever_id');
  const errorMsg = searchParams.get('error_msg');
  const [modalShow, setModalShow] = useState(false);
  const [userCred, setUserCred] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const user = useSelector((state: RootState) => state);
  const [errors, setErrors] = useState(false);
  const navigate = useNavigate();
  const [initRender, setInitRender] = useState<boolean>(true)

  useEffect(() => {
    logging.info(`Loading ${props.name}`);
  }, [props.name]);

  useEffect(() => {
    const loginSuccess = async () => {
      setIsSubmitting(false);
      setErrors(false);
      setIsEmailSend(false);
      navigate("/activity");
    }

    if (user.auth.type === "USER_FORGOT_PASSWORD_SUCCESS") {
      setIsEmailSend(true);
    }

    if (user.auth.type === "USER_LOGIN_SUCCESS") {
      loginSuccess()
    } else if (user.auth.type === "USER_LOGIN_FAIL") {
      setIsSubmitting(false);
      setErrors(true);
      setIsEmailSend(false);
        setIsSubmittingClever(false);
    } else if (errorMsg) {
      dispatch({
        type: ActionType.USER_LOGIN_FAIL,
        payload: {
            message: errorMsg || "Failed to Login with Clever",
        },
      });
    } else if (cleverId) {
      setIsSubmittingClever(true);
      dispatch(
        loginWithClever({ code: cleverId })
      );
    }

    setInitRender(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [user.auth]);

  const initialValues = { email: "", password: "" };

  const onSubmit = (values: any) => {
    setIsSubmitting(true);

    const email = values.email;
    const password = encryptPassword(values.password);
    setIsSubmitting(true);
    dispatch(
      login({
        email: email.trim(),
        password,
      }, setModalShow)
    );

    setUserCred({email: email, password: password});

  };

  const validationSchema = Yup.object({
    email: Yup.string().trim().email("Email is invalid").required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const onRequestResendPassword = async () => {
    if (userCred.hasOwnProperty('email')) {
      const response = await requestResendPassword(userCred);
      if (response.data) {
        setModalShow(false);
        setShowSuccessModal(true);
      }
    }
  }

  if(initRender){
    return null
  }

  return (
    <>
      <section className="vh-100 login">
        <div className="login-background"></div>
        <div className="login-container h-100">
          <div className="row login__content">
            <div className="col-sm-12 col-md-9 col-lg-7 col-xl-6 login__content-column p-0">
              <div className="card login__card">
                <div className="login__card-header">
                  <div className="flex-column flex-sm-row flex-md-row d-flex justify-content-between">
                    <div className="brand-logo login__card-logo">
                      <img alt="alpha" src={logo} />
                    </div>
                    <div className="login__card-text">
                      <p>Admin/Teacher Login</p>
                    </div>
                  </div>
                </div>
                <div className="card-body login__card-body text-center">
                  <div className="login__card-inputs">
                    {errors && (
                      <Alert
                        className="login-alert"
                        dismissible
                        onClose={() =>
                          setErrors(false)
                        }
                        variant="danger"
                      >
                        {user.auth.payload.message}
                      </Alert>
                    )}

                    {isEmailSend && (
                      <Alert
                        className="login-alert"
                        dismissible
                        onClose={() => setIsEmailSend(false)}
                        variant="success"
                      >
                        We have sent a temporary password, Please check your email.
                      </Alert>
                    )}

                    <Formik
                      initialValues={initialValues}
                      validationSchema={validationSchema}
                      onSubmit={onSubmit}
                    >
                      {({ errors, status, touched }) => (
                        <Form className="login__card-form">
                          <div className="form-outline">
                            <label>Email</label>
                            <Field
                              name="email"
                              type="text"
                              className={
                                "form-control" +
                                (errors.email && touched.email
                                  ? " is-invalid"
                                  : "")
                              }
                            />
                          </div>
                          <div className="form-outline password">
                            <label>Password</label>
                            <Field
                              name="password"
                              type={passwordType}
                              className={
                                "form-control" +
                                (errors.password && touched.password
                                  ? " is-invalid"
                                  : "")
                              }
                            />

                            <button className="password-wrap" type="button">
                              {passwordType === 'password' ?
                                <ShowIconWhite className="cursor-pointer" onClick={() => setPasswordType('text')} />
                                : <HideIconWhite className="cursor-pointer" onClick={() => setPasswordType('password')} />
                              }
                            </button>

                          </div>

                          <div className="login__buttons">
                            <label className="form-check-label">
                              <a href="/reset-password" className="login__card-link">
                                Forgot Password?
                              </a>
                            </label>
                            <div className="d-flex">
                              <a
                                href={`https://clever.com/oauth/authorize?response_type=code&redirect_uri=${config.defaults.redirect_url}&client_id=${config.defaults.clever_client_id}`}
                                className="clever-button login__buttons-clever"
                              >
                                <span>C</span>
                                <hr />
                                <span>{isSubmittingClever ? "Logging..." : "Log In with Clever"}</span>
                              </a>
                              <button
                                className="btn login__card-btn"
                                type="submit"
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "Log In"}
                              </button>
                            </div>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-12 col-md-9 col-lg-7 col-xl-6 login__content-column p-0">
              <div className="login__info">
                <p className="mb-0">
                  If your school hasn’t signed up for 2022-23, please call (405)
                  842-8408.
                </p>
              </div>
            </div>
          </div>

          <Footer />

        </div>
      </section>
      <div style={{marginRight: "35px"}}>
        <PromptModal
            bodyText="Would you like us to send you a new temp password?"
            headerText="Temp Password Expired"
            cancelText="No"
            okText="Yes"
            isShow={modalShow}
            setModal={setModalShow}
            action={() => {onRequestResendPassword()}}
        />
        <SuccessModal
          isShow={showSuccessModal}
          headerText="Success"
          bodyText="A new Temporary password has been sent to your email. Please check your inbox and use the password."
          closeModal={() => setShowSuccessModal(false)}
        />
      </div>
    </>
  );
};

export default LoginPage;
