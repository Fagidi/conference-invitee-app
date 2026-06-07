# Conference Invitee Reporter

A clean, mobile-friendly web app for recording conference invitees. Data is saved directly to Google Sheets via Google Apps Script.

---

## Project Structure

```
conference-invitee-app/
├── index.html              ← Main form UI
├── style.css               ← All styles
├── config.js               ← ⚙️ YOUR SETTINGS GO HERE
├── app.js                  ← App logic
├── google-apps-script.js   ← Paste into Google Apps Script editor
├── netlify.toml            ← Netlify deploy config
└── README.md
```

---

## Step 1 — Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a **new spreadsheet**.
2. Name it something like **"Conference Invitee Report 2025"**.
3. Leave the first tab as-is (the script will automatically create a "Responses" tab with headers on first use).
4. Copy the **Spreadsheet URL** — you'll need it in Step 2.

---

## Step 2 — Set Up Google Apps Script

1. In your Google Sheet, click **Extensions → Apps Script**.
2. Delete all the existing code in the editor.
3. Open `google-apps-script.js` from this project and **paste the entire contents** into the Apps Script editor.
4. Click **Save** (💾 icon or Ctrl+S). Name the project anything you like.

### Deploy as a Web App

5. Click **Deploy → New deployment**.
6. Click the ⚙️ gear icon next to "Type" and select **Web app**.
7. Fill in the settings:
   - **Description**: Conference Invitee Reporter
   - **Execute as**: Me
   - **Who has access**: **Anyone** ← Important! This allows the form to submit data.
8. Click **Deploy**.
9. Click **Authorize access** and follow the Google sign-in prompts. When you see "Google hasn't verified this app", click **Advanced → Go to [your project name] (unsafe)** and approve.
10. After deployment, copy the **Web app URL** — it looks like:
    ```
    https://script.google.com/macros/s/AKfycbXXXXXXXX.../exec
    ```

---

## Step 3 — Connect the App to Google Sheets

1. Open `config.js` in a text editor.
2. Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with the URL you copied in Step 2:
   ```js
   SCRIPT_URL: "https://script.google.com/macros/s/AKfycbXXXXX.../exec",
   ```
3. Save the file.

### Customize Cell Centres

In the same `config.js` file, edit the `CELL_CENTRES` array:
```js
CELL_CENTRES: [
  "City Centre",
  "North Campus",
  // add or remove entries as needed
]
```

---

## Step 4 — Deploy to Netlify

### Option A: Drag & Drop (Easiest)

1. Go to [app.netlify.com](https://app.netlify.com) and sign in (free account).
2. On the dashboard, find the **"Deploy manually"** section.
3. Drag your entire `conference-invitee-app` folder onto the page.
4. Netlify will deploy it instantly and give you a URL like `https://random-name.netlify.app`.

### Option B: Via GitHub (Recommended for updates)

1. Push this project folder to a GitHub repository.
2. In Netlify, click **Add new site → Import an existing project**.
3. Connect your GitHub account and select the repository.
4. Set:
   - **Build command**: *(leave blank)*
   - **Publish directory**: `.`
5. Click **Deploy site**.

### Custom Domain (Optional)

In Netlify: **Domain settings → Add custom domain** and follow the instructions.

---

## Making Changes After Deployment

### To update Cell Centres or the Script URL:
1. Edit `config.js`.
2. Re-deploy to Netlify (drag & drop again, or push to GitHub if using Option B).

### To re-deploy the Google Apps Script:
After making any changes to `google-apps-script.js`:
1. In the Apps Script editor, click **Deploy → Manage deployments**.
2. Click the ✏️ pencil edit icon on your existing deployment.
3. Change "Version" to **New version**.
4. Click **Deploy**. The URL stays the same.

---

## Google Sheet Columns

| Column | Description |
|--------|-------------|
| Timestamp | ISO date/time of submission |
| Inviter Name | Person submitting the report |
| Cell Centre Name | Selected from dropdown |
| Cell Leader's Name | Typed by the inviter |
| Invitee Name | One row per invitee |
| Form Number | e.g. F-001 |
| WhatsApp Number | Invitee's contact number |

Each submission creates **one row per invitee**, so a person who invites 5 people generates 5 rows (all sharing the same inviter details and timestamp).

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Submission fails | Check that the Script URL in `config.js` is correct and the Apps Script is deployed with "Anyone" access |
| Sheet not updating | Re-deploy the Apps Script as a new version |
| CORS error in console | Make sure "Who has access" is set to "Anyone" in the Apps Script deployment |
| Dropdown is empty | Make sure `config.js` loads before `app.js` in `index.html` |
