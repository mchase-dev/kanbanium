# Kanbanium User Guide

Welcome to Kanbanium! This guide will help you get started and make the most of all features.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Privacy and Cookie Preferences](#privacy-and-cookie-preferences)
3. [Managing Boards](#managing-boards)
4. [Working with Tasks](#working-with-tasks)
5. [Collaboration Features](#collaboration-features)
6. [Search and Filters](#search-and-filters)
7. [Personal Productivity](#personal-productivity)
8. [Tips and Best Practices](#tips-and-best-practices)

---

## Getting Started

### Creating an Account

1. Navigate to the Kanbanium login page
2. Click **"Sign Up"** or **"Register"**
3. Fill in your details:
   - **Username**: Choose a unique username
   - **Email**: Your email address
   - **Password**: Minimum 8 characters with uppercase, lowercase, and number
   - **First Name** and **Last Name**
4. Click **"Register"**
5. You'll be automatically logged in

### Logging In

1. Enter your **email or username**
2. Enter your **password**
3. Click **"Sign In"**

Your session will remain active for 60 minutes. When it expires, you'll be automatically logged out and asked to log in again.

### First Steps

After logging in, you'll see the **Dashboard** with:
- All boards you have access to
- Quick actions to create new boards
- Board statistics (tasks, columns, members)

---

## Privacy and Cookie Preferences

### Cookie Consent Banner

When you first visit Kanbanium, you'll see a cookie consent banner at the bottom of the screen.

**Options**:
- **Accept All**: Allow all cookies (essential, analytics, marketing)
- **Reject Non-Essential**: Allow only essential cookies required for the app to function
- **Customize**: Choose which cookie categories to enable

**Cookie Categories**:
1. **Essential Cookies**: Always enabled - required for authentication, security, and core functionality
2. **Analytics Cookies**: Optional - help us understand how visitors use the application
3. **Marketing Cookies**: Optional - used for advertising and tracking across websites

### Managing Cookie Preferences

You can change your cookie preferences at any time through the cookie consent banner settings modal.

**To Update Preferences**:
1. Click **"Customize"** on the cookie banner
2. Toggle analytics and marketing cookies on or off
3. Click **"Save Preferences"**

Your preferences are stored locally in your browser and persist across sessions.

### Privacy Policy

Review our complete privacy policy at **/privacy** to understand:
- What information we collect
- How we use your data
- Your privacy rights (GDPR/CCPA)
- Data security measures
- How to exercise your rights (access, deletion, correction)
- Contact information for privacy inquiries

### Cookie Policy

View detailed information about our cookie usage at **/cookie-policy** including:
- Types of cookies we use
- Cookie lifespan and purpose
- How to control cookies in your browser
- Third-party cookies
- How cookies help improve your experience

**Quick Access**:
- Cookie Policy: Available from the cookie banner links
- Privacy Policy: Available from the cookie banner links
- Both policies are accessible without requiring login

---

## Managing Boards

### Creating a Board

1. On the Dashboard, click **"Create Board"** button
2. Enter board details:
   - **Board Name**: Required (e.g., "Marketing Campaign", "Product Development")
   - **Description**: Optional description of the board's purpose
3. Click **"Create"**

**Result**: You're automatically added as the board owner/admin with full permissions.

### Viewing a Board

1. Click on any board card from the Dashboard
2. You'll see:
   - Board name and description at the top
   - Columns arranged horizontally
   - Tasks within each column
   - Board members indicator
   - Filter options

### Adding Columns

Boards start with no columns. To add columns:

1. Open a board
2. Click **"Add Column"** button
3. Enter column details:
   - **Column Name**: (e.g., "To Do", "In Progress", "Done")
   - **WIP Limit**: Optional work-in-progress limit
4. Click **"Create"**

**Common column setups**:
- **Basic**: To Do, In Progress, Done
- **Development**: Backlog, To Do, In Progress, Review, Done
- **Kanban**: Requested, In Progress, Blocked, Done

### Managing Columns

**Reordering Columns**:
- Drag and drop columns to reorder them

**Editing Columns**:
1. Click the settings icon on a column header
2. Select **"Edit Column"**
3. Update name or WIP limit
4. Click **"Save"**

**Deleting Columns**:
1. Click the settings icon on a column header
2. Select **"Delete Column"**
3. Confirm deletion

**Warning**: Deleting a column will also delete all tasks within it!

### Managing Board Members

**Adding Members**:
1. Click the **"Members"** button in the board header
2. Click **"Add Member"**
3. Search for a user by name or email
4. Select their role:
   - **Admin**: Full control (manage members, delete board)
   - **Member**: Can create and edit tasks
   - **Viewer**: Read-only access
5. Click **"Add"**

**Changing Member Roles**:
1. Open the Members modal
2. Find the member
3. Click the role dropdown
4. Select new role

**Removing Members**:
1. Open the Members modal
2. Click **"Remove"** next to the member's name
3. Confirm removal

### Archiving and Deleting Boards

**Archiving** (hide without deleting):
1. Click the settings menu (three dots) in board header
2. Select **"Archive Board"**
3. Archived boards can be restored later

**Deleting** (permanent):
1. Click the settings menu
2. Select **"Delete Board"**
3. Confirm deletion

**Warning**: Deletion is permanent and cannot be undone!

---

## Working with Tasks

### Creating a Task

1. On a board, click **"+ Add Task"** in any column
2. Fill in task details:
   - **Title**: Required (e.g., "Design new homepage")
   - **Description**: Optional detailed description
   - **Type**: Task, Bug, Feature, or Improvement
   - **Priority**: Low, Medium, High, or Critical
   - **Assignee**: Assign to a board member
   - **Due Date**: Optional deadline
   - **Sprint**: Optionally add to a sprint
   - **Labels**: Add color-coded labels
3. Click **"Create Task"**

### Viewing Task Details

Click on any task card to open the **Task Modal** with tabs:

**Details Tab**:
- Title, description, priority, due date
- Status, type, assignee
- Labels
- Edit button to modify details

**Subtasks Tab**:
- Create checklist items
- Track completion progress
- Mark items as complete/incomplete

**Comments Tab**:
- Add comments
- @mention other users
- Edit/delete your own comments

**Attachments Tab**:
- Upload files (max 10MB per file)
- Supported types: Images, PDFs, Office documents, archives
- Download or delete attachments

**Activity Tab**:
- Complete history of all changes
- Who made changes and when
- Old vs new values

**Watchers Tab**:
- Watch task to receive notifications
- See who else is watching
- Unwatch to stop notifications

### Moving Tasks (Drag and Drop)

**Between Columns**:
1. Click and hold a task card
2. Drag to another column
3. Drop to move

**Within a Column** (reordering):
1. Drag a task up or down
2. Drop in the desired position

All board members see the change in real-time!

### Editing Tasks

**Quick Edit** (from task card):
- Click the edit icon on a task card
- Update title, assignee, priority, or due date
- Click outside to save

**Full Edit** (from task modal):
1. Open the task
2. Click **"Edit"** button
3. Modify any field
4. Click **"Save Changes"**

### Adding Subtasks

1. Open a task
2. Go to **"Subtasks"** tab
3. Click **"Add Subtask"**
4. Enter subtask title
5. Press Enter or click **"Add"**

**Managing Subtasks**:
- Click checkbox to mark complete
- Click edit icon to rename
- Click delete icon to remove

Progress is shown as "X/Y completed" with a visual progress bar.

### Adding Labels

**Creating Labels**:
1. Open the Labels modal (from board header)
2. Click **"Create Label"**
3. Enter label name and choose a color
4. Click **"Create"**

**Adding Labels to Tasks**:
1. Open a task
2. Click **"Add Label"** in the task details
3. Select labels from the list
4. Click outside to close

**Removing Labels**:
- Click the X on any label badge

**Common Label Uses**:
- Categories: frontend, backend, design, documentation
- Urgency: urgent, needs-review, blocked
- Themes: feature-A, sprint-3, client-X

### Adding Comments

1. Open a task
2. Go to **"Comments"** tab
3. Type your comment in the text box
4. Click **"Add Comment"**

**@Mentions**:
- Type `@username` to mention someone
- They'll receive a real-time notification
- Mentioned text appears highlighted

**Editing Comments**:
- Click edit icon on your own comments
- Make changes
- Click "Save"

**Deleting Comments**:
- Click delete icon on your own comments
- Confirm deletion

### Uploading Attachments

1. Open a task
2. Go to **"Attachments"** tab
3. Click **"Upload"** or drag files into the upload area
4. Select file(s) from your computer
5. Wait for upload to complete

**File Restrictions**:
- Maximum file size: 10 MB
- Allowed types: Images (PNG, JPG, GIF), PDFs, Office files (DOC, XLS, PPT), Archives (ZIP)

**Downloading Attachments**:
- Click the download icon next to any attachment

**Deleting Attachments**:
- Click the delete icon (only on files you uploaded)

### Watching Tasks

Stay notified about task changes:

1. Open a task
2. Go to **"Watchers"** tab
3. Click **"Watch Task"**

You'll receive notifications when:
- Task is updated
- Comments are added
- Task is moved
- You're @mentioned

**Unwatching**:
- Click **"Unwatch Task"** to stop notifications

### Archiving Tasks

Hide completed or irrelevant tasks:

1. Open task details
2. Click settings menu (three dots)
3. Select **"Archive Task"**

Archived tasks can be viewed using the "Show Archived" filter.

### Deleting Tasks

Permanently remove a task:

1. Open task details
2. Click settings menu (three dots)
3. Select **"Delete Task"**
4. Confirm deletion

**Warning**: Deletion cannot be undone!

---

## Collaboration Features

### Real-Time Updates

Kanbanium uses WebSocket technology for live collaboration:

**What Updates in Real-Time**:
- Task movements (drag and drop)
- Task updates (title, description, priority, etc.)
- New tasks created
- Tasks deleted
- Comments added
- Members added/removed

All users viewing the same board see changes instantly!

### @Mentions in Comments

Notify team members about specific tasks:

1. In a comment, type `@` followed by username
2. Select from the autocomplete list
3. Add comment
4. Mentioned user receives notification

**Example**: "Hey @johnsmith, can you review this design?"

### Activity History

Track all changes made to a task:

1. Open a task
2. Go to **"Activity"** tab
3. See chronological list of all changes

**Activity Types**:
- Task created
- Title/description changed
- Priority updated
- Assignee changed
- Task moved to different column
- Status changed
- Comments added
- Labels added/removed

Each entry shows:
- Who made the change
- When it was made (relative time)
- What changed (old → new values)

### Sprint Management

Plan work in time-boxed iterations:

**Creating a Sprint**:
1. Navigate to board settings
2. Select **"Sprints"**
3. Click **"Create Sprint"**
4. Enter:
   - Sprint name (e.g., "Sprint 12")
   - Sprint goal (objective)
   - Start date
   - End date
5. Click **"Create"**

**Adding Tasks to Sprint**:
1. Edit a task
2. Select sprint from dropdown
3. Save

**Sprint Actions**:
- **Start Sprint**: Mark as active
- **Complete Sprint**: Mark as finished
- **View Sprint Tasks**: Filter by sprint

---

## Search and Filters

### Search Tasks

Find tasks quickly:

1. Use the search box at top of board
2. Type task title or description keywords
3. Results update as you type (debounced)

**Search Tips**:
- Search is case-insensitive
- Searches both title and description
- Partial matches work (e.g., "des" finds "Design homepage")

### Filter Tasks

Narrow down tasks using filters:

**Available Filters**:
- **Status**: To Do, In Progress, Done, etc.
- **Type**: Task, Bug, Feature, Improvement
- **Priority**: Low, Medium, High, Critical
- **Assignee**: Filter by assigned user
- **Labels**: Filter by label
- **Sprint**: Filter by sprint
- **Show Archived**: Include archived tasks

**Applying Filters**:
1. Click **"Filters"** button
2. Select filter criteria
3. Click **"Apply"**

**Active Filters**:
- Shown as badges below search box
- Click X on any badge to remove that filter
- Click **"Clear All"** to reset all filters

**Filter Persistence**:
- Filters are saved in URL
- Refresh page to keep same filters
- Share URL with team to share filtered view

---

## Personal Productivity

### My Tasks Page

View all your assigned tasks across all boards:

1. Click **"My Tasks"** in sidebar
2. See table of all tasks assigned to you

**Features**:
- **Board Column**: Shows which board each task is from
- **Status**: Current status of task
- **Priority**: Visual priority indicator
- **Due Date**: Deadline (red if overdue)
- **Labels**: All task labels
- **Subtasks**: Progress (e.g., "2/5 completed")

**Filtering My Tasks**:
- Filter by status
- Filter by priority
- **Overdue Only**: Toggle to show only overdue tasks

**Sorting**:
- Sort by due date (show urgent tasks first)
- Sort by priority
- Sort by created date

**Quick Navigation**:
- Click any task row to jump to that board

### Activity Feed

See recent activity across all your boards:

1. Click **"Activity"** in sidebar
2. View timeline of recent changes

**Activity Feed Shows**:
- Task created
- Tasks updated
- Tasks moved
- Comments added
- Assignments changed
- All activity from boards you're a member of

**Filtering Activity**:
- Filter by board
- Filter by action type
- Change result limit (25, 50, or 100)

**Staying Informed**:
- Check activity feed daily to stay updated
- See what your team is working on
- Track progress without opening each board

### User Profile

Manage your account:

1. Click your avatar in top-right
2. Select **"Profile"**
3. Update:
   - First name
   - Last name
   - Email address
4. Click **"Save"**

**Changing Password**:
1. Go to Profile
2. Click **"Change Password"**
3. Enter current password
4. Enter new password (8+ chars, mixed case, number)
5. Confirm new password
6. Click **"Update Password"**

---

## Tips and Best Practices

### Board Organization

**DO**:
- Use clear, descriptive board names
- Keep column names short and clear
- Add board descriptions to explain purpose
- Archive old boards instead of deleting

**DON'T**:
- Create too many columns (3-6 is ideal)
- Have vague column names like "Stuff" or "Things"
- Leave board descriptions empty

### Task Management

**DO**:
- Write clear, actionable task titles
- Use descriptions for context and requirements
- Set priorities appropriately (not everything is Critical!)
- Add due dates for time-sensitive tasks
- Break large tasks into subtasks
- Use labels consistently across the board

**DON'T**:
- Create duplicate tasks
- Use task titles as full descriptions
- Set unrealistic due dates
- Over-assign (one task per person works best)

### Collaboration

**DO**:
- @mention people in comments to get their attention
- Watch important tasks for updates
- Add comments to explain changes
- Update task status promptly
- Respond to @mentions
- Use activity feed to stay informed

**DON'T**:
- Make major changes without commenting why
- Ignore @mentions
- Over-mention (don't spam notifications)
- Leave tasks unassigned indefinitely

### Labels

**DO**:
- Create a color scheme (e.g., red=urgent, blue=frontend)
- Use labels consistently
- Document label meanings for team
- Remove unused labels

**DON'T**:
- Create too many labels (10-15 max recommended)
- Use similar colors for different purposes
- Change label meanings midway through project

### Performance

**Tips for Smooth Experience**:
- Archive old tasks instead of deleting
- Use filters to focus on relevant tasks
- Limit WIP (work in progress) per column
- Close task modals when done viewing
- Keep attachments under 5MB when possible

---

## Keyboard Shortcuts

_(Note: These may vary based on implementation)_

| Shortcut | Action |
|----------|--------|
| `/` | Focus search box |
| `Esc` | Close modal |
| `N` | New task (when on board) |
| `B` | New board (when on dashboard) |

---

## Getting Help

### Common Issues

**Can't see a board**:
- Check if you're a member (ask board owner to add you)
- Board might be archived (check archived boards)

**Real-time updates not working**:
- Check internet connection
- Refresh the page
- Clear browser cache

**Can't upload files**:
- Check file size (must be under 10MB)
- Verify file type is allowed
- Try a different browser

**Forgot password**:
- Use "Forgot Password" on login page
- Contact system administrator
