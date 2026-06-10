import PropTypes from 'prop-types';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from 'hooks/useAuth';
// material-ui
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';

// ============================|| JWT - LOGIN ||============================ //

export default function AuthLogin({ isDemo = false }) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <Formik
        initialValues={{
          username: '',
          password: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          username: Yup.string()
            .required('Username is required')
            .max(50),
          password: Yup.string()
            .required('Password is required')
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            await login(values.username, values.password);
            navigate('/dashboard/default');
          } catch (err) {
            console.error(err);
            setStatus({ success: false });
            setErrors({ submit: err.response?.data?.message || err.message || 'Invalid username or password' });
            setSubmitting(false);
          }
        }}
      >
  {({
    errors,
    handleBlur,
    handleChange,
    handleSubmit,
    touched,
    values
  }) => (
    <form
      noValidate
      onSubmit={handleSubmit}
    >
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel htmlFor="username-login">
              Username
            </InputLabel>

            <OutlinedInput
              id="username-login"
              type="text"
              value={values.username}
              name="username"
              onBlur={handleBlur}
              onChange={handleChange}
              placeholder="Enter username"
              fullWidth
              error={Boolean(
                touched.username &&
                errors.username
              )}
            />
          </Stack>

          {touched.username &&
            errors.username && (
              <FormHelperText error>
                {errors.username}
              </FormHelperText>
            )}
        </Grid>

        <Grid size={12}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel htmlFor="password-login">
              Password
            </InputLabel>

            <OutlinedInput
              fullWidth
              error={Boolean(
                touched.password &&
                errors.password
              )}
              id="password-login"
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              value={values.password}
              name="password"
              onBlur={handleBlur}
              onChange={handleChange}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={
                      handleClickShowPassword
                    }
                    onMouseDown={
                      handleMouseDownPassword
                    }
                    edge="end"
                    color="secondary"
                  >
                    {showPassword
                      ? <EyeOutlined />
                      : <EyeInvisibleOutlined />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </Stack>

          {touched.password &&
            errors.password && (
              <FormHelperText error>
                {errors.password}
              </FormHelperText>
            )}
        </Grid>

        {errors.submit && (
          <Grid size={12}>
            <FormHelperText error>{errors.submit}</FormHelperText>
          </Grid>
        )}

        <Grid size={12}>
          <AnimateButton>
            <Button
              type="submit"
              fullWidth
              size="large"
              variant="contained"
              color="primary"
            >
              Login
            </Button>
          </AnimateButton>
        </Grid>
      </Grid>
    </form>
  )}
</Formik>
    </>
  );
}

AuthLogin.propTypes = { isDemo: PropTypes.bool };
