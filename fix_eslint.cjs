const fs = require('fs');

function fixProfile() {
    let profile = fs.readFileSync('src/pages/Profile/Profile.jsx', 'utf8');
    profile = profile.replace(/import \{.*?registerLapTime.*?\} from '..\/..\/services\/api';/, "import { getUserProfile, updateUserProfile, getTracks, updateAvatar, deleteUserAccount, getUserLapTimes, getPendingInvitations, acceptChampionshipInvitation } from '../../services/api';");
    profile = profile.replace(/import \{ formatMsToTime, formatTimeInput, parseTimeToMs \} from '..\/..\/lib\/formatters';/, "import { formatMsToTime } from '../../lib/formatters';");
    profile = profile.replace(/const \[allTracks, setAllTracks\] = useState\(\[\]\);/, "const [, setAllTracks] = useState([]); // eslint-disable-line no-unused-vars");
    fs.writeFileSync('src/pages/Profile/Profile.jsx', profile);
}

function fixTrackDetail() {
    let detail = fs.readFileSync('src/pages/Tracks/TrackDetail.jsx', 'utf8');
    detail = detail.replace(/catch \(err\) \{/g, 'catch (_err) {');
    fs.writeFileSync('src/pages/Tracks/TrackDetail.jsx', detail);
}

function fixApi() {
    let api = fs.readFileSync('src/services/api.js', 'utf8');
    api = api.replace(/catch \(_\) \{/g, 'catch (_err) {');
    fs.writeFileSync('src/services/api.js', api);
}

function fixChampionshipDetail() {
    let cd = fs.readFileSync('src/pages/Championships/ChampionshipDetail.jsx', 'utf8');
    cd = cd.replace(/catch \(err\) \{/g, 'catch (_err) {');
    fs.writeFileSync('src/pages/Championships/ChampionshipDetail.jsx', cd);
}

function fixEditChampionship() {
    let ec = fs.readFileSync('src/pages/Championships/EditChampionship.jsx', 'utf8');
    ec = ec.replace(/catch \(err\) \{/g, 'catch (_err) {');
    fs.writeFileSync('src/pages/Championships/EditChampionship.jsx', ec);
}

function run() {
    fixProfile();
    fixTrackDetail();
    fixApi();
    fixChampionshipDetail();
    fixEditChampionship();
}

run();
