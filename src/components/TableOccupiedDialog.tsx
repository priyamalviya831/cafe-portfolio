import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Divider,
} from "@mui/material";

type Customer = {
    _id: string;
    name: string;
};

type OrderItem = {
    _id: string;
    name: string;
    price: number;
    quantity: number;
    menuId: {
        name: string;
        price: number;
        discountPrice?: number;
    };
    customerId: {
        _id: string;
        name: string;
    };
};

type Order = {
    items: OrderItem[];
    totalAmount: number;
    gstAmount?: number;
    subTotal?: number;
    gstPercent?: number;
};

type Props = {
    open: boolean;
    order: Order | null;
    onClose: () => void;
    onAddItems: () => void;
};

export function TableOccupiedDialog({
    open,
    order,
    onClose,
    onAddItems,
}: Props) {

    const groupedOrders = order?.items?.reduce<Record<string, OrderItem[]>>(
        (acc, item) => {
            const name = item.customerId?.name || "Guest";

            if (!acc[name]) acc[name] = [];

            acc[name].push(item);

            return acc;
        },
        {}
    );

    return (
        <Dialog open={open}
            onClose={(event, reason) => {
                if (reason === "backdropClick" || reason === "escapeKeyDown") {
                    return;
                }
                onClose();
            }}
            disableEscapeKeyDown
            maxWidth="sm" fullWidth>
            <DialogTitle fontWeight={700}>Table Already Ordering</DialogTitle>
            <DialogContent>
                <Box
                    sx={{
                        backgroundColor: "#FFF4E5",
                        border: "1px solid #FFD8A8",
                        borderRadius: 2,
                        px: 2,
                        py: 1.5,
                        mb: 2,
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, color: "#9A3412" }}
                    >
                        ⚡ This table is already occupied. Your items will be added to the ongoing order.
                    </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {Object.entries(groupedOrders || {}).map(([customer, items]) => (
                    <Box key={customer} mb={2}>
                        <Typography fontWeight={600}>{customer}</Typography>

                        {items.map((item) => (
                            <Box
                                key={item._id}
                                display="flex"
                                justifyContent="space-between"
                                ml={2}
                                py={0.5}
                            >
                                <Typography>
                                    {item.quantity} × {item.menuId.name}
                                </Typography>

                                <Typography>
                                    ₹{item.quantity * (item.menuId.discountPrice ?? item.menuId.price)}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                ))}

                <Divider sx={{ mt: 2 }} />

                <Box mt={2}>
                    <Box display="flex" justifyContent="space-between" py={0.5}>
                        <Typography color="text.secondary" variant="body2">Subtotal</Typography>
                        <Typography>₹{order?.subTotal}</Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between">
                        <Typography color="text.secondary" variant="body2">
                            GST ({order?.gstPercent}%)
                        </Typography>
                        <Typography>₹{order?.gstAmount?.toFixed(2)}</Typography>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Box display="flex" justifyContent="space-between">
                        <Typography fontWeight={700}>Total</Typography>
                        <Typography fontWeight={700}>
                            ₹{order?.totalAmount}
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button variant="contained" onClick={onAddItems}>
                    Continue Ordering
                </Button>
            </DialogActions>
        </Dialog>
    );
}