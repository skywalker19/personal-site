# Server-side static build and release

GitHub Actions runs validation and a static build only. It does not connect to
the server. The server fetches the personal-site repository, builds its checked-in
static content, and promotes the generated files to nginx. Miller Words reports,
stories, illustrations, and PDFs are synchronized into personal-site and
committed before this server release step.

## Requirements

- Git read access to `skywalker19/personal-site`.
- Node.js 22, npm, and rsync or `cp` on the server.
- A server account that can write to `/var/www/personal-site/releases/` and
  update `/var/www/personal-site/current`.
- Nginx configured with [`nginx.conf.example`](nginx.conf.example), or an
  equivalent configuration pointing at `/var/www/personal-site/current`.

Do not store repository credentials in either checkout. Use the server's
approved Git credential or SSH-key mechanism. Miller Words pages are static
files in the personal-site repository; the published site makes no runtime
request to Miller Words.

## Build and release

For each release, use a fresh temporary directory:

```bash
BUILD_ROOT="$(mktemp -d)"
git clone --branch main --depth 1 https://github.com/skywalker19/personal-site.git "$BUILD_ROOT/personal-site"
cd "$BUILD_ROOT/personal-site"
npm ci
npm run check:sensitive
SITE_URL="http://150.109.196.200" npm run build
npm run check:sensitive -- --path dist
```

The checked-in personal-site repository already contains the reviewed Miller
Words static files. The server does not need to clone Miller Words, run Python,
or generate content. Its production build writes the site to
`personal-site/dist/`. Local synchronization, Git publication, and this server
release remain separate operations.

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
