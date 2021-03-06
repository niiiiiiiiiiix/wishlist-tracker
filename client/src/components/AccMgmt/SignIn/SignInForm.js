import "../SignInUp.css";
import { React, useContext } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useHistory } from "react-router-dom";
import UserContext from "../../../contexts/UserContext";

const SignInForm = () => {
  const history = useHistory();
  // console.log(process.env.REACT_APP_API_URL);
  // console.log(process.env);

  const { setUser } = useContext(UserContext);

  return (
    <Formik
      initialValues={{
        username: "",
        password: "",
      }}
      validationSchema={Yup.object().shape({
        username: Yup.string().required("Username is required"),
        password: Yup.string()
          .min(6, "Password must be at least 6 characters")
          .required("Password is required"),
      })}
      onSubmit={(values) => {
        axios
          .post(`${process.env.REACT_APP_API_URL}/user/login`, values, {
            withCredentials: true,
          })
          .then((response) => {
            // console.log(response);
            // console.log(response.data);
            // console.log(JSON.parse(response.config.data));
            setUser(response.data.user);
            alert("Log in success!");
            history.push("/wishlist");
          })
          .catch((error) => {
            alert("Error! Please try a different username or password!");
          });
      }}
    >
      {({ errors, status, touched }) => (
        <Form className="form">
          <div className="sub-form sf-login">
            <div className="all-form-inputs">
              <label htmlFor="username" className="form-label">
                username:
              </label>
              <Field
                name="username"
                type="text"
                className={
                  "form-input" +
                  (errors.username && touched.username ? " is-invalid" : "")
                }
                placeholder="enter your username"
              />
              <ErrorMessage
                name="username"
                component="div"
                className="invalid-feedback"
              />
            </div>
            <div className="all-form-inputs">
              <label htmlFor="password" className="form-label">
                password:
              </label>
              <Field
                name="password"
                type="password"
                className={
                  "form-input" +
                  (errors.password && touched.password ? " is-invalid" : "")
                }
                placeholder="enter your password"
              />
              <ErrorMessage
                name="password"
                component="div"
                className="invalid-feedback"
              />
            </div>
            <button type="submit" className="form-input-btn">
              sign in
            </button>
            <span className="form-input-login">
              don't have an account? sign up <a href="/sign-up">here</a>
            </span>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default SignInForm;
