import CreateSaleForm from "../../features/sales/create-sale-form";

export default function SalesPage() {
    return (
        <div
            style={{
                maxWidth: 600,
                margin: "40px auto",
                fontFamily: "sans-serif",
            }}
        >
            <h1>New Sale</h1>

            <CreateSaleForm />
        </div>
    );
}