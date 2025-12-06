import "../Case/tableGlobal.css";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import Loader from "../Layout/loader";
import TableModal from "../../Common/Table/table";

const IPDRHeaderMapping = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchCatalog = async () => {
        try {
            setLoading(true);
            const token = Cookies.get("accessToken");
            const response = await axios.get(
                `${window.runtimeConfig.VITE_APP_API_IPDR}/api/ipdr-man/v1/mappings`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );
            console.log("Response from IPDR catalog:", response);
            setData(response.data);
        } catch (error) {
            if (error.response?.data?.detail) {
                toast.error(error.response.data.detail);
            } else {
                toast.error("Failed to fetch catalog data");
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

    // Keys that are allowed to be edited
    const allowedKeys = ["group_name", "display_name", "is_visible" ];

    // In your IPDRHeaderMapping component, update the handleSaveChanges function:

const handleSaveChanges = async (editedRows) => {
    const token = Cookies.get("accessToken");

    const rowsToUpdate = Object.entries(editedRows).map(([id, changes]) => {
        const cleanRow = { id: Number(id) };

        // Handle regular allowed keys
        allowedKeys.forEach((key) => {
            if (changes[key] !== undefined) {
                cleanRow[key] = changes[key];
            }
        });

        // Handle IPDR columns changes
        if (changes.ipdr_columns !== undefined) {
            cleanRow.ipdr_columns = changes.ipdr_columns;
        }

        // Handle IPDR options changes - convert back to array format
        if (changes.ipdr_columns_options !== undefined) {
            cleanRow.ipdr_columns = changes.ipdr_columns_options.map(option => option.value);
        }

        return cleanRow;
    });

    if (rowsToUpdate.length === 0) {
        toast.info("No changes to save");
        return;
    }

    try {
        setLoading(true);
        await axios.put(
            `${window.runtimeConfig.VITE_APP_API_IPDR}/api/ipdr-man/v1/mappings/batch-update`,
            { rows: rowsToUpdate },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        toast.success("Changes saved successfully!");
        fetchCatalog(); // Refresh data after successful update
    } catch (error) {
        console.error("Save error:", error);
        if (error.response?.data?.detail) {
            toast.error(error.response.data.detail);
        } else {
            toast.error("Failed to save changes");
        }
    } finally {
        setLoading(false);
    }
};

    if (loading) {
        return <Loader />;
    }

    // Column definitions - make sure these match your data structure
    const catalogColumns = [
        // { key: "id", label: "Catalogue ID" },
         { key: "entity_column", label: "Entity Column" },
          { key: "ipdr_columns", label: "IPDR Column" },
     ];

    return (
        <div>
            <TableModal
                title="IPDR Header Mapping"
                data={data}
                columns={catalogColumns}
                idPrefix="IPDR"
                btnTitle="+ Add New Catalog Entry"
                editable={true}
                reverseOrder={true}
                onSaveChanges={handleSaveChanges}
                searchPlaceholder="Search IPDR mappings..."
                caseTableWrapper={true}
            />
        </div>
    );
};

export default IPDRHeaderMapping;