# AI Controller Workflow Documentation

## Overview

This n8n workflow (`AI_Controller`) automatically checks for missing daily reports (tasks.md, plans.md, daily.md) in Dropbox and issues yellow cards to employees who haven't submitted required files.

**Schedule**: Runs daily at 11:00 AM (Europe/Kyiv timezone)

**Workflow URL**: `https://dashboard-eight-beta-59.vercel.app/api/give-card`

---

## Workflow Flow

### 1. Schedule Trigger
- **Node**: `Schedule Trigger`
- **Type**: `n8n-nodes-base.scheduleTrigger`
- **Schedule**: Daily at 11:00
- **Purpose**: Starts the workflow automatically

---

### 2. Initialize Discord Email List
- **Node**: `Code3`
- **Type**: `n8n-nodes-base.code`
- **Purpose**: Stores a static mapping of Discord users (name, display_name, discord_id) in global workflow static data
- **Data**: Contains 50+ employee mappings for matching Dropbox names to Discord IDs
- **Output**: Confirmation message with count of saved entries

**Key Data Structure**:
```javascript
staticData.emailList = [
  { name: "zasyadko3434", display_name: "Matvii Zasiadko", discord_id: "1403380706046230548" },
  // ... 50+ more entries
];
```

---

### 3. Dropbox File Listing
- **Nodes**: 
  - `Dropbox - List Folder` (initial request)
  - `Dropbox - Continue` (pagination if needed)
  - `Edit Fields` (extracts entries, cursor, has_more)
  - `If1` (checks if more pages exist)
  - `Merge` (combines all pages)
- **Purpose**: Recursively lists all files in `/Nov25` directory on Dropbox
- **API Endpoint**: `https://api.dropboxapi.com/2/files/list_folder`
- **Pagination**: Continues fetching if `has_more === true` using cursor

**Request Body**:
```json
{
  "path": "/Nov25",
  "recursive": true,
  "include_deleted": false
}
```

---

### 4. Filter Today's Files
- **Node**: `Code`
- **Type**: `n8n-nodes-base.code`
- **Purpose**: Filters files from Dropbox to only include today's date and required file types
- **Logic**:
  - Extracts day number from today's date (e.g., "03" for November 3rd)
  - Filters files where path contains `/{day}/` AND filename ends with:
    - `plans.md`
    - `daily.md`
    - `task.md`
- **Output**: Array of files with metadata:
  - `file_name`: Original filename
  - `path_display`: Full Dropbox path
  - `employee`: Extracted from path (4th segment)
  - `department`: Extracted from path (3rd segment)

**Path Structure**: `/Nov25/<Department>/<Employee>/<Day>/<filename>`

---

### 5. Download Files from Dropbox
- **Node**: `Dropbox`
- **Type**: `n8n-nodes-base.dropbox`
- **Operation**: `download`
- **Purpose**: Downloads content of each filtered file
- **Output**: File content in base64 format + metadata

---

### 6. Analyze File Status
- **Node**: `Code1`
- **Type**: `n8n-nodes-base.code`
- **Purpose**: Determines which employees are missing tasks.md, plans.md, or daily.md files
- **Logic**:
  - Groups files by employee name (extracted from path)
  - Checks if each file type exists AND has content (>50 bytes)
  - Creates status object: `{ employee, tasks: boolean, plans: boolean, daily: boolean }`
- **Output**: Array of employees with their submission status

**Example Output**:
```json
{
  "employees": [
    { "employee": "Zasiadko Matvii", "tasks": true, "plans": false, "daily": true },
    { "employee": "Iskandarova Anush", "tasks": false, "plans": false, "daily": true }
  ]
}
```

---

### 7. Match Employees to Discord Users
- **Node**: `Code2`
- **Type**: `n8n-nodes-base.code`
- **Purpose**: Matches employee names from Dropbox to Discord users using fuzzy matching algorithm
- **Matching Strategy** (priority order):
  1. **Exact match** (normalized): `display_name` or `username` = employee name → Score 1000/900
  2. **All words match**: All employee name parts found in Discord name → Score 500/400
  3. **First + Last name match**: Both first and last words match → Score 300
  4. **Partial word matches**: Individual word matches → Score 50/40/30/25/20/15
  5. **Prefix match**: First 3-4 letters match → Score 10
- **Minimum Score**: 50 required for valid match
- **Filtering**: Only processes employees missing `tasks` OR `plans` (not both)
- **Output**: Report array with:
  - `employee`: Name from Dropbox
  - `discord_name`: Matched Discord username
  - `discord_display_name`: Matched Discord display name
  - `discord_id`: Discord user ID for mentions
  - `missing`: Comma-separated list (e.g., "tasks, plans")
  - `match_score`: Confidence score (for debugging)

---

### 8. Split Report into Individual Items
- **Node**: `Code4`
- **Type**: `n8n-nodes-base.code`
- **Purpose**: Converts report array into separate workflow items (one per employee)
- **Output**: Each employee becomes a separate item for processing

---

### 9. Loop Over Items
- **Node**: `Loop Over Items`
- **Type**: `n8n-nodes-base.splitInBatches`
- **Purpose**: Processes each employee sequentially
- **Batch Size**: 1 (one at a time)

---

### 10. Send Discord Notification
- **Node**: `Discord Webhook`
- **Type**: `n8n-nodes-base.httpRequest`
- **Method**: POST
- **URL**: Discord webhook endpoint
- **Purpose**: Sends personalized warning message to employee
- **Message Format**:
  ```
  @<discord_id> ⚠️ **Warning!**
  
  We couldn't find your **<missing>**.
  
  You've received a **🟨 Yellow Card**. Please submit your report today!
  ```
- **Mention Logic**: If `discord_id !== '-'`, uses `<@discord_id>` mention; otherwise uses bold employee name

---

### 11. Issue Yellow Card via API
- **Node**: `HTTP Request`
- **Type**: `n8n-nodes-base.httpRequest`
- **Method**: POST
- **URL**: `https://dashboard-eight-beta-59.vercel.app/api/give-card`
- **Purpose**: Automatically issues yellow card in the dashboard system
- **Request Body**:
  ```json
  {
    "name": "<employee name from Dropbox>",
    "type": "Workflow",
    "comment": "Missing: <tasks/plans/daily>"
  }
  ```
- **Response**: `{ "success": true, "employeeId": <id> }` or error

---

## API Endpoint Details

### POST `/api/give-card`

**Request**:
```json
{
  "name": "Zasiadko Matvii",  // Required (or use employeeId)
  "type": "Workflow",          // Required: "Documentation" | "Workflow" | "Communication"
  "comment": "Missing: tasks"  // Optional
}
```

**Response** (Success):
```json
{
  "success": true,
  "employeeId": 30
}
```

**Response** (Error):
```json
{
  "error": "Employee not found"
}
```

**Error Codes**:
- `400`: Missing required fields
- `404`: Employee not found
- `409`: Ambiguous name (multiple matches)
- `500`: Internal server error

---

## Workflow Configuration

### Schedule
- **Trigger Time**: 11:00 AM (Europe/Kyiv)
- **Frequency**: Daily
- **Timezone**: Europe/Kyiv

### Credentials Required
- **Dropbox API**: Bearer token (stored in workflow)
- **Discord Webhook**: Webhook URL (stored in workflow)

### Static Data
- **Global**: `emailList` - Array of Discord user mappings (50+ entries)

---

## Matching Algorithm Details

### Normalization
- Converts to lowercase
- Removes special characters: `'`, `'`, `` ` ``
- Normalizes whitespace

### Scoring System
1. **Exact Match (1000/900)**: Highest priority
2. **Full Word Match (500/400)**: All employee words found
3. **Name Pair Match (300)**: First + last name match
4. **Partial Match (50-15)**: Individual word overlaps
5. **Prefix Match (10)**: First 3-4 letters match

### Minimum Threshold
- **Required Score**: ≥ 50 for valid match
- **No Match**: If score < 50, `discord_id` set to `'-'`

---

## Error Handling

### No Match Found
- If employee name can't be matched to Discord user:
  - `discord_id` = `'-'`
  - Discord message still sent but without mention
  - Yellow card still issued

### API Failures
- If `/api/give-card` fails:
  - Workflow continues (doesn't stop loop)
  - Error logged in n8n execution logs
  - Discord notification still sent

### Missing Files
- Only employees missing `tasks` OR `plans` are processed
- Employees with both `tasks` AND `plans` = true are skipped
- `daily.md` is checked but doesn't trigger yellow cards

---

## File Path Structure

Expected Dropbox structure:
```
/Nov25/
  ├── <Department>/
  │   ├── <Employee>/
  │   │   ├── <Day>/
  │   │   │   ├── plans.md
  │   │   │   ├── daily.md
  │   │   │   └── task.md
```

**Example**:
```
/Nov25/Lead Generation/Zasiadko Matvii/03/plans.md
/Nov25/AI Team/Zasiadko Matvii/03/daily.md
/Nov25/AI Team/Zasiadko Matvii/03/task.md
```

---

## Workflow Status

- **Active**: `false` (currently disabled)
- **Execution Order**: `v1` (sequential)
- **Timezone**: Europe/Kyiv

---

## Maintenance Notes

### Updating Discord List
Edit `Code3` node to add/remove/modify Discord user mappings:
```javascript
staticData.emailList = [
  { name: "username", display_name: "Display Name", discord_id: "123456789" },
  // Add new entries here
];
```

### Changing Schedule
Edit `Schedule Trigger` node:
- Modify `triggerAtHour` (currently 11)
- Adjust timezone if needed

### Modifying File Filters
Edit `Code` node to change:
- Date extraction logic
- File type filters (`plans.md`, `daily.md`, `task.md`)
- Path structure parsing

### Adjusting Matching Threshold
Edit `Code2` node:
- Change `bestScore >= 50` to adjust minimum confidence
- Modify scoring weights for different match types

---

## Testing

To test the workflow manually:
1. Activate workflow in n8n
2. Click "Execute Workflow" button
3. Check execution logs for:
   - Files found in Dropbox
   - Employees matched to Discord
   - API calls to `/api/give-card`
   - Discord webhook responses

---

## Related Files

- **Backend API**: `/api/give-card.js` - Handles yellow card issuance
- **Database**: `lib/database.js` - Employee and violation management
- **Frontend**: Dashboard at `https://dashboard-eight-beta-59.vercel.app/`

---

## Version History

- **Initial Version**: Automated workflow for daily report checking
- **Integration**: Connected to dashboard API for yellow card issuance
- **Current Status**: Active workflow with Discord notifications

