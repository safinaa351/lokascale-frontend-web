# Lokatani API Tester

A user-friendly interface for testing and demonstrating the Lokatani IoT Weight and Image Management Backend API. Designed for operational teams, partners, and demos, this tool makes it easy to understand and interact with core Lokatani system features—no technical background required.

---

## 🎯 Purpose

**Lokatani API Tester** lets you experience the main capabilities of the Lokatani backend system as used in the field: from logging in, starting a weighing batch, sending weight data, uploading crop photos for automatic vegetable identification, to tracking sessions and device status. All in one simple, visual dashboard.

---

## 🛠️ Main Features

- **Easy Login:** Sign in with your credentials—just click and go!
- **Start Weighing Batch:** Begin a new weighing session, with support for different session types.
- **Send Weight Data:** Enter sample weight data and send it directly to your backend.
- **Vegetable Identification:** Upload vegetable photos for instant AI-powered identification.
- **Complete Sessions:** Mark weighing sessions as done.
- **History Tracking:** Instantly see weighing history and session details.
- **Device Monitoring:** Fetch active session info from connected IoT devices.
- **Real-time Feedback:** All actions provide clear, instant feedback and visual indicators.
- **Debug Console:** See all requests and responses in real time for transparency.

---

## 🚦 User Flow

1. **Open the Tester:** Launch the tool in your web browser.
2. **Login:** Enter your email and password, then click "Login". Authentication is required to access most features.
3. **Start a New Weighing Batch:** Choose your session type (such as "rompes" or "product") and, if needed, select the vegetable variety. Click "Initiate".
4. **Send Weight Data:** Enter weight details (like device ID, weight, unit, and session ID from your batch) and submit.
5. **Vegetable Identification:** Upload a vegetable image and specify the session ID to get instant identification results.
6. **Complete Session:** Finalize a weighing session by providing its session ID.
7. **Side Features:**
   - **Get Active Session:** Instantly retrieve any ongoing session from your IoT device.
   - **View Weighing History:** See your complete weighing session history.
   - **Get Session Details:** Look up details for any specific weighing session.
8. **Check Responses:** Results and responses appear clearly in the response panel for every action.
9. **Debug Console:** Watch all activity, requests, and status in the real-time debug area—great for transparency and troubleshooting.

---

## 📋 Available API Endpoints (Testable via the Interface)

- **/api/weighing/initiate** – Start a new weighing session
- **/api/iot/weight** – Send weight data
- **/api/ml/identify-vegetable** – Identify vegetables via photo upload
- **/api/weighing/complete** – Mark a session as complete
- **/api/iot/active-session** – Get current active session
- **/api/weighing/history** – View weighing history
- **/api/weighing/{session_id}** – Get specific session details

---