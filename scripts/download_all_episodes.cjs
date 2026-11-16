const fs = require('fs');
const path = require('path');
const https = require('https');

const EPISODES = [
  { id: 1, fileId: '1kxDyeFzjPLU6wgOGdTVQolE-kAPmYl8m', filename: 'live_smcf_promo_gulam.mp3' },
  { id: 2, fileId: '1xyVbDt044-i6u1ZzugYkQAMB5ezp3g8y', filename: 'career_talks_disha.mp3' },
  { id: 3, fileId: '1lGvbQStjXX0Mjr817YXwyLwJh8y5_h9g', filename: 'gyantime_social_media_anjali_laxita.mp3' },
  { id: 4, fileId: '19KrXRCnHVpZDq5W_mUPLg8FBMRoteRVZ', filename: 'gyantime_personality_development_diva.mp3' },
  { id: 5, fileId: '1HSvmXhtplfT2E7S1I-DeBvC0gsid4Wgm', filename: 'film_review_gandhari_ronit.mp3' },
  { id: 6, fileId: '11xRckI_gaMG1GFCmIWYnTNhRBfU_sFe9', filename: 'mastitime_anjali_laxita.mp3' },
  { id: 7, fileId: '1PUOLjm5R662VICd3oUOhdM6_x6_1q1m0', filename: 'film_review_the_vibe_ronit.mp3' },
  { id: 8, fileId: '1EL8bpxp5Nx7F21cgsssO1pzq53Ocoie3', filename: 'film_review_the_adom_project_ronit.mp3' },
  { id: 9, fileId: '1Dxfc8DnymQU9tTCRbNcyiVBut0vrxoMV', filename: 'film_review_the_vaan_ronit.mp3' },
  { id: 10, fileId: '15W3tfb3cLr_bfso443CQK6vOPvHc3sIR', filename: 'radio_rangmanch_ep1_disha.mp3' },
  { id: 11, fileId: '1w0a4l8MlFdQYX0IapQ7HNlw43lun0yJ4', filename: 'podcast_aditya_kumkum.mp3' },
  { id: 12, fileId: '18nCg3rEbGlU6AKTZFBuA0lTKU8J0Krir', filename: 'sports_talk_taekwondo_shipra.wav' },
  { id: 13, fileId: '1eGgCVyRotymAhhW0cljrMsEXnouiT_ka', filename: 'career_connect_ep1_sadiya.mp3' },
  { id: 14, fileId: '1rGWwYSFI-b17HhkomChqvTPz5akb9_43', filename: 'career_connect_ep3_rishi.mp3' },
  { id: 15, fileId: '1PQTwU37R-MUoViIaNLQoBNsBIVewrVmH', filename: 'career_talks_journalism_shivam.mp3' },
  { id: 16, fileId: '14RhKWr-wwR6Kd3JdYwZ-BFI79QdeRbRl', filename: 'career_talks_french_diva.mp3' },
  { id: 17, fileId: '1koOLVp-GuKj-mXfs2WbroQwBvg6E62qN', filename: 'music_show_amanrapper_shipra.mp3' },
  { id: 18, fileId: '193Y0Iyx4lXRVtAUqndBdxPQ9tt4jbyRu', filename: 'podcast_ghana_delegation_sakshi.mp3' },
  { id: 19, fileId: '15djwUd4CUSJ_MhpL74DIOzR6lRzg1-Fq', filename: 'career_connect_ep2_sadiya.mp3' },
];

const targetDir = path.join(__dirname, '..', 'public', 'audio');

function downloadFile(fileId, filename) {
  return new Promise((resolve, reject) => {
    const dest = path.join(targetDir, filename);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 100000) {
      console.log(`[SKIP] Already exists: ${filename} (${fs.statSync(dest).size} bytes)`);
      return resolve({ filename, size: fs.statSync(dest).size, status: 'existing' });
    }

    const url = `https://drive.usercontent.google.com/download?id=${fileId}&export=download`;
    console.log(`[START] Downloading ${filename} from Google Drive ID: ${fileId}...`);

    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 301) {
        https.get(res.headers.location, (redirectRes) => {
          pipeToFile(redirectRes, dest, resolve, reject, filename);
        }).on('error', reject);
      } else if (res.statusCode === 200) {
        pipeToFile(res, dest, resolve, reject, filename);
      } else {
        console.error(`[FAIL] ${filename} HTTP ${res.statusCode}`);
        resolve({ filename, status: 'error', code: res.statusCode });
      }
    }).on('error', (err) => {
      console.error(`[ERR] ${filename}:`, err.message);
      resolve({ filename, status: 'error', error: err.message });
    });
  });
}

function pipeToFile(resStream, dest, resolve, reject, filename) {
  const file = fs.createWriteStream(dest);
  resStream.pipe(file);
  file.on('finish', () => {
    file.close();
    const size = fs.existsSync(dest) ? fs.statSync(dest).size : 0;
    console.log(`[DONE] ${filename} saved (${size} bytes)`);
    resolve({ filename, size, status: 'downloaded' });
  });
  file.on('error', (err) => {
    fs.unlink(dest, () => {});
    reject(err);
  });
}

async function run() {
  console.log(`Downloading all 19 SMCF Radio Master recordings to ${targetDir}...`);
  for (const ep of EPISODES) {
    try {
      await downloadFile(ep.fileId, ep.filename);
    } catch (e) {
      console.error(`Failed ${ep.filename}:`, e);
    }
  }
  console.log('All downloads completed!');
}

run();
