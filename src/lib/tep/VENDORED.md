# Vendored: Teno Event Protocol (TEP) TypeScript

This directory is a **vendored copy** of the TEP TypeScript implementation
from the [teno-event-protocol](https://github.com/asadbekabdulboqiyev/teno-event-protocol)
repository (commit `8c16c4f`, package `packages/tep-typescript`).

The package is not published to npm yet, so it is vendored here to keep nescom
self-contained and CI-friendly.

## Updating

Copy files from the upstream repo:

```bash
cp /path/to/teno-event-protocol/packages/tep-typescript/src/{types,errors,signature,envelope,idempotency,client,consumer,index}.ts src/lib/tep/
```

Then bump the commit hash in this file and re-run `npm test`.

> Note: these files are kept byte-identical with the upstream source and are
> excluded from Prettier via `.prettierignore`.