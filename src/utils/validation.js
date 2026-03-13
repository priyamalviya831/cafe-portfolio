import * as yup from "yup";

export const loginSchema = yup.object({
  name:yup.string()
  .required("Name is required"),
  phoneNumber: yup.string()
    .required("Phone number is required")
    .matches(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile number"),
    tableNumber: yup
    .string()
    .required("Table number is required"),
});

export const contactSchema = yup.object({
  firstName: yup
    .string()
    .required("Name is required"),
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  message: yup
    .string()
    .min(10, "Message should be at least 10 characters")
    .required("Message is required"),
});