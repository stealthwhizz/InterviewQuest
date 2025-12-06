# Button Troubleshooting Guide

## Quick Checks

### 1. Open Browser Console
Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)

Look for any errors in the Console tab. Common issues:
- JavaScript errors
- Failed to load resources
- CORS errors

### 2. Test Simple Button
Open `test-buttons.html` in your browser. If this button works, the issue is specific to index.html.

### 3. Hard Refresh
Sometimes the browser caches old code:
- Windows: `Ctrl + F5` or `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### 4. Check Which Buttons Don't Work

**Menu Screen Buttons:**
- Start Game button
- Achievements button
- Instructions button

**Game Screen Buttons:**
- Submit Answer button
- Voice Input button
- Continue button

**Which specific button isn't working?**

## Common Issues & Fixes

### Issue 1: No Buttons Work
**Cause:** JavaScript not loading or error before initialization

**Fix:**
1. Open browser console (F12)
2. Look for red error messages
3. Share the error message

### Issue 2: Start Game Button Doesn't Show Boss Selection
**Cause:** Boss selection div not found or CSS issue

**Fix:**
1. Click Start Game
2. Open console
3. Check if you see: "Starting game with boss: ..."
4. If yes, it's a CSS issue
5. If no, it's a JavaScript issue

### Issue 3: Buttons Click But Nothing Happens
**Cause:** Event listeners not attached or callback functions missing

**Fix:**
1. Open console
2. Type: `document.getElementById('start-game-btn')`
3. If it returns `null`, the button doesn't exist
4. If it returns an element, the button exists but listener isn't attached

### Issue 4: Page Loads But Stays Blank
**Cause:** JavaScript error preventing initialization

**Fix:**
1. Check console for errors
2. Look for "Uncaught" or "TypeError" messages
3. The error will tell you which line is failing

## Debug Steps

### Step 1: Verify DOM is Ready
Open console and type:
```javascript
document.readyState
```
Should return: `"complete"`

### Step 2: Check if Button Exists
```javascript
document.getElementById('start-game-btn')
```
Should return: `<button id="start-game-btn">Start Game</button>`

### Step 3: Manually Attach Listener
```javascript
document.getElementById('start-game-btn').addEventListener('click', () => {
    alert('Button works!');
});
```
Then click the button. If alert shows, the button works but the original listener isn't attached.

### Step 4: Check Screen Manager
```javascript
window.screenManager
```
Should return: `ScreenManager {currentScreen: "menu", ...}`

If it returns `undefined`, screenManager didn't initialize.

## Quick Fixes

### Fix 1: Reload Page
Just refresh the page with `F5`

### Fix 2: Clear Cache
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Fix 3: Check File Path
Make sure you're opening `index.html` directly, not through a file path with spaces or special characters.

### Fix 4: Use Local Server
Instead of opening the file directly, use a local server:
```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js
npx serve .

# Option 3: VS Code
# Install "Live Server" extension and click "Go Live"
```

Then open: `http://localhost:8000/index.html`

## Still Not Working?

Share these details:
1. Which browser are you using? (Chrome, Firefox, Edge, Safari)
2. What happens when you click a button? (Nothing? Error? Something else?)
3. Any error messages in the console? (Copy the exact message)
4. Does `test-buttons.html` work?

## Expected Behavior

**Start Game Button:**
- Click → Boss selection appears below
- Scroll smoothly to boss selection
- Boss cards show (Junior Dev, Senior Engineer, FAANG Boss)

**Achievements Button:**
- Click → Navigate to achievements screen
- Show all 10 achievements with lock/unlock status

**Instructions Button:**
- Click → Navigate to instructions screen
- Show game rules and how to play

If buttons do something different, describe what happens!
