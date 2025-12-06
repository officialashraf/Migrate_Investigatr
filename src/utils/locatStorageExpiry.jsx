const  SetupLocalStorageExpiry = () => {
  const expiryKey = "expiryMidnight";

  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);

  const savedExpiry = localStorage.getItem(expiryKey);

  if (savedExpiry && Date.now() > Number(savedExpiry)) {
    localStorage.clear();
  }

  localStorage.setItem(expiryKey, midnight.getTime());
}
export default SetupLocalStorageExpiry;