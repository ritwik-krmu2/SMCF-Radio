# SMCF Radio — Station Administrator Operational Manual
**School of Emerging Media, Communication and Film Studies · SGT University**

---

## 1. Introduction
This manual provides standard operating procedures (SOPs) for station managers, faculty supervisors, and student production heads administering the SMCF Radio 90.4 MHz digital campus broadcasting platform.

---

## 2. Accessing the Administration Console

1. Navigate to the platform at `http://localhost:3000` (or production URL).
2. Click **"Admin"** in the top navigation bar or access `#/admin`.
3. If not already authenticated as an administrator, enter your station credentials:
   - **Station Director Account**: `admin@smcf.edu.in`
   - **Password**: `admin123`
4. The system validates your credentials and unlocks the Administrative Control Suite.

---

## 3. Daily Live Broadcast Operations

### Studio Feed Metadata Override
During live campus studio sessions (e.g. Friday live broadcasts, special faculty interviews, guest lectures):
1. In the Admin Console, open the **"Overview"** tab.
2. Scroll to the **"Studio Master Broadcast Feed Override"** panel.
3. Enter the active **Live Broadcast Title** (e.g., *"Chancellor's Address & Campus Convocation Live"*).
4. Enter the active **Anchor / RJ Name** (e.g., *"RJ Priya & RJ Rahul"*).
5. Click **"Broadcast Metadata to Station"**.
6. The metadata updates immediately for all connected student listeners on the `NowPlayingBar`.

---

## 4. Episode Vault & Approval Management

Student RJs submit recorded master audio files through the **RJ / Creator Studio**. As an administrator:
1. Open the **"Episodes"** tab.
2. Review newly submitted recordings. Click the **Play** button to audition the audio.
3. If the audio adheres to campus broadcast quality and editorial guidelines:
   - Click **"Approve & Publish"**.
   - The episode status updates to `published` and instantly appears in the public **Shows & Programs** directory and **Master Episode Vault**.
4. To archive or unpublish an episode, click **"Mark Draft"**.
5. To permanently delete an invalid or superseded episode, click the **Trash** icon.

---

## 5. Broadcast Schedule Management

To update the daily or weekly 90.4 MHz programming grid:
1. Open the **"Schedule"** tab.
2. Under **"Schedule New Broadcast Slot"**:
   - Enter the **Time Slot** (e.g., `04:00 PM — 05:00 PM`).
   - Enter the **Show Title** (e.g., `Campus Buzz: Weekly Sports Round`).
   - Enter the **Lead Broadcaster** (e.g., `RJ Ananya`).
   - Click **"Add Slot to Schedule"**.
3. To update the live status of any slot, select the status dropdown:
   - `Live`: Highlights the show as actively on-air with animated pulse badge.
   - `Next`: Flags the show as upcoming.
   - `Done`: Marks the show as completed.
   - `Scheduled`: Standard queued slot.

---

## 6. Friday Song Request Moderation

Students submit music requests and dedications through the **Student Portal**.
1. Open the **"Song Requests"** tab.
2. Review the track title, artist, and student dedication note.
3. Action buttons:
   - **Approve**: Marks the request as verified and safe for broadcast.
   - **Queue for Friday**: Signals the on-air DJ that this track is selected for the Friday live set.
   - **Dismiss**: Silently discards inappropriate or copyrighted requests.
4. The submitting student will see the updated status badge live in their personal Student Portal.

---

## 7. Community Comment Moderation

1. Open the **"Comments"** tab.
2. Read listener reviews and feedback.
3. Click **"Approve"** to publish to the community feed, or **"Remove"** to unpublish inappropriate content.

---

## 8. Publishing Campus Bulletins

1. Open the **"Announcements"** tab.
2. Provide the bilingual notice text:
   - **Notice in English**: (e.g., *"SMCF Radio Studio audition registrations open for Semester 2!"*)
   - **Notice in Hindi**: (e.g., *"एसएमसीएफ रेडियो स्टूडियो ऑडिशन रजिस्ट्रेशन शुरू!"*)
3. Click **"Broadcast Announcement"**.
4. The notice appears immediately on the animated **CampusTicker** across all pages of the public site.

---

## 9. User Roles & Permission Management

1. Open the **"Users"** tab.
2. Browse the student and faculty directory.
3. In the **"Switch Role"** column, change an account's role:
   - `student`: Standard listener access.
   - `rj`: Unlocks the **RJ / Creator Studio** for episode production.
   - `admin`: Grants full station operational control.

---

## 10. Security & Audit Trail Inspection

1. Open the **"Audit Logs"** tab.
2. Review the chronological record of all administrative actions, timestamps, actor accounts, and system updates.
3. Audit logs ensure accountability across student production teams.

