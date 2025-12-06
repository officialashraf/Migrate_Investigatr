import React from "react";
import { Typography, Card, CardContent, Container, Grid } from "@mui/material";
import styles from "./cardDetails.module.css";
import { useOutletContext } from "react-router-dom";

const SummaryView = () => {
     const { data, piiMap } = useOutletContext();
      console.log("data", data);
    if (!data) return null;

    const { totalRecords, ...fields } = data;

    const renderList = (title, list) => {
        const label =
            piiMap[title]?.display_name && piiMap[title].display_name.trim() !== ""
                ? piiMap[title].display_name
                : title.charAt(0).toUpperCase() + title.slice(1);

        return (
            <Grid item xs={12} sm={6} md={4} key={title}>
                {/* Same card style as UserCards */}
                <Card className={styles.userCard}>
                    <CardContent>
                        <Typography
                            variant="h6"
                            sx={{
                                color: "#0073CF",
                                paddingBottom: "5px",
                                marginBottom: "10px",
                                fontSize: "12px",
                            }}
                        >
                            {label} ({list.length})
                        </Typography>

                        {/* Keep existing chip-style layout */}
                        <div
                            style={{
                                maxHeight: "300px",
                                overflowY: "auto",
                                scrollbarWidth: "thin",
                            }}
                        >
                            {list
                                .filter(
                                    (item) =>
                                        item &&
                                        typeof item === "string" &&
                                        item.trim() !== "" &&
                                        !["none", "null", "undefined", "n"].includes(
                                            item.trim().toLowerCase()
                                        )
                                )
                                .map((item, index) => (
                                    <span
                                        key={index}
                                        style={{
                                            display: "inline-block",
                                            backgroundColor: "#101D2B",
                                            color: "#D9D9D9",
                                            borderRadius: "15px",
                                            padding: "4px 8px",
                                            margin: "5px",
                                            fontSize: "12px",
                                            wordBreak: "break-all",
                                            border: "1px solid #3498db",
                                        }}
                                    >
                                        {item}
                                    </span>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            </Grid>
        );
    };

    const nonEmptyFields = Object.entries(fields).filter(
        ([, list]) => Array.isArray(list) && list.length > 0
    );

    return (
        <Container
            maxWidth="lg"
            className={styles.cardsContainer}
            sx={{ marginBottom: "10px" }}
        >
            <Grid container spacing={3}>
                {nonEmptyFields.length > 0 ? (
                    nonEmptyFields
                        .filter(([key]) => piiMap[key]?.is_visible !== false)
                        .map(([key, list]) => renderList(key, list))
                ) : (
                    <Typography
                        variant="body2"
                        sx={{
                            color: "#ccc",
                            marginTop: "20px",
                            width: "100%",
                            textAlign: "center",
                        }}
                    >
                        No valid data available.
                    </Typography>
                )}
            </Grid>
        </Container>
    );
};

export default SummaryView;
