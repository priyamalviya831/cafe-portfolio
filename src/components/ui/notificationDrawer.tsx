import { useEffect, useMemo, useRef } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemText,
    Typography,
} from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
// import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
// import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import { usePost } from "@/utils/useApi";
import { socket } from "../../socket"
import { useAuth } from "../../context/AuthContext";
import { API_ROUTES } from "@/utils/api_constant";
import { useFetch } from "@/utils/useApi";
import { useLayout } from "@/context/LayoutContext";

type Notification = {
    _id: string;
    title: string;
    message: string;
    notificationType?: string;
    entityType?: string;
    adminId?: string | { _id?: string; id?: string };
    createdAt?: string;
    isRead?: boolean;
    isFallback?: boolean;
    fallbackKey?: string;
};

type User = {
    id?: string;
    _id?: string;
};

type Props = {
    open: boolean;
    onClose: () => void;
};

/* ================= CONSTANTS ================= */

/* ================= HELPERS ================= */

const formatDateTime = (value?: string) => {
    if (!value) return "";
    return new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
};

/* ================= COMPONENT ================= */

export function NotificationDrawer({ open, onClose }: Props) {
    const { user } = useAuth() as { user?: User };
    const { config } = useLayout();
    const adminId = config?.adminId?._id;
    const hasMarkedNotificationsRef = useRef(false);

    const notificationEndpoint = user?._id
        ? `${API_ROUTES.getCustomerNotifications}/${user._id}`
        : "";

    const { data, isLoading, refetch } = useFetch(
        "customer-notifications",
        notificationEndpoint,
        {},
        { enabled: !!(adminId && user?._id) },
    );
    
    const notifications: Notification[] = useMemo(
        () => data?.result?.results ?? data?.result ?? data?.data ?? [],
        [data],
    );
    const mergedNotifications = useMemo(
        () => notifications.slice(0, 20),
        [notifications],
    );

    /* ================= SOCKET ================= */

    useEffect(() => {
        if (!user?._id) return;

        socket.connect();
        socket.emit("join-customer", user._id.toString());

        const handleOrderStatusUpdated = () => {
            refetch();
        };

        const handleOrderItemStatusUpdated = () => {
            refetch();
        };

        socket.on("order_status_updated", handleOrderStatusUpdated);
        socket.on("order_item_status_updated", handleOrderItemStatusUpdated);

        return () => {
            socket.off("order_status_updated", handleOrderStatusUpdated);
            socket.off("order_item_status_updated", handleOrderItemStatusUpdated);
        };
    }, [user?._id, refetch]);

    useEffect(() => {
        if (open) refetch();
    }, [open]);

    /* ================= MUTATIONS ================= */

    const { mutate: markAllRead } = usePost(
        API_ROUTES.readAllCustomerNotifications,
        {
            onSuccess:()=>
            {
                refetch();
            },
            onError: () => {},
        }
    );
    useEffect(() => {
        if (!open) {
            hasMarkedNotificationsRef.current = false;
        }
    }, [open]);
    
    const handleMarkAllRead = () => {
        if (hasMarkedNotificationsRef.current) return;
        if (!adminId || !user?._id) return;
        if (!Array.isArray(mergedNotifications) || mergedNotifications.length === 0) return;

        hasMarkedNotificationsRef.current = true;
        markAllRead({
            adminId,
            customerId: user._id,
        } as any);
        refetch();
    };
    
    /* ================= UI ================= */

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: "100%", sm: 420 },
                    backgroundColor: "#f7f2ec",
                },
            }}
        >
            <Box
                sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Box
                    sx={{
                        p: 3,
                        borderBottom: "1px solid #e8ded3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: "#fbf7f1",
                    }}
                >
                    <Box>
                        <Typography
                            sx={{
                                fontFamily: "var(--font-display, serif)",
                                fontSize: "1.25rem",
                                fontWeight: 600,
                                color: "#3b2a1a",
                            }}
                        >
                            Notifications
                        </Typography>
                        <Typography sx={{ color: "#8b7a6a", fontSize: "0.9rem" }}>
                            Latest updates for your orders
                        </Typography>
                    </Box>
                    <Button
                        onClick={handleMarkAllRead}
                        size="small"
                        sx={{
                            textTransform: "none",
                            borderRadius: 999,
                            px: 2,
                            backgroundColor: "#3b2a1a",
                            color: "#fffaf3",
                            "&:hover": { backgroundColor: "#2c1f13" },
                        }}
                    >
                        Mark All Read
                    </Button>
                    <IconButton
                        onClick={onClose}
                        sx={{
                            border: "1px solid #eadfd2",
                            color: "#6a5543",
                            backgroundColor: "#fffaf3",
                            "&:hover": { backgroundColor: "#f2e7db" },
                        }}
                    >
                        ×
                    </IconButton>
                </Box>

                <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
                    {isLoading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                            <CircularProgress sx={{ color: "#9b7b5a" }} />
                        </Box>
                    ) : mergedNotifications.length === 0 ? (
                        <Box
                            sx={{
                                mt: 6,
                                textAlign: "center",
                                color: "#8b7a6a",
                            }}
                        >
                            <Typography
                                sx={{
                                    fontFamily: "var(--font-display, serif)",
                                    fontSize: "1rem",
                                    color: "#6a5543",
                                    mb: 1,
                                }}
                            >
                                No notifications yet
                            </Typography>
                            <Typography sx={{ fontSize: "0.9rem" }}>
                                Check back after placing an order.
                            </Typography>
                        </Box>
                    ) : (
                        <List sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {mergedNotifications.map((notification) => (
                                <ListItemButton
                                    key={notification._id}
                                    onClick={onClose}
                                    sx={{
                                        borderRadius: 3,
                                        border: "1px solid #eadfd2",
                                        backgroundColor: notification.isRead
                                            ? "#fdf9f4"
                                            : "#fff6ea",
                                        boxShadow: "0 12px 30px rgba(63, 44, 30, 0.08)",
                                        alignItems: "flex-start",
                                        "&:hover": {
                                            backgroundColor: "#f6ece0",
                                        },
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography
                                                sx={{
                                                    fontFamily: "var(--font-display, serif)",
                                                    fontSize: "1rem",
                                                    fontWeight: 600,
                                                    color: "#3b2a1a",
                                                }}
                                            >
                                                {notification.title}
                                            </Typography>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography
                                                    sx={{ color: "#6f5b4a", fontSize: "0.9rem", mt: 0.5 }}
                                                >
                                                    {notification.message}
                                                </Typography>
                                                {notification.createdAt && (
                                                    <Typography
                                                        sx={{
                                                            color: "#9b8a79",
                                                            fontSize: "0.75rem",
                                                            mt: 1,
                                                        }}
                                                    >
                                                        {formatDateTime(notification.createdAt)}
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    )}
                </Box>
            </Box>
        </Drawer>
    );
}

