import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  FormLabel,
  Grid,
} from "@mui/material";
import { useLayout } from "@/context/LayoutContext";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "../utils/validation";
import { PhoneCall, User, X } from "lucide-react";
import toast from "react-hot-toast";
import { usePost } from "@/utils/useApi";
import API_ROUTES from "@/utils/api_constant";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPopup({ open, onClose }) {
  const { config, tableNumber, setTableNumber, isFromQR, isPreview, isLoginOpen, setIsLoginOpen } = useLayout();
  const { setUser } = useAuth();

  if (isPreview) return null;

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: "all",
    defaultValues: {
      name: "",
      phoneNumber: "",
      tableNumber: "",
    },
  });

  useEffect(() => {
    if (isFromQR && tableNumber) {
      setValue("tableNumber", tableNumber);
    }
  }, [isFromQR, tableNumber, setValue]);

  const { login } = useAuth();
  const adminId = config?.adminId?._id;

  const { mutate, isPending } = usePost(API_ROUTES.createCustomer, {
    onSuccess: (response) => {
      login(response.result, adminId);
      // setUser(response.result);
      toast.success(`Welcome to ${config.adminId.cafeName}!`);
      onClose();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Login failed");
    },
  });

  const onSubmit = (data) => {
    delete data.tableNumber; // Remove tableNumber from payload
    mutate({ ...data, adminId: config.adminId._id });
    setIsLoginOpen(false);
  };

  if (isPreview) return null;
  // if (isPreview || isLayoutFromQR) return null;

  return (
    <Dialog open={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
      <DialogTitle className="font-bold border flex justify-between items-center">
        <p className="text-center"> Welcome to {config?.logo} </p>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="m-2">
          <p className="text-sm text-gray-500 mb-3 text-center">
            Enter your details to continue
          </p>

          <Grid container spacing={3}>
            <Grid size={12}>
              <FormLabel>Table No:</FormLabel>
              <Controller
                name="tableNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    disabled={isFromQR}
                    error={!!errors.tableNumber}
                    helperText={errors.tableNumber?.message}
                    placeholder={isFromQR ? "" : "Enter table number"}
                    onChange={(e) => {
                      field.onChange(e);
                      setTableNumber(e.target.value);
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={12}>
              <FormLabel>Name:</FormLabel>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <User />
                        </InputAdornment>
                      ),
                    }}
                    placeholder="Enter your Name"
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <FormLabel>Phone Number:</FormLabel>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneCall />
                        </InputAdornment>
                      ),
                    }}
                    placeholder="Enter your Number"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions className="px-6 pb-4">
          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={isPending}
          >
            Continue
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
