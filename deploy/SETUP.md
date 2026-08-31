# One-time deployment setup

Normal publishing happens from Calvin's computer with `npm run publish`. These server steps are performed only once.

## 1. Preserve Drip Monitor

Before changing nginx, copy the current Drip Monitor `index.html`, `styles.css`, and `app.js` into:

```text
/var/www/drip-monitor/
```

Verify all three files exist. Do not remove the current root copy until `/drip-monitor/` works.

## 2. Prepare the homepage release directories

Create:

```text
/var/www/personal-site/releases/
```

Create a dedicated deployment user that can write only to `/var/www/personal-site/`. Do not deploy as `root`.

## 3. Configure nginx

Adapt `nginx.conf.example` to the server's existing configuration. Test the configuration before reloading nginx. Verify:

- `/drip-monitor/` loads its CSS and JavaScript;
- `/health.txt` returns `ok` after the first homepage deployment;
- unknown homepage routes serve `404.html`;
- the old configuration can be restored quickly.

## 4. Configure GitHub

In the repository, create a `production` environment with:

| Name | Kind | Value |
| --- | --- | --- |
| `DEPLOY_HOST` | Secret | `<DEPLOY_HOST>` |
| `DEPLOY_USER` | Secret | dedicated deployment username |
| `DEPLOY_PATH` | Secret | `/var/www/personal-site` |
| `DEPLOY_SSH_KEY` | Secret | private half of the restricted deployment key |
| `DEPLOY_KNOWN_HOSTS` | Secret | verified SSH host-key entry for the server |

Also create the repository-level variable `SITE_URL` with `https://example.com` while staging. It is used during the build job before the production environment is opened.

Restrict the environment to the `main` branch. Optional manual approval is useful for the first few deployments.

## 5. First deployment and rollback

Run the GitHub workflow manually or push to `main`. The workflow uploads `dist/` into a release named after the commit and updates `current` only after `health.txt` exists.

To roll back, point `/var/www/personal-site/current` at the preceding directory under `releases/`. Releases are intentionally not deleted automatically.

## 6. Public launch

After staging is stable:

1. attach the chosen domain;
2. enable HTTPS;
3. update the GitHub `SITE_URL` variable;
4. add the domain to nginx `server_name`;
5. rebuild so canonical URLs use the public domain.
