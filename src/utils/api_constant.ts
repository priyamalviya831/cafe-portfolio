const API_ROUTES = {
    createCustomer: "customer/create",
    // getLayoutById: 'layout/portfolio',
    getTableByQr: 'qr/scan',
    placeOrder: "order/public/create",
    getCustomerOrder: "order/my-orders",
    getActiveLayout: "layout/active",
    getLayoutById:"layout/get-layout",
    getCafeStats: "portfolio/about-stats",
    submitFeedback: "portfolio/customer-feedback",
    topFeedback: "portfolio/top-feedback",

    getExistingOrder :"order/active",
    updateOrderItem: "order/public/item-quantity",
    deleteOrderItem: "order/public/item"
}
export {API_ROUTES};
