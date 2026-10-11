# Server-side static build and release

GitHub Actions runs validation and a static build only. It does not connect to
the server. The server fetches both source repositories, integrates the latest
Miller Words data into a clean personal-site checkout, builds the site, and
promotes the generated files to nginx.

## Requirements

- Git read access to `skywalker19/home-site` and `skywalker19/miller-words`.
- Python 3, Node.js 22, npm, and rsync or `cp` on the server.
- A server account that can write to `/var/www/personal-site/releases/` and
  update `/var/www/personal-site/current`.
- Nginx configured with [`nginx.conf.example`](nginx.conf.example), or an
  equivalent configuration pointing at `/var/www/personal-site/current`.

Do not store repository credentials in either checkout. Use the server's
approved Git credential or SSH-key mechanism. The Miller Words integration is
static: it reads the repository during the build and makes no runtime request
from the published site.

## Build and release

For each release, use a fresh temporary directory. The two checkouts must be
siblings because `miller-words/scripts/make_overall_report.py` and
`sync_personal_site_report.py` locate `personal-site` next to the Miller Words
checkout. A fresh workspace also keeps generated files out of the canonical
Miller Words checkout.

```bash
BUILD_ROOT="$(mktemp -d)"
git clone --branch main --depth 1 https://github.com/skywalker19/home-site.git "$BUILD_ROOT/personal-site"
git clone --branch main --depth 1 https://github.com/skywalker19/miller-words.git "$BUILD_ROOT/miller-words"

cd "$BUILD_ROOT/miller-words"
python3 scripts/make_overall_report.py
python3 scripts/sync_personal_site_report.py

cd "$BUILD_ROOT/personal-site"
npm ci
npm run check:sensitive
SITE_URL="http://150.109.196.200" npm run build
npm run check:sensitive -- --path dist
```

The generator prepares the report and site files from the fetched Miller Words
source. The sync script copies those files into the sibling personal-site
checkout and checks that the site files have not changed since staging. The
production build then writes the static site to `personal-site/dist/`.

After reviewing the build, copy its contents into a new release and switch the
nginx symlink. The following uses the existing paths from
[`nginx.conf.example`](nginx.conf.example):

```bash
RELEASE_ID="$(date +%Y%m%d%H%M%S)-$(git -C "$BUILD_ROOT/personal-site" rev-parse --short=12 HEAD)"
RELEASE="/var/www/personal-site/releases/$RELEASE_ID"
install -d "$RELEASE"
cp -a "$BUILD_ROOT/personal-site/dist/." "$RELEASE/"
test -f "$RELEASE/health.txt"
ln -sfn "$RELEASE" /var/www/personal-site/current
```

Keep the previous release so it can be restored if the new site has a problem.
Once the release is live, the temporary build workspace can be removed.

## GitHub Actions

The `Check personal-site` workflow runs on pull requests and pushes to `main`.
It checks sensitive data and builds the site; it has no production environment,
SSH credentials, artifact upload, or deploy job. `workflow_dispatch` runs the
same checks manually.

The build uses the repository variable `SITE_URL` when configured; local and
server builds can set it in the environment. The sensitive-data check can use
`PROTECTED_USERNAMES` as an environment variable when needed.
