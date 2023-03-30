import { FC, useEffect, useState } from 'react';
import cx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import MuiInputAdornment from '@mui/material/InputAdornment';
import { useNavigate } from 'react-router';
import { useFormik } from 'formik';

// components
import { Input } from '@confidant-health/lib/ui/atoms/input';
import {
  fontWeight,
  Heading,
  headingLevel,
  Text,
  TextError,
  textLevel,
} from '@confidant-health/lib/ui/atoms/typography';
import { colors } from '@confidant-health/lib/colors';
import { Icons } from '@confidant-health/lib/icons';
import { btnType, Button } from '@confidant-health/lib/ui/atoms/button';
import { getAuth } from 'redux/modules/auth/selectors';
import { authActionCreators } from 'redux/modules/auth/actions';
import { LoginType } from 'constants/CommonConstants';

import { LoginSchema } from './LoginSchema';
// styles
import { useStyles } from './Login.styles';
import './login.css';

const Login: FC = () => {
  const [showPassword, setShowPassword] = useState(true);
  const { isLoading, isAuthenticated, errorMsg } = useSelector(getAuth);
  const dispatch = useDispatch();
  const formik = useFormik({
    initialValues: {
      type: LoginType.PROVIDER,
      email: '',
      password: '',
    },
    validationSchema: LoginSchema,
    onSubmit: values => {
      dispatch(authActionCreators.login(values));
    },
  });
  const classes = useStyles();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated]);

  const switchLogin = () => {
    formik.handleChange({
      target: {
        name: 'type',
        value: formik.values.type === LoginType.ADMIN ? LoginType.PROVIDER : LoginType.ADMIN,
      },
    });
  };

  const onClickEye = () => {
    setShowPassword(!showPassword);
  };

  const onBlurInput = async e => {
    await formik.setFieldTouched(e.target.name);
  };

  return (
    <div className={cx({ [classes.root]: true })}>
      <div className={classes.leftContainer}>
        <img src="/images/login-bg.png" alt="Login background" className={classes.loginBackground} />
      </div>

      <div className={classes.rightContainer}>
        <div className={classes.loginContainer}>
          <div className={classes.loginContent}>
            <div className={classes.loginHeader}>
              <Heading level={headingLevel.L} weight={fontWeight.BOLD} className={classes.headerText}>
                Log in as{' '}
                {formik.values.type === LoginType.ADMIN ? LoginType.ADMIN_LABEL : LoginType.PROVIDER_LABEL}
              </Heading>
              <Button variant={btnType.OUTLINE} className={classes.outlineBtn} onClick={switchLogin}>
                Log in as{' '}
                {formik.values.type === LoginType.ADMIN ? LoginType.PROVIDER_LABEL : LoginType.ADMIN_LABEL}
              </Button>
            </div>
            <form onSubmit={formik.handleSubmit} className={classes.form}>
              <div className={classes.inputContainer}>
                <Text level={textLevel.S} weight={fontWeight.SEMI_BOLD}>
                  Email
                </Text>
                <Input
                  className={classes.input}
                  placeholder="Enter your email"
                  name="email"
                  onChange={formik.handleChange}
                  onBlur={onBlurInput}
                  InputProps={{
                    startAdornment: (
                      <MuiInputAdornment position="start">
                        <Icons glyph="email-outlined" color={colors.neutral500} />
                      </MuiInputAdornment>
                    ),
                  }}
                />
                <TextError errorMsg={formik.touched.email ? formik.errors.email?.toString() : null} />
              </div>
              <div className={classes.inputContainer}>
                <Text level={textLevel.S} weight={fontWeight.SEMI_BOLD}>
                  Password
                </Text>
                <Input
                  className={classes.input}
                  name="password"
                  placeholder="Enter your password"
                  type={showPassword ? 'password' : 'text'}
                  onChange={formik.handleChange}
                  onBlur={onBlurInput}
                  InputProps={{
                    startAdornment: (
                      <MuiInputAdornment position="start">
                        <Icons glyph="password-lock" color={colors.neutral500} />
                      </MuiInputAdornment>
                    ),
                    endAdornment: (
                      <MuiInputAdornment position="end">
                        <Icons
                          glyph="eye-outlined"
                          className={classes.eye}
                          color={colors.neutral500}
                          onClick={onClickEye}
                        />
                      </MuiInputAdornment>
                    ),
                  }}
                />
                <TextError errorMsg={formik.touched.password ? formik.errors.password?.toString() : null} />
              </div>
              {errorMsg && (
                <div className={classes.inputContainer}>
                  <Text className={classes.errorText} level={textLevel.S}>
                    {errorMsg}
                  </Text>
                </div>
              )}
              <div className={classes.inputContainer}>
                <Button className={classes.buttonContainer} onClick={formik.handleSubmit}>
                  {isLoading ? (
                    <Icons className="rotate linear infinite" glyph="in-progress" color={colors.white} />
                  ) : (
                    'Login'
                  )}
                </Button>
              </div>
            </form>
            <div className={classes.inputContainer}>
              <Button variant={btnType.TEXT} className={classes.buttonTextContainer}>
                Forgot password?
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Login };
