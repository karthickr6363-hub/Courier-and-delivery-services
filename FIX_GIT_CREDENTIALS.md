# Fix Git 403 Permission Error

## Problem
Git is authenticating with the wrong GitHub account (`karthickkarthik`) when trying to push to `karthick64-alt` repository.

## Solution Options

### Option 1: Remove credentials via Windows Credential Manager (GUI)
1. Press `Win + R` and type: `control /name Microsoft.CredentialManager`
2. Go to **Windows Credentials**
3. Find and delete any entries related to:
   - `git:https://github.com`
   - `GitHub - https://api.github.com/karthickkarthik`
4. Try pushing again - you'll be prompted for credentials

### Option 2: Use Personal Access Token (Recommended)
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate a new token with `repo` permissions
3. Copy the token
4. When pushing, use the token as the password (username: `karthick64-alt`)

### Option 3: Update remote URL with username
Update the remote URL to include your GitHub username:
```
git remote set-url origin https://karthick64-alt@github.com/karthick64-alt/Courier-and-delivery-.git
```

### Option 4: Use SSH instead of HTTPS
1. Generate SSH key: `ssh-keygen -t ed25519 -C "karthickr6383@gmail.com"`
2. Add SSH key to GitHub account
3. Change remote URL: `git remote set-url origin git@github.com:karthick64-alt/Courier-and-delivery-.git`

