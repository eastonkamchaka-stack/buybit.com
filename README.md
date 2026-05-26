# BUYBIT Dashboard

Static trading dashboard website for BUYBIT.

## Local development

Open the HTML files directly in a browser or serve them from a local static web server.

## Screenshot tooling

The repo includes a Playwright screenshot helper for responsive page captures:

```bash
npm install
npm run screenshot
```

Screenshots are saved to `screenshots/`.

## GitHub hosting

1. Create a new repository in your GitHub account.
2. Add the remote in this directory:

```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
```

3. Push the repository:

```bash
git push -u origin main
```

4. Enable GitHub Pages in repository settings:
   - Source: `main` branch
   - Folder: `/ (root)`

After that, your static site will be hosted at `https://<your-username>.github.io/<your-repo>/`.

---

Additional steps for this contract pack

1. Ensure the repository contains the contract files: `index.html`, `btc-compliance.html`, `styles.css`, `script.js`.
2. If you want the site to appear at the repository root, publish GitHub Pages using the `main` branch and root folder.
3. To create and push the repo from this folder using the GitHub CLI (requires `gh` installed and authenticated):

```bash
gh repo create <your-username>/buybit-contract-pack --public --source=. --push
```

If you prefer, I can run the local git commands for you here (init, add, commit). I cannot create the remote GitHub repository without your `gh` authentication configured locally or explicit token — tell me which option you prefer.
