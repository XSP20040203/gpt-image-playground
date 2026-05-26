# XSP Image Manager

Windows local manager for XSP Image Playground.

## Output

- Desktop executable: `C:\Users\30272\Desktop\XSP Image Manager.exe`
- Project copy: `manager\publish\XSP Image Manager.exe`

## Features

- Start / stop / restart the local Next.js WebUI on port 3000.
- Start / stop the Cloudflare Tunnel named `xsp-image`.
- Check local and public domain status.
- Edit `.env.local` values:
  - `OPENAI_API_KEY`
  - `OPENAI_API_BASE_URL`
  - `NEXT_PUBLIC_DEFAULT_API_BASE_URL`
  - `NEXT_PUBLIC_IMAGE_STORAGE_MODE`
  - `ADMIN_PASSWORD`
- Run `npm run build` after changing frontend defaults.
- Show process output and diagnostics in the log window.

## Notes

After changing `NEXT_PUBLIC_DEFAULT_API_BASE_URL`, click **Rebuild** in the manager, then restart the service.
