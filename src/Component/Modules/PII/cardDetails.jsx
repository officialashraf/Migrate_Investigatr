import { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useSelector } from "react-redux";
import axios from "axios";
import Cookies from "js-cookie";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LinkIcon from "@mui/icons-material/Link";
import styles from './cardDetails.module.css';
import { useOutletContext } from "react-router-dom";

const UserCards = () => {
   const { searchType,showHistory, piiMap } = useOutletContext();
  const { loading: reduxLoading, error: reduxError } = useSelector((state) => state.pii || {});
  const hasSearched = useSelector((state) => state.pii?.hasSearched || false);
  const profiles = useSelector((state) => state.pii?.data || []);


  const iconMap = {
    phones: PhoneIcon,
    emails: EmailIcon,
    addresses: LocationOnIcon,
    urls: LinkIcon,
  };
  if (reduxLoading) {
    return (
      <Container className={styles.loaderContainer}>
        <CircularProgress />
      </Container>
    );
  }

  if (reduxError) {
    return (
      <Container className={styles.errorContainer}>
        <Typography className={styles.errorMessage}>Error: {reduxError}</Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      className={styles.cardsContainer}
      sx={{ marginBottom: "10px" }}
    >
      <Grid container spacing={3}>
        {!hasSearched ? (
          // Before any search is performed
          <Typography
            variant="body1"
            sx={{
              color: "#94a3b8",
              textAlign: "center",
              width: "100%",
              mt: 2,
            }}
          >
            {searchType === 'phone number' ? '' : searchType === 'email' ? '' : ''}
          </Typography>
        ) : profiles.length > 0 ? (
          profiles.map((user, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card className={styles.userCard}>
                <CardContent>
                  {/* Avatar + Name */}
                  <div className={styles.userHeader}>
                    <Avatar
                      src={user.imageUrls?.[0]}
                      alt={
                        user.names?.[0] &&
                          typeof user.names[0] === "string" &&
                          !["none", "null", "undefined", "n"].includes(
                            user.names[0].toLowerCase()
                          )
                          ? user.names[0]
                          : ""
                      }
                      sx={{ width: 60, height: 60 }}
                    />
                    <div className={styles.userInfo}>
                      <Typography>
                        {
                          (() => {
                            let nameValue = "";

                            // Handle both string and array cases safely
                            if (Array.isArray(user.names)) {
                              nameValue = user.names[0];
                            } else if (typeof user.names === "string") {
                              const cleaned = user.names.trim();

                              // If it's JSON-like string [None,None], try to parse or skip
                              if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
                                try {
                                  const parsed = JSON.parse(cleaned.replace(/'/g, '"'));
                                  nameValue = Array.isArray(parsed) ? parsed[0] : "";
                                } catch {
                                  nameValue = "";
                                }
                              } else {
                                nameValue = cleaned;
                              }
                            }

                            // Filter invalid cases like [ , none, null, etc. ]
                            if (
                              !nameValue ||
                              ["none", "null", "undefined", "n", "[", "]"].includes(
                                String(nameValue).toLowerCase()
                              )
                            ) {
                              nameValue = user.user_displayname || "";
                            }

                            return nameValue;
                          })()
                        }

                      </Typography>
                    </div>
                  </div>

                  {Object.entries(user).map(([key, value]) => {
                    //  FIRST: Check if value itself has is_visible false
                    if (value?.is_visible === false) return null;

                    //  SECOND: Check if piiMap has this field marked as not visible
                    if (piiMap[key] && piiMap[key].is_visible === false) return null;

                    //  THIRD: Skip empty/invalid values
                    if (
                      key === "names" ||
                      !value ||
                      (typeof value === "string" && value.toLowerCase() === "none") ||
                      (Array.isArray(value) &&
                        (value.length === 0 ||
                          value.some(
                            (v) => typeof v === "string" && v.toLowerCase() === "none"
                          )))
                    )
                      return null;

                    const IconComponent = iconMap[key] || null;
                    const label = piiMap[key]?.display_name && piiMap[key].display_name.trim() !== ""
                      ? piiMap[key].display_name
                      : key
                        .charAt(0)
                        .toUpperCase() +
                      key
                        .slice(1)
                        .replace(/([A-Z])/g, " $1");

                    return (
                      <div key={key} className={styles.infoRow}>
                        <div className={styles.infoIconWrapper}>
                          {IconComponent && <IconComponent className={styles.infoIcon} />}
                        </div>
                        <div className={styles.infoText}>
                          <div className={styles.infoLabel}>{label}</div>
                          <div className={styles.infoValue}>
                            {Array.isArray(value) ? value[0] : value}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                </CardContent>
              </Card>
            </Grid>
          ))
        ) : !showHistory ? (
          <Typography
            variant="body1"
            sx={{
              color: "#94a3b8",
              textAlign: "center",
              width: "100%",
              mt: 3,
            }}
          >
            No records found. Try searching another one.
          </Typography>
        ) : null}
      </Grid>
    </Container>
  );
};

export default UserCards;