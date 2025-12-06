import "../Case/tableGlobal.css";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import Loader from "../Layout/loader";
import TableModal from "../../Common/Table/table";

const PIICatelog = () => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
 
    const fetchCatalog = async () => {
        try {
            setLoading(true);
            const token = Cookies.get("accessToken");
            const response = await axios.get(`${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/osint-man/v1/pii-catalogues`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            console.log("resposne from roles", response)
            setData(response.data);
            console.log("data from roles", response)
        } catch (error) {
            if (error.response?.data?.detail) {
                toast.error(error.response.data.detail);
            } else {
                console.error("An error occurred:", error.message);
            }
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        fetchCatalog();

        const handleDatabaseUpdated = () => {
            fetchCatalog();
        };

        window.addEventListener("databaseUpdated", handleDatabaseUpdated);
        return () => {
            window.removeEventListener("databaseUpdated", handleDatabaseUpdated);
        };
    }, []);


    const allowedKeys = ["group_name", "display_name", "is_visible","show_in_reports"];

    const handleSaveChanges = async (editedRows) => {
        const token = Cookies.get("accessToken");

        const rowsToUpdate = Object.entries(editedRows).map(([id, changes]) => {
            const cleanRow = { id: Number(id) };

            allowedKeys.forEach((key) => {
                if (changes[key] !== undefined) {
                    cleanRow[key] = changes[key];
                }
            });

            return cleanRow;
        });

        if (rowsToUpdate.length === 0) return;

        try {
            await axios.put(
                `${window.runtimeConfig.VITE_APP_API_OSINT_MAN}/api/osint-man/v1/pii-catalogues/batch-update`,
                { rows: rowsToUpdate },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            toast.success("Changes saved successfully!");
            fetchCatalog();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save changes.", error);
        }
    };

    if (loading) {
        return <Loader />
    }
    const roleColumns = [
        { key: "id", label: "Catalogue ID" },
        { key: "column_name", label: "Column Name" },
        { key: "display_name", label: "Display Name" },
        { key: "is_visible", label: "Visible" },
         { key: "show_in_reports", label: "Report" },
    ];

    return (
        <>
             <div>
                    <TableModal
                        title="Catalogue Dashboard"
                        data={data}
                        columns={roleColumns}
                        idPrefix="CAT"
                        btnTitle=" + Add New Catalogue"
                        editable={true}
                        onSaveChanges={handleSaveChanges}
                    />
                </div>
        </>
    );
};

export default PIICatelog;
