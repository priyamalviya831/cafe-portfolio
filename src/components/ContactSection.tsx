import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  Facebook,
  User,
  Twitter,
} from "lucide-react";
import { useLayout } from "@/context/LayoutContext";
import { Button } from "@/components/ui/button";

import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { contactSchema } from "../utils/validation";
import { InputAdornment, TextField } from "@mui/material";
import { LAYOUTS } from "@/utils/constants";
import emailjs from "@emailjs/browser";
import toast from "react-hot-toast";

export function ContactSection() {
  const { layoutType, config } = useLayout();
  const isElegant = layoutType === LAYOUTS.ELEGANT;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(contactSchema),
    mode: "all",
    defaultValues: {
      firstName: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      // safety check
      if (!config?.adminId?.email) {
        console.error("Admin email not found");
        return;
      }

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: data.firstName,
          from_email: data.email,
          message: data.message,
          to_email: config.adminId.email,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      toast.success("Message sent successfully!");
      reset();
    } catch (error) {
      toast.error(error.message ?? "failed to send message");
    }
  };

  return (
    <section id="contact" className="py-20 md:py-32 bg-secondary/50">
      <div className="container mx-auto px-4">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          {isElegant ? (
            <>
              <span className="text-accent text-sm uppercase tracking-[0.3em] mb-3 block">
                Get in Touch
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-medium">
                Visit Us
              </h2>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-full mb-4">
                <span>📍</span>
                <span className="text-sm font-medium">Contact</span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold">
                Come Say Hello!
              </h2>
            </>
          )}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* CONTACT INFO */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <InfoItem icon={MapPin} title="Address" value={config?.adminId?.address} />
            <InfoItem icon={Phone} title="Phone" value={config?.adminId?.phoneNumber} />
            <InfoItem icon={Mail} title="Email" value={config?.adminId?.email} />
            <InfoItem
              icon={Clock}
              title="Hours"
              value={`Mon-Fri: ${config?.adminId?.hours?.weekdays} | Sat-Sun: ${config?.adminId?.hours?.weekends}`}
            />

            <div className="flex gap-4 pt-4">
              {config?.adminId?.socialLinks?.instagram && (
                <a
                  href={config?.adminId?.socialLinks?.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-card rounded-full"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {config?.adminId?.socialLinks?.facebook && (
                <a
                  href={config?.adminId?.socialLinks?.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-card rounded-full"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {config?.adminId?.socialLinks?.twitter && (
                <a
                  href={config?.adminId?.socialLinks?.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-card rounded-full"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
            </div>
          </motion.div>

          {/* CONTACT FORM */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`p-6 md:p-8 ${isElegant ? "bg-card" : "bg-card rounded-2xl shadow-card"
              }`}
          >
            <h3 className="font-display text-xl font-medium mb-6">
              Send us a message
            </h3>

            <form onSubmit={handleSubmit(onSubmit, (formErrors) => { console.log("FORM ERRORS:", formErrors); })} className="space-y-6 ">

              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Name"
                    fullWidth
                    size="small"
                    error={!!errors.firstName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <User />
                        </InputAdornment>
                      ),
                    }}
                    placeholder="Enter your name"
                  />
                )}
              />
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email Address"
                    type="email"
                    size="small"
                    error={!!errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <User />
                        </InputAdornment>
                      ),
                    }}
                    placeholder="Enter your email"
                  />
                )}
              />

              <Controller
                name="message"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Your Message"
                    multiline
                    rows={4}
                    error={!!errors.message}
                  />
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className={`w-full ${isElegant
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-accent-foreground rounded-xl"
                  }`}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* Small helper to clean JSX */
function InfoItem({ icon: Icon, title, value }) {
  return (
    <div className="flex gap-4 p-4 bg-card rounded-xl">
      <Icon className="h-6 w-6 text-accent mt-1" />
      <div>
        <h4 className="font-medium mb-1">{title}</h4>
        <p className="text-muted-foreground text-sm">{value}</p>
      </div>
    </div>
  );
}
