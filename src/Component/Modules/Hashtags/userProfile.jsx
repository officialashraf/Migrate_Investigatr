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

import LocationOnIcon from "@mui/icons-material/LocationOn";
import LinkIcon from "@mui/icons-material/Link";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ImageIcon from "@mui/icons-material/Image";
import { useSelector } from "react-redux";

import styles from "../PII/cardDetails.module.css";

const iconMap = {
    user_profile_location: LocationOnIcon,
    user_profile_url: LinkIcon,
    user_follower_count: PeopleIcon,
    user_following_count: PersonAddIcon,
    user_media_count: ImageIcon,
};

const UserProfile = () => {
    // const [loading, setLoading] = useState(false);
    // const [profiles, setProfiles] = useState([]);
    const { loading, data } = useSelector((state) => state.hashtagSearch);
    const profiles = data?.final_record_owner
        ? Array.isArray(data.final_record_owner)
            ? data.final_record_owner
            : [data.final_record_owner]
        : [];

    const formatEpochToLocal = (epoch) => {
        if (!epoch) return "-";

        // Auto detect seconds vs milliseconds
        const date = new Date(
            epoch.toString().length === 10 ? epoch * 1000 : epoch
        );

        return date.toLocaleString(); // system timezone format
    };

    // useEffect(() => {
    //     setLoading(true);

    //     setTimeout(() => {
    //         setProfiles([
    //             {
    //                 user_createdon: 1447586310000,
    //                 user_displayname: "gopal\ng t (Modi ka parivar)",
    //                 user_following_count: 7376,
    //                 user_profileid: "gopalgtgorur",
    //                 user_imageurl:
    //                     "https://pbs.twimg.com/profile_images/1558360858371059712/hqkn0-r8_400x400.jpg",
    //                 user_media_count: 66,
    //                 user_follower_count: 8955,
    //                 user_pk: 1,
    //                 user_uniqueid: "4244974454",
    //                 user_profile_url: "https://twitter.com/gopalgtgorur",
    //                 user_socialmedia_type: "X",
    //                 user_description:
    //                     "one should be true to oneself, we cannot change the world...",
    //                 user_profile_location: "India",
    //             },
    //         ]);
    //         setLoading(false);
    //     }, 500);
    // }, []);

    // if (loading) {
    //     return <CircularProgress />;
    // }
    // if (profiles.length === 0 && !loading) {
    //     return <Typography color="textSecondary" style={{ textAlign: 'center', marginTop: '20px' }}>No user profiles found.</Typography>;
    // }

    //     return (
    //         <Container maxWidth="lg">
    //             <Grid container >
    //                 {profiles.map((user, index) => (
    //                     <Grid item key={index}>
    //                         <Card className={styles.userCard}>
    //                             <CardContent>

    //                                 {/* HEADER */}
    //                                 <div className={styles.userHeader}>
    //                                     <Avatar
    //                                         src={profiles.user_imageurl}
    //                                         sx={{ width: 64, height: 64 }}
    //                                     />
    //                                     <Typography className={styles.userName}>
    //                                         {profiles.user_displayname || "Unknown User"}
    //                                     </Typography>
    //                                 </div>

    //                                 {/* AUTO FIELDS WITH ICON MAP */}
    //                                 {Object.entries(user).map(([key, value]) => {
    //                                     if (key === "user_imageurl" || value == null) return null;

    //                                     const Icon = iconMap[key];

    //                                     const label = key
    //                                         .replace(/_/g, " ")
    //                                         .replace(/\b\w/g, (c) => c.toUpperCase());

    //                                     return (
    //                                         <div key={key} className={styles.infoRow}>
    //                                             <div className={styles.infoIconWrapper}>
    //                                                 {Icon && <Icon className={styles.infoIcon} />}
    //                                             </div>
    //                                             <div className={styles.infoText}>
    //                                                 <div className={styles.infoLabel}>{label}</div>
    //                                                 <div className={styles.infoValue}>
    //                                                     {Array.isArray(value) ? value[0] : value}
    //                                                 </div>
    //                                             </div>
    //                                         </div>
    //                                     );
    //                                 })}

    //                             </CardContent>
    //                         </Card>
    //                     </Grid>
    //                 ))}
    //             </Grid>
    //         </Container>
    //     );
    // };

    // export default UserProfile;
    return (
        <Container maxWidth="lg">
            <Grid container >
                {profiles.map((user, index) => (
                    <Grid item key={index}>
                        <Card className={styles.userCard}>
                            <CardContent>

                                {/* HEADER */}
                                <div className={styles.userHeader}>
                                    <Avatar
                                        src={user.user_imageurl} // <-- 'profiles' ki jagah 'user' use karein
                                        sx={{ width: 64, height: 64 }}
                                    />
                                    <Typography style={{ color: 'white' }} className={styles.userName}>
                                        {user.user_displayname || "Unknown User"}
                                    </Typography>
                                </div>

                                {/* AUTO FIELDS WITH ICON MAP */}
                                {Object.entries(user).map(([key, value]) => {
                                    if (  key === "user_pk" ||    key === "user_imageurl" || key === "user_displayname" || value == null) return null; // user_displayname aur user_imageurl header mein use ho chuke hain

                                    const Icon = iconMap[key];
                                    const fieldLabelMap = {
                                        // user_pk: "User ID",
                                        user_createdon: "User Created On",
                                        user_profileid:"User Profile ID",
                                        user_uniqueid:"User Unique ID"
                                    };
                                    const label =
                                        fieldLabelMap[key] ||
                                        key
                                            .replace(/_/g, " ")
                                            .replace(/\b\w/g, (c) => c.toUpperCase());

                                    return (
                                        <div key={key} className={styles.infoRow}>
                                            <div className={styles.infoIconWrapper}>
                                                {Icon && <Icon className={styles.infoIcon} />}
                                            </div>
                                            <div className={styles.infoText}>
                                                <div className={styles.infoLabel}>{label}</div>
                                                <div className={styles.infoValue}>
                                                    {key === "user_createdon"
                                                        ? formatEpochToLocal(value)
                                                        : Array.isArray(value)
                                                            ? value[0]
                                                            : value}
                                                </div>

                                            </div>
                                        </div>
                                    );
                                })}

                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};


export default UserProfile;
