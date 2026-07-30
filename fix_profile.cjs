const fs = require('fs');
let profile = fs.readFileSync('src/pages/Profile/Profile.jsx', 'utf8');
profile = profile.replace(/import \{ getUserProfile, updateUserProfile, getTracks, updateAvatar, deleteUserAccount \} from '..\/..\/services\/api';/, "import { getProfile, getUserLapTimes, registerLapTime, getTracks, getPendingInvitations, acceptChampionshipInvitation } from '../../services/api';");
fs.writeFileSync('src/pages/Profile/Profile.jsx', profile);
